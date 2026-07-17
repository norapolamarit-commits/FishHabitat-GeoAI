"""Real historical sea surface salinity from NRL HYCOM+NCODA GLBu0.08 expt 91.2
reanalysis (2016-2018), via NOAA ERDDAP (no auth).

No live no-auth salinity feed exists for this region (verified: SMOS satellite
salinity is almost entirely cloud/land-masked over the semi-enclosed Gulf of
Thailand). Instead this averages 4 real seasonal snapshots from the archive
into a representative climatology — real measured values, explicitly not a
live reading. ERDDAP snaps an arbitrary ISO date to the nearest actual time
step in the archive, confirmed live 2026-07-16.
"""

import io

import pandas as pd

from config import BBOX
from pipeline.common import cached_text_get, erddap_stride_for, snap_to_grid

ERDDAP_BASE = "https://coastwatch.pfeg.noaa.gov/erddap/griddap"
DATASET_ID = "nrlHycomGLBu008e912D"
NATIVE_RES_DEG = 0.08

# Four real snapshots spread across the archive's actual 2016-2018 coverage,
# chosen to sample different seasons/years rather than one arbitrary date.
REPRESENTATIVE_DATES = ["2016-07-15", "2017-01-15", "2017-07-15", "2018-01-15"]


def fetch_salinity_climatology() -> pd.DataFrame:
    stride = erddap_stride_for(NATIVE_RES_DEG)
    lat_sel = f"({BBOX['lat_min']}):{stride}:({BBOX['lat_max']})"
    lon_sel = f"({BBOX['lon_min']}):{stride}:({BBOX['lon_max']})"

    snapshots = []
    for date in REPRESENTATIVE_DATES:
        query = f"salinity[({date})][(0.0)][{lat_sel}][{lon_sel}]"
        url = f"{ERDDAP_BASE}/{DATASET_ID}.csv?{query}"
        text = cached_text_get(url, f"salinity_{date}", max_age_seconds=30 * 24 * 3600)
        df = pd.read_csv(io.StringIO(text), skiprows=[1])
        snapshots.append(df[["latitude", "longitude", "salinity"]])

    combined = pd.concat(snapshots, ignore_index=True)
    grid_mean = (
        combined.dropna(subset=["salinity"])
        .groupby(["latitude", "longitude"], as_index=False)["salinity"]
        .mean()
    )
    return snap_to_grid(grid_mean, "latitude", "longitude", "salinity").rename(
        columns={"salinity": "salinity_psu"}
    )


if __name__ == "__main__":
    df = fetch_salinity_climatology()
    print(df.describe())
