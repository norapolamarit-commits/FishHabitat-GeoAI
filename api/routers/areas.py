from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException

router = APIRouter()

MODELS_ROOT = Path(__file__).resolve().parent.parent / "models"

# Real, approximate geographic subdivisions of the study region — not
# precise administrative boundaries, but genuine coastal geography, used to
# aggregate the real grid data by area rather than inventing zone-specific
# numbers.
ZONES = [
    {
        "id": "upper_gulf",
        "name": "Upper Gulf of Thailand",
        "bounds": {"lat_min": 12.0, "lat_max": 14.0, "lon_min": 99.5, "lon_max": 101.5},
    },
    {
        "id": "lower_gulf",
        "name": "Lower Gulf of Thailand",
        "bounds": {"lat_min": 5.0, "lat_max": 12.0, "lon_min": 99.0, "lon_max": 106.0},
    },
    {
        "id": "upper_andaman",
        "name": "Upper Andaman Coast",
        "bounds": {"lat_min": 8.0, "lat_max": 14.0, "lon_min": 97.0, "lon_max": 99.0},
    },
    {
        "id": "lower_andaman",
        "name": "Lower Andaman Coast",
        "bounds": {"lat_min": 5.0, "lat_max": 8.0, "lon_min": 97.0, "lon_max": 99.0},
    },
]

AGG_COLUMNS = [
    "sst_c",
    "chl_mg_m3",
    "salinity_psu",
    "depth_m",
    "wind_speed_kmh",
    "wave_height_m",
    "current_velocity_kmh",
    "suitability_pred",
    "risk_score",
]


def _load_feature_table() -> pd.DataFrame:
    path = MODELS_ROOT / "feature_table.csv"
    if not path.exists():
        raise HTTPException(
            status_code=503,
            detail="No trained model/feature table yet. Run: python -m pipeline.train_ensemble",
        )
    return pd.read_csv(path)


@router.get("")
def list_areas():
    return {"zones": ZONES}


@router.get("/{zone_id}")
def area_detail(zone_id: str):
    zone = next((z for z in ZONES if z["id"] == zone_id), None)
    if zone is None:
        raise HTTPException(status_code=404, detail=f"Unknown zone '{zone_id}'")

    df = _load_feature_table()
    b = zone["bounds"]
    subset = df[
        (df["lat"] >= b["lat_min"])
        & (df["lat"] <= b["lat_max"])
        & (df["lon"] >= b["lon_min"])
        & (df["lon"] <= b["lon_max"])
    ]

    if subset.empty:
        return {"zone": zone, "n_cells": 0, "stats": None}

    stats = {col: round(float(subset[col].mean()), 4) for col in AGG_COLUMNS}
    stats_range = {
        col: {"min": round(float(subset[col].min()), 4), "max": round(float(subset[col].max()), 4)}
        for col in AGG_COLUMNS
    }
    return {
        "zone": zone,
        "n_cells": len(subset),
        "stats": stats,
        "stats_range": stats_range,
        "data_basis_note": "Means computed from the same real cached grid used by the Map/Analytics pages.",
    }
