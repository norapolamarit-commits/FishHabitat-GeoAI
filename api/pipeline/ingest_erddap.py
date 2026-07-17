"""Real oceanographic grid data from NOAA CoastWatch ERDDAP (no auth).

Every function here issues a real griddap CSV request against a live public
server and resamples the response onto the project's canonical grid
(pipeline.common.snap_to_grid). If a fetch fails, it raises — callers must
not paper over that with fabricated numbers.

Verified live 2026-07-16 against https://coastwatch.pfeg.noaa.gov/erddap :
  - jplMURSST41              real-time SST, ~1km, daily
  - nesdisVHNnoaa20chlaWeekly real VIIRS NOAA-20 chlorophyll-a, 4km, weekly composite
                              (weekly, not daily, chosen because the daily
                              composite is frequently fully cloud-masked over
                              this bbox)
  - etopo180                 real static bathymetry/topography, ~1/6 deg
"""

import io

import pandas as pd

from config import BBOX
from pipeline.common import cached_text_get, erddap_stride_for, snap_to_grid

ERDDAP_BASE = "https://coastwatch.pfeg.noaa.gov/erddap/griddap"

# native grid spacing of each dataset, in degrees (used to pick a stride that
# approximates the project's canonical GRID_STEP_DEG without over-fetching)
_NATIVE_RES = {
    "jplMURSST41": 0.01,
    "nesdisVHNnoaa20chlaWeekly": 0.0375,
    "etopo180": 1.0 / 6.0,
}


def _griddap_csv(
    dataset_id: str, variable: str, has_time: bool, has_altitude: bool, cache_key: str
) -> pd.DataFrame:
    stride = erddap_stride_for(_NATIVE_RES[dataset_id])
    lat_sel = f"({BBOX['lat_min']}):{stride}:({BBOX['lat_max']})"
    lon_sel = f"({BBOX['lon_min']}):{stride}:({BBOX['lon_max']})"
    prefix = ""
    if has_time:
        prefix += "[(last)]"
    if has_altitude:
        prefix += "[(0.0)]"
    query = f"{variable}{prefix}[{lat_sel}][{lon_sel}]"
    url = f"{ERDDAP_BASE}/{dataset_id}.csv?{query}"
    text = cached_text_get(url, cache_key)
    df = pd.read_csv(io.StringIO(text), skiprows=[1])  # row 1 is the units row
    return df


def fetch_sst() -> pd.DataFrame:
    """Real analysed sea surface temperature (degrees C), latest available day."""
    df = _griddap_csv(
        "jplMURSST41", "analysed_sst", has_time=True, has_altitude=False, cache_key="sst_raw"
    )
    return snap_to_grid(df, "latitude", "longitude", "analysed_sst").rename(
        columns={"analysed_sst": "sst_c"}
    )


def fetch_chlorophyll() -> pd.DataFrame:
    """Real VIIRS NOAA-20 chlorophyll-a (mg/m^3), latest weekly composite."""
    df = _griddap_csv(
        "nesdisVHNnoaa20chlaWeekly",
        "chlor_a",
        has_time=True,
        has_altitude=True,
        cache_key="chl_raw",
    )
    return snap_to_grid(df, "latitude", "longitude", "chlor_a").rename(
        columns={"chlor_a": "chl_mg_m3"}
    )


def fetch_bathymetry() -> pd.DataFrame:
    """Real ETOPO bathymetry/topography (meters, negative = underwater)."""
    df = _griddap_csv(
        "etopo180", "altitude", has_time=False, has_altitude=False, cache_key="bathy_raw"
    )
    return snap_to_grid(df, "latitude", "longitude", "altitude").rename(
        columns={"altitude": "depth_m"}
    )


def fetch_sst_timeseries(lat: float, lon: float, days: int = 365) -> pd.DataFrame:
    """Real historical daily SST at a single point, for the LSTM's temporal
    training data. jplMURSST41's full archive goes back to 2002. Uses an
    explicit absolute date range (ERDDAP's relative "last-N" time syntax is
    index-based and unreliable across datasets, so real calendar dates are
    computed here instead of guessing at query syntax)."""
    import datetime

    end = datetime.date.today() - datetime.timedelta(days=2)  # allow for real processing lag
    start = end - datetime.timedelta(days=days)
    query = (
        f"analysed_sst[({start.isoformat()}):({end.isoformat()})]"
        f"[({lat}):({lat})][({lon}):({lon})]"
    )
    url = f"{ERDDAP_BASE}/jplMURSST41.csv?{query}"
    text = cached_text_get(url, f"sst_ts_{lat}_{lon}_{days}", max_age_seconds=24 * 3600)
    df = pd.read_csv(io.StringIO(text), skiprows=[1])
    df["time"] = pd.to_datetime(df["time"])
    return df[["time", "analysed_sst"]].rename(columns={"analysed_sst": "sst_c"})


if __name__ == "__main__":
    print("Fetching real SST...")
    sst = fetch_sst()
    print(sst.describe())
    print("\nFetching real chlorophyll-a...")
    chl = fetch_chlorophyll()
    print(chl.describe())
    print("\nFetching real bathymetry...")
    bathy = fetch_bathymetry()
    print(bathy.describe())
