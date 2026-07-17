"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  ChevronDown,
  Map as MapIcon,
  Cpu,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroImageBackground } from "@/components/backgrounds/hero-image-background";
import { HeroStats } from "@/components/home/hero-stats";
import { SectionHeading } from "@/components/section-heading";
import { PageNav } from "@/components/page-nav";
import { useT } from "@/lib/locale";

export default function Home() {
  const t = useT();

  const EXPLORE_CARDS = [
    {
      href: "/map",
      icon: MapIcon,
      title: t("GIS Map", "แผนที่ GIS"),
      description: t(
        "Fullscreen suitability, risk, and environmental layers over the Gulf of Thailand and Andaman Sea.",
        "ชั้นข้อมูลความเหมาะสม ความเสี่ยง และสิ่งแวดล้อมแบบเต็มจอ ครอบคลุมอ่าวไทยและทะเลอันดามัน"
      ),
    },
    {
      href: "/ai",
      icon: Cpu,
      title: t("AI Architecture", "สถาปัตยกรรม AI"),
      description: t(
        "EfficientNet-B0, XGBoost, and LSTM fused through a stacking ensemble, explained with SHAP.",
        "EfficientNet-B0, XGBoost และ LSTM ผสานกันด้วย stacking ensemble อธิบายผลด้วย SHAP"
      ),
    },
    {
      href: "/predict",
      icon: Sparkles,
      title: t("Run a Prediction", "ทำนายผล"),
      description: t(
        "Pick a location on the map and get a real, explainable suitability score.",
        "เลือกตำแหน่งบนแผนที่ เพื่อรับคะแนนความเหมาะสมจริงที่อธิบายได้"
      ),
    },
    {
      href: "/analytics",
      icon: BarChart3,
      title: t("Analytics Dashboard", "แดชบอร์ดสถิติ"),
      description: t(
        "Live oceanographic averages, regional comparisons, and model evaluation charts.",
        "ค่าเฉลี่ยข้อมูลสมุทรศาสตร์แบบสด การเปรียบเทียบรายภูมิภาค และกราฟประเมินโมเดล"
      ),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* HERO — split layout: visual on the left, content on the right */}
      <section className="relative min-h-0 overflow-hidden px-4 py-16 text-white sm:min-h-[92vh] sm:px-6 sm:py-24 lg:px-12">
        <HeroImageBackground />

        <div className="relative z-10 grid h-full items-center gap-10 lg:grid-cols-2">
          {/* left: intentionally empty — lets the animated satellite/ocean visual show through as its own panel */}
          <div className="hidden lg:block" aria-hidden="true" />

          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-sm"
            >
              {t(
                "GeoAI Research Platform · Gulf of Thailand & Andaman Sea",
                "แพลตฟอร์มวิจัย GeoAI · อ่าวไทย & ทะเลอันดามัน"
              )}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="max-w-xl font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl"
            >
              {t("AI-Based Fishing Habitat Suitability Assessment", "การประเมินความเหมาะสมของแหล่งทำประมงด้วย AI")}{" "}
              <span className="text-gradient-ocean bg-gradient-to-r from-[#4fd1f2] via-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
                {t("Using Satellite and Oceanographic Data", "จากข้อมูลดาวเทียมและสมุทรศาสตร์")}
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-md border-l-2 border-accent pl-4 text-left"
            >
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                {t(
                  "Developing an AI system to assess fishing ground suitability from satellite and oceanographic data.",
                  "การพัฒนาระบบปัญญาประดิษฐ์เพื่อประเมินความเหมาะสมของพื้นที่ทำประมงจากข้อมูลดาวเทียมและข้อมูลสมุทรศาสตร์"
                )}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/50">
                {t(
                  "Integrating satellite remote sensing, oceanographic data, climate reanalysis, explainable AI, and geospatial analytics for sustainable fisheries.",
                  "ผสานข้อมูลจากการสำรวจระยะไกลด้วยดาวเทียม ข้อมูลสมุทรศาสตร์ การวิเคราะห์ภูมิอากาศย้อนหลัง AI ที่อธิบายได้ และการวิเคราะห์เชิงพื้นที่ เพื่อการประมงที่ยั่งยืน"
                )}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <Button
                size="lg"
                className="rounded-full bg-accent px-6 text-[#04141F] hover:bg-accent/90"
                render={<Link href="/map" />}
              >
                {t("Explore Data", "สำรวจข้อมูล")}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10"
                render={<Link href="/ai" />}
              >
                <BookOpenText className="size-4" />
                {t("View Architecture", "ดูสถาปัตยกรรม")}
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="relative z-10 mx-auto mt-16 w-full max-w-4xl"
        >
          <HeroStats />
        </motion.div>

        <motion.div
          className="relative z-10 mx-auto mt-10 flex w-fit flex-col items-center gap-1 text-white/50"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">{t("Scroll", "เลื่อนลง")}</span>
          <ChevronDown className="size-4" />
        </motion.div>
      </section>

      {/* EXPLORE GRID */}
      <section className="bg-background px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow={t("Explore the platform", "สำรวจแพลตฟอร์ม")}
            title={t("One research platform, four ways in", "แพลตฟอร์มวิจัยเดียว สี่ทางเข้าถึง")}
            description={t(
              "Every number on this platform is traceable to a real data source or a disclosed formula — explore the map, the model, and the evidence behind it.",
              "ทุกตัวเลขบนแพลตฟอร์มนี้สามารถตรวจสอบย้อนกลับไปยังแหล่งข้อมูลจริงหรือสูตรคำนวณที่เปิดเผยได้ — สำรวจแผนที่ โมเดล และหลักฐานเบื้องหลัง"
            )}
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EXPLORE_CARDS.map((card, i) => (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-accent/15 group-hover:text-accent dark:text-accent">
                    <card.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary dark:text-accent">
                    {t("Open", "เปิด")}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PageNav current="/" />
    </div>
  );
}
