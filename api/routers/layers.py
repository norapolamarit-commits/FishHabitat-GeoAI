import json
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException

from config import BBOX, DATA_BASIS

router = APIRouter()

MODELS_ROOT = Path(__file__).resolve().parent.parent / "models"

LAYER_META = {
    "sst_c": {"label": "Sea Surface Temperature", "unit": "°C", "data_basis": DATA_BASIS["REAL_OBSERVED"], "colormap": "thermal"},
    "chl_mg_m3": {"label": "Chlorophyll-a", "unit": "mg/m³", "data_basis": DATA_BASIS["REAL_OBSERVED"], "colormap": "algae"},
    "salinity_psu": {"label": "Salinity", "unit": "PSU", "data_basis": DATA_BASIS["REAL_OBSERVED"], "colormap": "haline"},
    "depth_m": {"label": "Bathymetry", "unit": "m", "data_basis": DATA_BASIS["REAL_OBSERVED"], "colormap": "deep"},
    "wind_speed_kmh": {"label": "Wind Speed", "unit": "km/h", "data_basis": DATA_BASIS["REAL_OBSERVED"], "colormap": "speed"},
    "wave_height_m": {"label": "Wave Height", "unit": "m", "data_basis": DATA_BASIS["REAL_OBSERVED"], "colormap": "amp"},
    "current_velocity_kmh": {"label": "Ocean Current", "unit": "km/h", "data_basis": DATA_BASIS["REAL_OBSERVED"], "colormap": "speed"},
    "hsi": {"label": "Habitat Suitability Index (literature formula)", "unit": "index (0-1)", "data_basis": DATA_BASIS["PROXY_LABEL"], "colormap": "viridis"},
    "suitability_pred": {"label": "Suitability (model prediction)", "unit": "index (0-1)", "data_basis": DATA_BASIS["PROXY_LABEL"], "colormap": "viridis"},
    "risk_score": {"label": "Operational Risk (wave/wind)", "unit": "index (0-1)", "data_basis": DATA_BASIS["REAL_DERIVED"], "colormap": "reds"},
}


def _load_feature_table() -> pd.DataFrame:
    path = MODELS_ROOT / "feature_table.csv"
    if not path.exists():
        raise HTTPException(
            status_code=503,
            detail="No trained model/feature table yet. Run: python -m pipeline.train_ensemble",
        )
    return pd.read_csv(path)


def _generated_at() -> str | None:
    path = MODELS_ROOT / "generated_at.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())["generated_at"]


@router.get("")
def list_layers():
    return {"layers": LAYER_META, "bbox": BBOX, "generated_at": _generated_at()}


@router.get("/grid")
def get_grid():
    df = _load_feature_table()
    return {
        "generated_at": _generated_at(),
        "bbox": BBOX,
        "n_points": len(df),
        "points": df.to_dict(orient="records"),
    }
