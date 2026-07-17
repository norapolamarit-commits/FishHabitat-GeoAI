import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter()

MODELS_ROOT = Path(__file__).resolve().parent.parent / "models"


@router.get("/metrics")
def full_metrics():
    """Full real training metrics: model comparison, confusion matrix, ROC
    curve, SHAP feature importance, data caveats — everything produced by
    pipeline/train_ensemble.py, unmodified."""
    path = MODELS_ROOT / "metrics.json"
    if not path.exists():
        raise HTTPException(
            status_code=503,
            detail="No trained model yet. Run: python -m pipeline.train_ensemble",
        )
    return json.loads(path.read_text())
