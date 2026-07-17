"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { HeroImageBackground } from "@/components/backgrounds/hero-image-background";
import { useLocale } from "@/lib/locale";

export function PageHeroImage({
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
    <section className="relative overflow-hidden px-4 py-20 text-white sm:px-6 lg:px-12">
      <HeroImageBackground />
      <div className="relative z-10 grid gap-6 lg:grid-cols-2">
        {/* left: intentionally empty — lets the real illustration show through */}
        <div className="hidden lg:block" aria-hidden="true" />

        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
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
            className="mx-auto mt-6 max-w-xl border-l-2 border-accent pl-4 text-left lg:mx-0"
          >
            <p className="text-sm leading-relaxed text-white/80">{subtitle}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
