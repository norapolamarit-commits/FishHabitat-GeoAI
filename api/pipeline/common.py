"""Shared helpers for the data ingestion pipeline: disk caching for real
HTTP responses (so repeated dev runs don't hammer public servers) and a
nearest-neighbor snap onto the project's canonical analysis grid.

The cache stores real fetched bytes only — if a fetch fails, callers get an
exception, never a silently fabricated fallback value.
"""

import time
from pathlib import Path

import httpx
import numpy as np
import pandas as pd

from config import BBOX, CACHE_DIR, GRID_STEP_DEG

CACHE_ROOT = Path(__file__).resolve().parent.parent / CACHE_DIR
CACHE_ROOT.mkdir(exist_ok=True)

# Some NOAA-hosted mirrors (coastwatch.noaa.gov) 403 requests carrying
# httpx's default User-Agent. A browser-like one is required, not optional.
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}


def cached_text_get(url: str, cache_key: str, max_age_seconds: int = 6 * 3600) -> str:
    path = CACHE_ROOT / f"{cache_key}.txt"
    if path.exists() and (time.time() - path.stat().st_mtime) < max_age_seconds:
        return path.read_text()
    resp = httpx.get(url, timeout=60.0, follow_redirects=True, headers=_HEADERS)
    resp.raise_for_status()
    path.write_text(resp.text)
    return resp.text


def cached_bytes_get(url: str, cache_key: str, max_age_seconds: int = 6 * 3600) -> bytes:
    path = CACHE_ROOT / f"{cache_key}.bin"
    if path.exists() and (time.time() - path.stat().st_mtime) < max_age_seconds:
        return path.read_bytes()
    resp = httpx.get(url, timeout=60.0, follow_redirects=True, headers=_HEADERS)
    resp.raise_for_status()
    path.write_bytes(resp.content)
    return resp.content


def cached_json_get(url: str, cache_key: str, max_age_seconds: int = 6 * 3600):
    import json

    path = CACHE_ROOT / f"{cache_key}.json"
    if path.exists() and (time.time() - path.stat().st_mtime) < max_age_seconds:
        return json.loads(path.read_text())
    resp = httpx.get(url, timeout=60.0, follow_redirects=True, headers=_HEADERS)
    resp.raise_for_status()
    data = resp.json()
    path.write_text(json.dumps(data))
    return data


def build_grid() -> pd.DataFrame:
    """The canonical analysis grid every real data source gets resampled onto."""
    lats = np.arange(BBOX["lat_min"], BBOX["lat_max"] + 1e-9, GRID_STEP_DEG)
    lons = np.arange(BBOX["lon_min"], BBOX["lon_max"] + 1e-9, GRID_STEP_DEG)
    grid_lat, grid_lon = np.meshgrid(lats, lons, indexing="ij")
    return pd.DataFrame({"lat": grid_lat.ravel(), "lon": grid_lon.ravel()})


def snap_to_grid(df: pd.DataFrame, lat_col: str, lon_col: str, value_col: str) -> pd.DataFrame:
    """Resample a real dataset's native-resolution points onto the canonical
    grid via nearest-cell assignment + mean aggregation. This is a standard,
    disclosed resampling step — not an interpolation that invents new values
    beyond what the real source measured."""
    lats = np.arange(BBOX["lat_min"], BBOX["lat_max"] + 1e-9, GRID_STEP_DEG)
    lons = np.arange(BBOX["lon_min"], BBOX["lon_max"] + 1e-9, GRID_STEP_DEG)

    df = df.dropna(subset=[value_col]).copy()
    if df.empty:
        return pd.DataFrame(columns=["lat", "lon", value_col])

    lat_idx = _nearest_index(df[lat_col].values, lats)
    lon_idx = _nearest_index(df[lon_col].values, lons)

    df["_lat_snap"] = lats[lat_idx]
    df["_lon_snap"] = lons[lon_idx]

    out = (
        df.groupby(["_lat_snap", "_lon_snap"], as_index=False)[value_col]
        .mean()
        .rename(columns={"_lat_snap": "lat", "_lon_snap": "lon"})
    )
    return out


def _nearest_index(values: np.ndarray, axis: np.ndarray) -> np.ndarray:
    idx = np.searchsorted(axis, values)
    idx = np.clip(idx, 1, len(axis) - 1)
    left = axis[idx - 1]
    right = axis[idx]
    choose_left = np.abs(values - left) < np.abs(values - right)
    return np.where(choose_left, idx - 1, idx)


def erddap_stride_for(native_resolution_deg: float) -> int:
    """Compute the griddap index stride that approximates the project's
    GRID_STEP_DEG target resolution, given a dataset's native grid spacing."""
    stride = round(GRID_STEP_DEG / native_resolution_deg)
    return max(stride, 1)
