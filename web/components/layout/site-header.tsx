"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Waves,
  Library,
  Map as MapIcon,
  Sparkles,
  BarChart3,
  Sun,
  Moon,
  Menu,
  MapPinned,
  MessageCircle,
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  ChevronDown,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useSetLocale, useT } from "@/lib/locale";

const NAV_LINKS = [
  { href: "/information", en: "Information", th: "ข้อมูล", icon: Library },
  { href: "/map", en: "Map", th: "แผนที่", icon: MapIcon },
  { href: "/areas", en: "Areas", th: "พื้นที่", icon: MapPinned },
  { href: "/predict", en: "Prediction", th: "พยากรณ์", icon: Sparkles },
  { href: "/analytics", en: "Analytics", th: "สถิติ", icon: BarChart3 },
  { href: "/chatbot", en: "Chatbot", th: "แชทบอท", icon: MessageCircle },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-full"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}

function LanguageToggle() {
  const locale = useLocale();
  const setLocale = useSetLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "th" : "en")}
      aria-label="Switch language"
      className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Languages className="size-3.5" />
      <span className={locale === "en" ? "text-foreground" : ""}>EN</span>
      <span className="text-muted-foreground/40">/</span>
      <span className={locale === "th" ? "text-foreground" : ""}>TH</span>
    </button>
  );
}

function AccountMenu() {
  const { user, loading, logout } = useAuth();
  const t = useT();

  if (loading) {
    return <div className="size-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <Button size="sm" className="gap-1.5 rounded-full" render={<Link href="/login" />}>
        <LogIn className="size-3.5" />
        {t("Sign in", "เข้าสู่ระบบ")}
      </Button>
    );
  }

  const initial = user.display_name?.[0]?.toUpperCase() ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex items-center gap-1.5 rounded-full border border-border pl-1 pr-2 py-1 text-sm hover:bg-muted">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initial}
            </span>
            <span className="hidden max-w-24 truncate sm:inline">{user.display_name}</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem render={<Link href="/settings" />}>
          <SettingsIcon className="size-4" />
          {t("Settings", "ตั้งค่า")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()} variant="destructive">
          <LogOut className="size-4" />
          {t("Sign out", "ออกจากระบบ")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useT();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 glass-light">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Waves className="size-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-sm font-semibold tracking-tight">
              FishHabitat<span className="text-accent">GeoAI</span>
            </span>
            <span className="text-[10px] text-muted-foreground tracking-wide">
              {t("Gulf of Thailand · Andaman Sea", "อ่าวไทย · ทะเลอันดามัน")}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0 xl:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-2 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary dark:text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="size-3.5" />
                {locale === "th" ? link.th : link.en}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <AccountMenu />

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="xl:hidden" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-4 font-heading">
                {t("Navigate", "เมนู")}
              </SheetTitle>
              <nav className="mt-2 flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                      pathname === link.href
                        ? "bg-primary/10 text-primary dark:text-accent"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon className="size-4" />
                    {locale === "th" ? link.th : link.en}
                  </Link>
                ))}
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                    pathname === "/settings"
                      ? "bg-primary/10 text-primary dark:text-accent"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <SettingsIcon className="size-4" />
                  {t("Settings", "ตั้งค่า")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
