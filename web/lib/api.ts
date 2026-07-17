// Typed client for the FastAPI backend. Requests go through Next.js's own
// /api/* rewrite proxy (see next.config.ts) straight to the real backend —
// no mock data anywhere in this file.

export type DataBasis = "real_observed" | "real_derived" | "proxy_label";

export interface Dataset {
  id: string;
  name: string;
  category: string;
  status: "live" | "not_wired";
  source: string;
  resolution: string;
  update_frequency: string;
  description: string;
}

export interface DatasetsResponse {
  datasets: Dataset[];
  summary: { live: number; not_wired: number; total: number };
}

export interface LayerMeta {
  label: string;
  unit: string;
  data_basis: DataBasis;
  colormap: string;
}

export interface LayersResponse {
  layers: Record<string, LayerMeta>;
  bbox: { lat_min: number; lat_max: number; lon_min: number; lon_max: number };
  generated_at: string | null;
}

export interface GridPoint {
  lat: number;
  lon: number;
  sst_c: number;
  chl_mg_m3: number;
  depth_m: number;
  salinity_psu: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wave_height_m: number;
  current_velocity_kmh: number;
  current_direction_deg: number;
  hsi: number;
  si_sst: number;
  si_chl: number;
  si_depth: number;
  suitability_pred: number;
  risk_score: number;
}

export interface GridResponse {
  generated_at: string | null;
  bbox: { lat_min: number; lat_max: number; lon_min: number; lon_max: number };
  n_points: number;
  points: GridPoint[];
}

export interface AnalyticsSummary {
  current_sst_c: number;
  current_chl_mg_m3: number;
  current_wind_kmh: number;
  stacked_ensemble_r2: number;
  classification_roc_auc: number;
  n_suitable_cells: number;
  n_high_risk_cells: number;
  n_total_cells: number;
  data_basis_note: string;
}

export interface RegionalComparison {
  regions: {
    region: string;
    mean_suitability: number;
    mean_risk: number;
    mean_sst_c: number;
    mean_chl_mg_m3: number;
    n_cells: number;
  }[];
}

export interface SuitabilityProfile {
  axes: { axis: string; value: number }[];
}

export interface SstTimeseries {
  lat: number;
  lon: number;
  series: { date: string; sst_c: number }[];
}

export interface RegressionMetrics {
  rmse: number;
  mae: number;
  r2: number;
}

export interface FullMetrics {
  data_basis: DataBasis;
  target_description: string;
  n_total_cells: number;
  n_train: number;
  n_test: number;
  suitability_cutoff: number;
  data_caveats: string[];
  models: {
    base_a_xgboost_env_image: RegressionMetrics;
    base_b_ridge_env_temporal: RegressionMetrics;
    stacked_ensemble: RegressionMetrics;
  };
  classification_derived: {
    confusion_matrix: number[][];
    confusion_matrix_labels: string[];
    precision: number;
    recall: number;
    f1: number;
    roc_auc: number;
    roc_curve: { fpr: number[]; tpr: number[] };
  };
  shap_feature_importance: { feature: string; mean_abs_shap: number }[];
}

export interface PredictResponse {
  lat: number;
  lon: number;
  suitability: number;
  risk: number;
  confidence: "high" | "medium" | "low";
  data_basis: Record<string, DataBasis>;
  sub_scores: Record<string, number>;
  shap_feature_importance: { feature: string; shap_value: number }[];
  used_uploaded_image: boolean;
  nearest_grid_cell_km: number;
}

export interface UserOut {
  id: number;
  email: string;
  display_name: string;
  home_lat: number | null;
  home_lon: number | null;
  target_species: string | null;
}

export interface ChatResponse {
  response: string;
  sources: string[];
  mode: "llm" | "retrieval";
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Zone {
  id: string;
  name: string;
  bounds: { lat_min: number; lat_max: number; lon_min: number; lon_max: number };
}

export interface AreaDetail {
  zone: Zone;
  n_cells: number;
  stats: Record<string, number> | null;
  stats_range?: Record<string, { min: number; max: number }>;
  data_basis_note?: string;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  datasets: () => apiGet<DatasetsResponse>("/api/datasets"),
  layers: () => apiGet<LayersResponse>("/api/layers"),
  grid: () => apiGet<GridResponse>("/api/layers/grid"),
  analyticsSummary: () => apiGet<AnalyticsSummary>("/api/analytics/summary"),
  fullMetrics: () => apiGet<FullMetrics>("/api/research/metrics"),
  regionalComparison: () => apiGet<RegionalComparison>("/api/analytics/regional_comparison"),
  suitabilityProfile: () => apiGet<SuitabilityProfile>("/api/analytics/suitability_profile"),
  sstTimeseries: (lat = 9.5, lon = 100.5, days = 120) =>
    apiGet<SstTimeseries>(`/api/analytics/sst_timeseries?lat=${lat}&lon=${lon}&days=${days}`),

  predict: async (params: {
    lat: number;
    lon: number;
    species: string;
    image?: File | null;
  }): Promise<PredictResponse> => {
    const form = new FormData();
    form.set("lat", String(params.lat));
    form.set("lon", String(params.lon));
    form.set("species", params.species);
    if (params.image) form.set("image", params.image);

    const res = await fetch("/api/predict", { method: "POST", body: form });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail.detail ?? `Prediction failed: ${res.status}`);
    }
    return res.json();
  },

  // --- Auth ---
  signup: (body: { email: string; password: string; display_name: string }) =>
    apiPost<UserOut>("/api/auth/signup", body),
  login: (body: { email: string; password: string }) => apiPost<UserOut>("/api/auth/login", body),
  logout: () => apiPost<{ status: string }>("/api/auth/logout", {}),
  me: () => apiGet<UserOut | null>("/api/auth/me"),
  updatePreferences: (body: { home_lat?: number; home_lon?: number; target_species?: string }) =>
    apiPatch<UserOut>("/api/auth/preferences", body),

  // --- Chat ---
  chatStatus: () => apiGet<{ configured: boolean }>("/api/chat/status"),
  sendChat: (message: string) => apiPost<ChatResponse>("/api/chat", { message }),
  chatHistory: () => apiGet<{ messages: ChatHistoryMessage[] }>("/api/chat/history"),

  // --- Areas ---
  areas: () => apiGet<{ zones: Zone[] }>("/api/areas"),
  areaDetail: (zoneId: string) => apiGet<AreaDetail>(`/api/areas/${zoneId}`),
};

export const DATA_BASIS_LABEL: Record<DataBasis, string> = {
  real_observed: "Real observed data",
  real_derived: "Real, derived via disclosed formula",
  proxy_label: "Literature-based proxy (not real catch data)",
};
