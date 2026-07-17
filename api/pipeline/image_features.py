"""Real image features via a frozen, ImageNet-pretrained EfficientNet-B0.

No labeled fishing-habitat imagery dataset exists, so this is NOT fine-tuned
— it's used purely as a generic visual-texture feature extractor (a
standard, legitimate transfer-learning technique when no task-specific
labels exist). The CNN forward pass is real; the weights are real published
ImageNet weights; the images are real NASA satellite crops. What's NOT real
is any claim that these features were learned "for" fishing habitats.

To keep the number of NASA Worldview requests small, imagery is fetched for
a coarse tiling of the study region (REGION_TILES_PER_SIDE x itself tiles),
not per individual grid cell — each analysis-grid cell is assigned its
nearest regional tile's embedding.
"""

import numpy as np
import torch
from PIL import Image
import io

from config import BBOX
from pipeline.ingest_satellite_image import fetch_true_color_image, most_recent_usable_date

REGION_TILES_PER_SIDE = 4
EMBEDDING_DIM_REDUCED = 16  # 1280 native dims averaged down to keep small-N fits stable

_model = None
_preprocess = None


def _get_model():
    global _model, _preprocess
    if _model is None:
        from torchvision.models import EfficientNet_B0_Weights, efficientnet_b0

        weights = EfficientNet_B0_Weights.IMAGENET1K_V1
        model = efficientnet_b0(weights=weights)
        model.classifier = torch.nn.Identity()  # drop the ImageNet classification head
        model.eval()
        _model = model
        _preprocess = weights.transforms()
    return _model, _preprocess


def _tile_centers():
    lat_edges = np.linspace(BBOX["lat_min"], BBOX["lat_max"], REGION_TILES_PER_SIDE + 1)
    lon_edges = np.linspace(BBOX["lon_min"], BBOX["lon_max"], REGION_TILES_PER_SIDE + 1)
    tiles = []
    for i in range(REGION_TILES_PER_SIDE):
        for j in range(REGION_TILES_PER_SIDE):
            tiles.append(
                {
                    "lat_min": lat_edges[i],
                    "lat_max": lat_edges[i + 1],
                    "lon_min": lon_edges[j],
                    "lon_max": lon_edges[j + 1],
                    "center_lat": (lat_edges[i] + lat_edges[i + 1]) / 2,
                    "center_lon": (lon_edges[j] + lon_edges[j + 1]) / 2,
                }
            )
    return tiles


def _embed_image(img_bytes: bytes) -> np.ndarray:
    model, preprocess = _get_model()
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    tensor = preprocess(img).unsqueeze(0)
    with torch.no_grad():
        features = model(tensor)  # (1, 1280)
    vec = features.squeeze(0).numpy()
    # reduce 1280 -> EMBEDDING_DIM_REDUCED by averaging contiguous chunks
    chunks = np.array_split(vec, EMBEDDING_DIM_REDUCED)
    return np.array([c.mean() for c in chunks])


def compute_regional_image_embeddings(date: str | None = None) -> list[dict]:
    """Returns a list of {center_lat, center_lon, embedding (np.ndarray)} for
    each real regional tile, using a real NASA true-colour crop per tile."""
    date = date or most_recent_usable_date()
    tiles = _tile_centers()
    results = []
    for t in tiles:
        img_bytes = fetch_true_color_image(
            t["lat_min"], t["lon_min"], t["lat_max"], t["lon_max"], date, size=256
        )
        embedding = _embed_image(img_bytes)
        results.append(
            {"center_lat": t["center_lat"], "center_lon": t["center_lon"], "embedding": embedding}
        )
    return results


def assign_nearest_tile_embedding(grid_lat: np.ndarray, grid_lon: np.ndarray, tile_embeddings: list[dict]) -> np.ndarray:
    """For each grid point, find the nearest regional tile center and return its embedding."""
    centers = np.array([[t["center_lat"], t["center_lon"]] for t in tile_embeddings])
    embeddings = np.array([t["embedding"] for t in tile_embeddings])
    out = np.zeros((len(grid_lat), embeddings.shape[1]))
    for i, (la, lo) in enumerate(zip(grid_lat, grid_lon)):
        dists = (centers[:, 0] - la) ** 2 + (centers[:, 1] - lo) ** 2
        nearest = np.argmin(dists)
        out[i] = embeddings[nearest]
    return out


if __name__ == "__main__":
    print("Fetching real regional imagery + running frozen EfficientNet-B0...")
    embeds = compute_regional_image_embeddings()
    for e in embeds:
        print(f"tile center ({e['center_lat']:.2f}, {e['center_lon']:.2f}): "
              f"embedding shape {e['embedding'].shape}, mean={e['embedding'].mean():.4f}")
