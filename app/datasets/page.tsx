"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Thermometer,
  Droplets,
  Mountain,
  Wind,
  Waves,
  Satellite,
  Moon,
  CloudSun,
  Map as MapIcon,
  Landmark,
  Fish,
  CircleCheck,
  CircleDashed,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Dataset } from "@/lib/api";
import { useT } from "@/lib/locale";

const ICONS: Record<string, typeof Thermometer> = {
  sst: Thermometer,
  chlorophyll: Droplets,
  bathymetry: Mountain,
  wind: Wind,
  wave_height: Waves,
  current_velocity: Waves,
  ocean_current: Waves,
  salinity: Droplets,
  optical: Satellite,
  viirs_nightlight: Moon,
  era5: CloudSun,
  osm: MapIcon,
  fishing_zones: MapIcon,
  world_bank: Landmark,
  cpue: Fish,
  theos2: Satellite,
  sar: Satellite,
  sentinel: Satellite,
  hyperspectral: Satellite,
  nso: Landmark,
};

function DatasetCard({ dataset, index }: { dataset: Dataset; index: number }) {
  const t = useT();
  const Icon = ICONS[dataset.id] ?? Satellite;
  const live = dataset.status === "live";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-accent">
          <Icon className="size-5" />
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            live
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {live ? <CircleCheck className="size-3" /> : <CircleDashed className="size-3" />}
          {live ? t("Live", "ใช้งานจริง") : t("Not wired", "ยังไม่เชื่อมต่อ")}
        </span>
      </div>

      <h3 className="mt-4 font-heading text-base font-semibold">{dataset.name}</h3>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {dataset.category}
      </p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {dataset.description}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 text-xs">
        <div>
          <p className="text-muted-foreground">{t("Resolution", "ความละเอียด")}</p>
          <p className="mt-0.5 font-medium">{dataset.resolution}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("Update frequency", "ความถี่ในการอัปเดต")}</p>
          <p className="mt-0.5 font-medium">{dataset.update_frequency}</p>
        </div>
      </div>
      <p className="mt-3 truncate text-[11px] text-muted-foreground" title={dataset.source}>
        {t("Source", "แหล่งข้อมูล")}: {dataset.source}
      </p>
    </motion.div>
  );
}

export default function DatasetsPage() {
  const t = useT();
  const [data, setData] = useState<Dataset[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | "live" | "not_wired">("all");

  useEffect(() => {
    api
      .datasets()
      .then((r) => setData(r.datasets))
      .catch(() => setError(true));
  }, []);

  const filtered = data?.filter((d) => filter === "all" || d.status === filter) ?? null;

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeading
            eyebrow={t("Data Catalog", "แคตตาล็อกข้อมูล")}
            title={t("Every dataset behind this platform", "ทุกชุดข้อมูลเบื้องหลังแพลตฟอร์มนี้")}
            description={t(
              "Nineteen datasets referenced by the project spec — each honestly marked as a live, real, no-auth source this build actually uses, or not yet wired in.",
              "ชุดข้อมูล 19 ชุดที่อ้างอิงในสเปกโครงการ — แต่ละชุดระบุตามจริงว่าเป็นแหล่งข้อมูลจริงที่ใช้งานอยู่และไม่ต้องล็อกอิน หรือยังไม่ได้เชื่อมต่อใช้งาน"
            )}
          />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex justify-center gap-2">
            {(["all", "live", "not_wired"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {f === "all"
                  ? t("All datasets", "ชุดข้อมูลทั้งหมด")
                  : f === "live"
                  ? t("Live", "ใช้งานจริง")
                  : t("Not wired", "ยังไม่เชื่อมต่อ")}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-muted-foreground">
              {t("Could not reach the API. Start it with", "ไม่สามารถเชื่อมต่อ API ได้ เริ่มการทำงานด้วย")}{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">
                uvicorn main:app --reload
              </code>
              .
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered
              ? filtered.map((d, i) => <DatasetCard key={d.id} dataset={d} index={i} />)
              : !error &&
                Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}
