import os

# Must be set before torch/xgboost are imported anywhere in this process
# (transitively, via the routers below) — without this, torch's and
# xgboost's bundled OpenMP runtimes conflict and reliably segfault the
# server the first time a request touches both (verified 2026-07-16, see
# pipeline/train_ensemble.py for the full investigation).
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
os.environ.setdefault("OMP_WAIT_POLICY", "PASSIVE")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import db_models
from db import engine
from routers import analytics, auth, chat, areas, datasets, layers, predict, research

db_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fishing Habitat Suitability Assessment API",
    description="GeoAI backend integrating real open oceanographic data with an "
    "explainable ML ensemble for fishing habitat suitability in the Gulf of "
    "Thailand and Andaman Sea.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router, prefix="/api/datasets", tags=["datasets"])
app.include_router(layers.router, prefix="/api/layers", tags=["layers"])
app.include_router(predict.router, prefix="/api/predict", tags=["predict"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(research.router, prefix="/api/research", tags=["research"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(areas.router, prefix="/api/areas", tags=["areas"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
