"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPinned,
  Thermometer,
  Droplets,
  Waves,
  Mountain,
  Wind,
  Target,
  AlertTriangle,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { PageNav } from "@/components/page-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type AreaDetail, type Zone } from "@/lib/api";
import { useT } from "@/lib/locale";

export default function AreasPage() {
  const t = useT();
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<AreaDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const STAT_META: Record<string, { label: string; unit: string; icon: typeof Thermometer }> = {
    sst_c: { label: t("Sea Surface Temperature", "อุณหภูมิผิวน้ำทะเล"), unit: "°C", icon: Thermometer },
    chl_mg_m3: { label: t("Chlorophyll-a", "คลอโรฟิลล์-เอ"), unit: "mg/m³", icon: Droplets },
    salinity_psu: { label: t("Salinity", "ความเค็ม"), unit: "PSU", icon: Droplets },
    depth_m: { label: t("Depth", "ความลึก"), unit: "m", icon: Mountain },
    wind_speed_kmh: { label: t("Wind Speed", "ความเร็วลม"), unit: "km/h", icon: Wind },
    wave_height_m: { label: t("Wave Height", "ความสูงคลื่น"), unit: "m", icon: Waves },
    current_velocity_kmh: { label: t("Ocean Current", "กระแสน้ำทะเล"), unit: "km/h", icon: Waves },
    suitability_pred: { label: t("Suitability", "ความเหมาะสม"), unit: "index", icon: Target },
    risk_score: { label: t("Operational Risk", "ความเสี่ยงในการปฏิบัติงาน"), unit: "index", icon: AlertTriangle },
  };

  useEffect(() => {
    api.areas().then((r) => {
      setZones(r.zones);
      if (r.zones.length > 0) setSelected(r.zones[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setDetail(null);
    api
      .areaDetail(selected)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow={t("Area Details", "รายละเอียดพื้นที่")}
        title={t("Explore by Region", "สำรวจตามภูมิภาค")}
        subtitleThai="เลือกโซนภูมิศาสตร์จริงเพื่อดูสถิติสิ่งแวดล้อมและความเหมาะสมที่รวบรวมจากข้อมูลจริงของพื้นที่นั้น"
        subtitleEn="Select a real geographic zone to see aggregated real environmental and suitability statistics for that area."
      />

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {zones ? (
              zones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => setSelected(z.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selected === z.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <MapPinned className="size-3.5" />
                  {z.name}
                </button>
              ))
            ) : (
              <Skeleton className="h-10 w-full max-w-md rounded-full" />
            )}
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          )}

          {!loading && detail && detail.stats && (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 text-center text-sm text-muted-foreground"
              >
                {detail.zone.name} &middot; {detail.n_cells}{" "}
                {t("real grid cells averaged", "กริดข้อมูลจริงที่นำมาเฉลี่ย")}
              </motion.p>
              <div className="grid gap-4 sm:grid-cols-3">
                {Object.entries(detail.stats).map(([key, value], i) => {
                  const meta = STAT_META[key];
                  if (!meta) return null;
                  const range = detail.stats_range?.[key];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-border bg-card p-5"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <meta.icon className="size-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-2 font-heading text-2xl font-bold">
                        {value.toFixed(key.includes("pred") || key.includes("score") ? 3 : 2)}
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          {meta.unit}
                        </span>
                      </p>
                      {range && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {t("Range", "ช่วงค่า")}: {range.min.toFixed(2)} – {range.max.toFixed(2)}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              {detail.data_basis_note && (
                <p className="mt-8 text-center text-xs text-muted-foreground">
                  {detail.data_basis_note}
                </p>
              )}
            </>
          )}

          {!loading && detail && !detail.stats && (
            <p className="text-center text-sm text-muted-foreground">
              {t(
                "No real grid cells fall within this zone's bounds (likely mostly land).",
                "ไม่มีข้อมูลกริดจริงในขอบเขตของโซนนี้ (มักเป็นเพราะพื้นที่ส่วนใหญ่เป็นแผ่นดิน)"
              )}
            </p>
          )}
        </div>
      </section>

      <PageNav current="/areas" />
    </div>
  );
}
