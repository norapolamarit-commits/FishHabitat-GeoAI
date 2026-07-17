"use client";

import { motion } from "framer-motion";

export function Gauge({
  value,
  label,
  color = "var(--accent)",
  size = 160,
}: {
  value: number; // 0-1
  label: string;
  color?: string;
  size?: number;
}) {
  const radius = size / 2 - 12;
  const circumference = Math.PI * radius; // semicircle
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <path
          d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={12}
          strokeLinecap="round"
        />
        <motion.path
          d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          className="font-heading"
          style={{ fontSize: size * 0.18, fontWeight: 700, fill: "var(--foreground)" }}
        >
          {(clamped * 100).toFixed(0)}%
        </text>
      </svg>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
