from fastapi import APIRouter

from config import DATASET_CATALOG

router = APIRouter()


@router.get("")
def list_datasets():
    live = [d for d in DATASET_CATALOG if d["status"] == "live"]
    not_wired = [d for d in DATASET_CATALOG if d["status"] == "not_wired"]
    return {
        "datasets": DATASET_CATALOG,
        "summary": {"live": len(live), "not_wired": len(not_wired), "total": len(DATASET_CATALOG)},
    }
