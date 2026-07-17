"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { HeroBackground } from "@/components/backgrounds/hero-background";
import { useLocale } from "@/lib/locale";

export function PageHero({
  eyebrow,
  title,
  subtitleThai,
  subtitleEn,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitleThai?: string;
  subtitleEn: string;
}) {
  const locale = useLocale();
  const subtitle = locale === "th" && subtitleThai ? subtitleThai : subtitleEn;
  return (
    <section className="relative overflow-hidden px-4 py-20 text-white sm:px-6">
      <HeroBackground />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl"
        >
          {title}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-xl border-l-2 border-accent pl-4 text-left"
        >
          <p className="text-sm leading-relaxed text-white/80">{subtitle}</p>
        </motion.div>
      </div>
    </section>
  );
}
