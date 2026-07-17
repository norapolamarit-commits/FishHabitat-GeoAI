"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale, useT } from "@/lib/locale";

const PAGES = [
  { href: "/", en: "Home", th: "หน้าแรก" },
  { href: "/information", en: "Information", th: "ข้อมูล" },
  { href: "/map", en: "Map", th: "แผนที่" },
  { href: "/areas", en: "Areas", th: "พื้นที่" },
  { href: "/predict", en: "Prediction", th: "พยากรณ์" },
  { href: "/analytics", en: "Analytics", th: "สถิติ" },
  { href: "/chatbot", en: "Chatbot", th: "แชทบอท" },
];

export function PageNav({ current }: { current: string }) {
  const locale = useLocale();
  const t = useT();
  const index = PAGES.findIndex((p) => p.href === current);
  if (index === -1) return null;
  const prev = index > 0 ? PAGES[index - 1] : null;
  const next = index < PAGES.length - 1 ? PAGES[index + 1] : null;

  return (
    <nav className="border-t border-border px-4 py-8 sm:px-6" aria-label="Page navigation">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span>
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground/70">
                {t("Previous", "ก่อนหน้า")}
              </span>
              {locale === "th" ? prev.th : prev.en}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={next.href}
            className="group flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
          >
            <span className="text-right">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground/70">
                {t("Next", "ถัดไป")}
              </span>
              {locale === "th" ? next.th : next.en}
            </span>
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}
