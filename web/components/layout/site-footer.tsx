"use client";

import Link from "next/link";
import { Waves, Mail } from "lucide-react";
import { useLocale, useT } from "@/lib/locale";

const COLUMNS = [
  {
    title: { en: "Platform", th: "แพลตฟอร์ม" },
    links: [
      { href: "/map", en: "GIS Map", th: "แผนที่ GIS" },
      { href: "/predict", en: "AI Prediction", th: "พยากรณ์ด้วย AI" },
      { href: "/analytics", en: "Analytics", th: "สถิติ" },
      { href: "/datasets", en: "Datasets", th: "ชุดข้อมูล" },
    ],
  },
  {
    title: { en: "Research", th: "งานวิจัย" },
    links: [
      { href: "/information", en: "About & Team", th: "เกี่ยวกับ & ทีม" },
      { href: "/ai", en: "AI Architecture", th: "สถาปัตยกรรม AI" },
      { href: "/research", en: "Methodology", th: "ระเบียบวิธีวิจัย" },
    ],
  },
];

export function SiteFooter() {
  const locale = useLocale();
  const t = useT();

  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Waves className="size-4" />
              </div>
              <span className="font-heading text-sm font-semibold">
                FishHabitat<span className="text-accent">GeoAI</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {t(
                "An open, transparent GeoAI research platform integrating satellite remote sensing, oceanographic reanalysis, and explainable AI to assess fishing habitat suitability in the Gulf of Thailand and Andaman Sea.",
                "แพลตฟอร์มวิจัย GeoAI แบบเปิดและโปร่งใส ผสานข้อมูลดาวเทียม การวิเคราะห์สมุทรศาสตร์ย้อนหลัง และ AI ที่อธิบายได้ เพื่อประเมินความเหมาะสมของแหล่งทำประมงในอ่าวไทยและทะเลอันดามัน"
              )}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="mailto:research@fishhabitatgeoai.org"
                className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title.en}>
              <h3 className="font-heading text-sm font-semibold">
                {locale === "th" ? col.title.th : col.title.en}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {locale === "th" ? link.th : link.en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            {t(
              `© ${new Date().getFullYear()} FishHabitat GeoAI Research Project. Built for open scientific research.`,
              `© ${new Date().getFullYear()} โครงการวิจัย FishHabitat GeoAI จัดทำเพื่องานวิจัยทางวิทยาศาสตร์แบบเปิด`
            )}
          </p>
          <p>
            {t(
              "Data sources: NOAA CoastWatch ERDDAP · NASA GIBS/Worldview · Open-Meteo · World Bank Open Data · Marine Regions",
              "แหล่งข้อมูล: NOAA CoastWatch ERDDAP · NASA GIBS/Worldview · Open-Meteo · World Bank Open Data · Marine Regions"
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
