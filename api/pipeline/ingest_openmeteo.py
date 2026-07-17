"""Real wind/wave/current data from Open-Meteo (free, no auth).

Open-Meteo is a point API, not a grid API, so we batch the canonical grid
into chunks of BATCH_SIZE locations per request (confirmed working with
multi-location comma-separated lat/lon params).
"""

import pandas as pd

from pipeline.common import build_grid, cached_json_get, snap_to_grid

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
MARINE_URL = "https://marine-api.open-meteo.com/v1/marine"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

BATCH_SIZE = 40


def _batched(seq, n):
    for i in range(0, len(seq), n):
        yield seq[i : i + n]


def _batch_request(base_url: str, lats, lons, hourly_vars: str, cache_prefix: str) -> list[dict]:
    results = []
    idx_pairs = list(zip(lats, lons))
    for batch_i, chunk in enumerate(_batched(idx_pairs, BATCH_SIZE)):
        lat_str = ",".join(f"{la:.4f}" for la, lo in chunk)
        lon_str = ",".join(f"{lo:.4f}" for la, lo in chunk)
        url = (
            f"{base_url}?latitude={lat_str}&longitude={lon_str}"
            f"&hourly={hourly_vars}&forecast_days=1"
        )
        data = cached_json_get(url, f"{cache_prefix}_{batch_i}")
        # single-location requests return a dict, not a list
        batch_results = data if isinstance(data, list) else [data]
        results.extend(batch_results)
    return results


def fetch_wind() -> pd.DataFrame:
    """Real 10m wind speed (km/h) and direction (deg), latest hourly value per grid cell."""
    grid = build_grid()
    responses = _batch_request(
        FORECAST_URL, grid["lat"], grid["lon"], "wind_speed_10m,wind_direction_10m", "wind"
    )
    rows = []
    for r in responses:
        h = r["hourly"]
        rows.append(
            {
                # Open-Meteo snaps to its own internal model grid and returns
                # that point's real coordinates, not the ones requested —
                # must snap onto our canonical grid before any merge.
                "lat_raw": r["latitude"],
                "lon_raw": r["longitude"],
                "wind_speed_kmh": h["wind_speed_10m"][0],
                "wind_direction_deg": h["wind_direction_10m"][0],
            }
        )
    df = pd.DataFrame(rows)
    speed = snap_to_grid(df, "lat_raw", "lon_raw", "wind_speed_kmh")
    direction = snap_to_grid(df, "lat_raw", "lon_raw", "wind_direction_deg")
    return speed.merge(direction, on=["lat", "lon"], how="inner")


def fetch_marine() -> pd.DataFrame:
    """Real significant wave height (m) and ocean current velocity (km/h) / direction (deg)."""
    grid = build_grid()
    responses = _batch_request(
        MARINE_URL,
        grid["lat"],
        grid["lon"],
        "wave_height,ocean_current_velocity,ocean_current_direction",
        "marine",
    )
    rows = []
    for r in responses:
        h = r["hourly"]
        rows.append(
            {
                "lat_raw": r["latitude"],
                "lon_raw": r["longitude"],
                "wave_height_m": h["wave_height"][0],
                "current_velocity_kmh": h["ocean_current_velocity"][0],
                "current_direction_deg": h["ocean_current_direction"][0],
            }
        )
    df = pd.DataFrame(rows)
    wave = snap_to_grid(df, "lat_raw", "lon_raw", "wave_height_m")
    vel = snap_to_grid(df, "lat_raw", "lon_raw", "current_velocity_kmh")
    direction = snap_to_grid(df, "lat_raw", "lon_raw", "current_direction_deg")
    return wave.merge(vel, on=["lat", "lon"], how="inner").merge(
        direction, on=["lat", "lon"], how="inner"
    )


def fetch_era5_timeseries(lat: float, lon: float, start_date: str, end_date: str) -> pd.DataFrame:
    """Real ECMWF ERA5 reanalysis daily mean 2m air temperature, via Open-Meteo's
    free archive mirror (no auth). Used as an auxiliary climate-context feature."""
    url = (
        f"{ARCHIVE_URL}?latitude={lat}&longitude={lon}"
        f"&start_date={start_date}&end_date={end_date}"
        f"&daily=temperature_2m_mean&models=era5"
    )
    data = cached_json_get(url, f"era5_{lat}_{lon}_{start_date}_{end_date}", max_age_seconds=7 * 24 * 3600)
    d = data["daily"]
    return pd.DataFrame({"date": d["time"], "air_temp_2m_c": d["temperature_2m_mean"]})


if __name__ == "__main__":
    print("Fetching real wind...")
    wind = fetch_wind()
    print(wind.describe())
    print("\nFetching real wave/current...")
    marine = fetch_marine()
    print(marine.describe())
