"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database, Target, MapPinned, Satellite } from "lucide-react";
import { api } from "@/lib/api";
import { AnimatedCounter } from "@/components/animated-counter";
import { useT } from "@/lib/locale";

interface StatCard {
  icon: typeof Database;
  label: string;
  value: number;
  decimals: number;
  suffix: string;
  caption: string;
}

export function HeroStats() {
  const [stats, setStats] = useState<StatCard[] | null>(null);
  const [error, setError] = useState(false);
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.datasets(), api.analyticsSummary()])
      .then(([datasets, summary]) => {
        if (cancelled) return;
        setStats([
          {
            icon: Database,
            label: t("Datasets Integrated", "ชุดข้อมูลที่ผสาน"),
            value: datasets.summary.total,
            decimals: 0,
            suffix: "",
            caption: t(
              `${datasets.summary.live} live, no-auth real sources`,
              `${datasets.summary.live} แหล่งข้อมูลจริงแบบสด ไม่ต้องยืนยันตัวตน`
            ),
          },
          {
            icon: Target,
            label: t("Classification ROC-AUC", "ค่า ROC-AUC ของโมเดล"),
            value: summary.classification_roc_auc,
            decimals: 3,
            suffix: "",
            caption: t("Real held-out spatial test split", "ทดสอบจริงด้วยชุดข้อมูลแยกตามพื้นที่"),
          },
          {
            icon: MapPinned,
            label: t("Study Regions", "พื้นที่ศึกษา"),
            value: 2,
            decimals: 0,
            suffix: "",
            caption: t("Gulf of Thailand + Andaman Sea", "อ่าวไทย + ทะเลอันดามัน"),
          },
          {
            icon: Satellite,
            label: t("Live Data Sources", "แหล่งข้อมูลสด"),
            value: datasets.summary.live,
            decimals: 0,
            suffix: "",
            caption: t("NOAA, NASA, Open-Meteo, World Bank", "NOAA, NASA, Open-Meteo, World Bank"),
          },
        ]);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {(stats ?? Array.from({ length: 4 })).map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 * i }}
          className="glass rounded-2xl px-4 py-5 text-center sm:px-5"
        >
          {s ? (
            <>
              <s.icon className="mx-auto mb-2 size-5 text-accent" />
              <div className="font-heading text-2xl font-semibold text-white sm:text-3xl">
                <AnimatedCounter value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs font-medium text-white/80">{s.label}</div>
              <div className="mt-0.5 text-[10px] text-white/50">{s.caption}</div>
            </>
          ) : (
            <div className="h-[74px] animate-pulse rounded-lg bg-white/5" />
          )}
        </motion.div>
      ))}
      {error && (
        <p className="col-span-2 mt-1 text-center text-xs text-white/50 md:col-span-4">
          {t(
            "Live stats unavailable — start the API (uvicorn) to load real numbers.",
            "ยังไม่มีข้อมูลสด — เริ่มการทำงานของ API (uvicorn) เพื่อโหลดตัวเลขจริง"
          )}
        </p>
      )}
    </div>
  );
}
