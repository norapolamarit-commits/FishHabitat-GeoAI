"""Single source of truth for assembling the full feature table — imported by
both train_ensemble.py (training) and the predict router (serving) so the
two paths can never drift apart (the exact bug class this pattern exists to
prevent, per this project's established engineering practice).
"""

import numpy as np
import pandas as pd

from pipeline.common import build_grid
from pipeline.hsi_formula import compute_hsi
from pipeline.image_features import assign_nearest_tile_embedding, compute_regional_image_embeddings
from pipeline.ingest_erddap import fetch_bathymetry, fetch_chlorophyll, fetch_sst
from pipeline.ingest_openmeteo import fetch_marine, fetch_wind
from pipeline.ingest_salinity import fetch_salinity_climatology
from pipeline.temporal_features import assign_nearest_station_embedding, compute_station_embeddings

ENV_FEATURE_COLUMNS = [
    "sst_c",
    "chl_mg_m3",
    "depth_m",
    "salinity_psu",
    "wind_speed_kmh",
    "wind_direction_deg",
    "wave_height_m",
    "current_velocity_kmh",
    "current_direction_deg",
]


def build_environmental_table() -> pd.DataFrame:
    """Real multi-source environmental grid: an inner join of every real data
    source on the canonical (lat, lon) grid. Cells that are on land, or that
    any source couldn't cover (e.g. Open-Meteo Marine has no data on land),
    are naturally dropped here rather than filled with invented values."""
    sst = fetch_sst()
    chl = fetch_chlorophyll()
    bathy = fetch_bathymetry()
    salinity = fetch_salinity_climatology()
    wind = fetch_wind()
    marine = fetch_marine()

    df = sst.merge(chl, on=["lat", "lon"], how="inner")
    df = df.merge(bathy, on=["lat", "lon"], how="inner")
    df = df.merge(salinity, on=["lat", "lon"], how="inner")
    df = df.merge(wind, on=["lat", "lon"], how="inner")
    df = df.merge(marine, on=["lat", "lon"], how="inner")
    return df.dropna(subset=ENV_FEATURE_COLUMNS).reset_index(drop=True)


def build_full_feature_table(species_key: str = "Katsuwonus pelamis") -> tuple[pd.DataFrame, dict]:
    """Returns (feature_table, provenance) where feature_table has one row
    per real, valid grid cell with environmental + image + temporal features
    and the literature-proxy HSI target column, and provenance documents
    exactly what real sources fed it (for the UI's transparency badges)."""
    env = build_environmental_table()

    image_tiles = compute_regional_image_embeddings()
    image_feats = assign_nearest_tile_embedding(env["lat"].values, env["lon"].values, image_tiles)
    image_cols = [f"img_{i}" for i in range(image_feats.shape[1])]
    env[image_cols] = image_feats

    station_embeds = compute_station_embeddings()
    temporal_feats = assign_nearest_station_embedding(
        env["lat"].values, env["lon"].values, station_embeds
    )
    temporal_cols = [f"temporal_{i}" for i in range(temporal_feats.shape[1])]
    env[temporal_cols] = temporal_feats

    labeled = compute_hsi(env, species_key=species_key)

    provenance = {
        "n_grid_cells": len(labeled),
        "n_image_tiles": len(image_tiles),
        "n_temporal_stations": len(station_embeds),
        "env_feature_columns": ENV_FEATURE_COLUMNS,
        "image_feature_columns": image_cols,
        "temporal_feature_columns": temporal_cols,
    }
    return labeled, provenance


if __name__ == "__main__":
    table, prov = build_full_feature_table()
    print(prov)
    print(table.describe())
