"use client";

import { CheckCircle2, FlaskConical, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataBasis } from "@/lib/api";
import { useT } from "@/lib/locale";

const CONFIG: Record<
  DataBasis,
  { en: string; th: string; icon: typeof CheckCircle2; className: string }
> = {
  real_observed: {
    en: "Real observed data",
    th: "ข้อมูลจริงจากการสังเกตการณ์",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/30",
  },
  real_derived: {
    en: "Real, derived formula",
    th: "คำนวณจากข้อมูลจริงด้วยสูตรที่เปิดเผย",
    icon: Calculator,
    className: "bg-secondary/10 text-secondary border-secondary/30 dark:text-accent dark:border-accent/30",
  },
  proxy_label: {
    en: "Literature proxy (not real catch data)",
    th: "ค่าประมาณจากงานวิจัย (ไม่ใช่ข้อมูลจับสัตว์น้ำจริง)",
    icon: FlaskConical,
    className: "bg-warning/10 text-warning border-warning/30",
  },
};

export function DataBasisBadge({
  basis,
  className,
}: {
  basis: DataBasis;
  className?: string;
}) {
  const t = useT();
  const cfg = CONFIG[basis];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        cfg.className,
        className
      )}
    >
      <Icon className="size-3" />
      {t(cfg.en, cfg.th)}
    </span>
  );
}
