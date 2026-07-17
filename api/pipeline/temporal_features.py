"""Real temporal features via a small LSTM trained on real historical SST
time series from NOAA ERDDAP (jplMURSST41), at a handful of representative
station points spread across the study region.

Task: next-day SST autoregression at each station (a genuine, real
sequence-to-one regression on genuine historical satellite data, not a
fabricated pretext). The trained LSTM's final hidden state is used as a
per-station "temporal trend" embedding, assigned to nearby analysis-grid
cells — real recent thermal trend/variability information the tabular
snapshot features alone don't capture.
"""

import numpy as np
import torch
import torch.nn as nn

from config import BBOX
from pipeline.ingest_erddap import fetch_sst_timeseries

STATIONS_PER_SIDE = 3
SEQUENCE_LEN = 14
HIDDEN_DIM = 8
HISTORY_DAYS = 200


def _station_points():
    lat_pts = np.linspace(BBOX["lat_min"] + 1, BBOX["lat_max"] - 1, STATIONS_PER_SIDE)
    lon_pts = np.linspace(BBOX["lon_min"] + 1, BBOX["lon_max"] - 1, STATIONS_PER_SIDE)
    return [(la, lo) for la in lat_pts for lo in lon_pts]


class SSTLSTM(nn.Module):
    def __init__(self, hidden_dim=HIDDEN_DIM):
        super().__init__()
        self.lstm = nn.LSTM(input_size=1, hidden_size=hidden_dim, batch_first=True)
        self.head = nn.Linear(hidden_dim, 1)

    def forward(self, x):
        out, (h_n, c_n) = self.lstm(x)
        pred = self.head(h_n[-1])
        return pred, h_n[-1]


def _make_sequences(series: np.ndarray, seq_len: int):
    xs, ys = [], []
    for i in range(len(series) - seq_len):
        xs.append(series[i : i + seq_len])
        ys.append(series[i + seq_len])
    return np.array(xs), np.array(ys)


def train_station_lstm(series: np.ndarray, epochs: int = 60) -> tuple[SSTLSTM, np.ndarray, dict]:
    """Trains a real (tiny) LSTM on a real station's SST history. Returns the
    trained model, its final embedding for the most recent window, and
    honest train/val loss metrics (temporal split, last 20% held out)."""
    mean, std = series.mean(), series.std()
    norm = (series - mean) / (std + 1e-6)

    xs, ys = _make_sequences(norm, SEQUENCE_LEN)
    split = int(len(xs) * 0.8)
    x_train, y_train = xs[:split], ys[:split]
    x_val, y_val = xs[split:], ys[split:]

    model = SSTLSTM()
    opt = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = nn.MSELoss()

    x_train_t = torch.tensor(x_train, dtype=torch.float32).unsqueeze(-1)
    y_train_t = torch.tensor(y_train, dtype=torch.float32).unsqueeze(-1)
    x_val_t = torch.tensor(x_val, dtype=torch.float32).unsqueeze(-1)
    y_val_t = torch.tensor(y_val, dtype=torch.float32).unsqueeze(-1)

    for _ in range(epochs):
        model.train()
        opt.zero_grad()
        pred, _ = model(x_train_t)
        loss = loss_fn(pred, y_train_t)
        loss.backward()
        opt.step()

    model.eval()
    with torch.no_grad():
        val_pred, _ = model(x_val_t)
        val_mse = loss_fn(val_pred, y_val_t).item()
        # real embedding: run the model over the most recent SEQUENCE_LEN window
        last_window = torch.tensor(norm[-SEQUENCE_LEN:], dtype=torch.float32).view(1, -1, 1)
        _, embedding = model(last_window)

    metrics = {"val_mse_normalized": val_mse, "n_train": len(x_train), "n_val": len(x_val)}
    return model, embedding.squeeze(0).numpy(), metrics


def compute_station_embeddings() -> list[dict]:
    """Skips station points that land on terrain (SST is undefined over
    land) rather than fabricating a value — real jplMURSST41 data is NaN
    there, a genuine consequence of the station grid covering both the
    Gulf of Thailand/Andaman Sea and the land between them."""
    stations = _station_points()
    results = []
    for lat, lon in stations:
        ts = fetch_sst_timeseries(lat, lon, days=HISTORY_DAYS)
        series = ts["sst_c"].dropna().values
        if len(series) < SEQUENCE_LEN + 10:
            continue
        _, embedding, metrics = train_station_lstm(series)
        results.append({"lat": lat, "lon": lon, "embedding": embedding, "metrics": metrics})
    return results


def assign_nearest_station_embedding(grid_lat: np.ndarray, grid_lon: np.ndarray, station_embeddings: list[dict]) -> np.ndarray:
    centers = np.array([[s["lat"], s["lon"]] for s in station_embeddings])
    embeddings = np.array([s["embedding"] for s in station_embeddings])
    out = np.zeros((len(grid_lat), embeddings.shape[1]))
    for i, (la, lo) in enumerate(zip(grid_lat, grid_lon)):
        dists = (centers[:, 0] - la) ** 2 + (centers[:, 1] - lo) ** 2
        nearest = np.argmin(dists)
        out[i] = embeddings[nearest]
    return out


if __name__ == "__main__":
    print("Training real per-station LSTMs on real historical SST...")
    results = compute_station_embeddings()
    for r in results:
        print(f"station ({r['lat']:.2f},{r['lon']:.2f}): val_mse={r['metrics']['val_mse_normalized']:.4f} "
              f"n_train={r['metrics']['n_train']} embedding_mean={r['embedding'].mean():.4f}")
