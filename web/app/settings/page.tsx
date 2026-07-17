"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LogOut, Save, Loader2, UserCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useT } from "@/lib/locale";

const LocationPicker = dynamic(
  () => import("@/components/predict/location-picker").then((m) => m.LocationPicker),
  { ssr: false }
);

export default function SettingsPage() {
  const t = useT();
  const SPECIES = [
    { value: "Katsuwonus pelamis", label: t("Skipjack tuna", "ปลาโอแถบ") },
    { value: "Rastrelliger kanagurta", label: t("Indian mackerel", "ปลาลัง") },
  ];
  const { user, loading, refresh, logout } = useAuth();
  const [lat, setLat] = useState(9.5);
  const [lon, setLon] = useState(100.5);
  const [species, setSpecies] = useState(SPECIES[0].value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLat(user.home_lat ?? 9.5);
    setLon(user.home_lon ?? 100.5);
    setSpecies(user.target_species ?? "Katsuwonus pelamis");
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await api.updatePreferences({ home_lat: lat, home_lon: lon, target_species: species });
      await refresh();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <UserCircle className="mb-4 size-10 text-muted-foreground" />
        <h1 className="font-heading text-xl font-semibold">
          {t("Sign in to view settings", "เข้าสู่ระบบเพื่อดูการตั้งค่า")}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t(
            "Settings are only for saving personal preferences. The rest of the platform stays fully public without an account.",
            "การตั้งค่ามีไว้สำหรับบันทึกความต้องการส่วนตัวเท่านั้น ส่วนที่เหลือของแพลตฟอร์มยังคงเปิดให้ใช้งานได้แบบสาธารณะโดยไม่ต้องมีบัญชี"
          )}
        </p>
        <Button className="mt-6 gap-2" render={<Link href="/login" />}>
          <LogIn className="size-4" />
          {t("Sign in", "เข้าสู่ระบบ")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow={t("Settings", "การตั้งค่า")}
        title={t("Your Preferences", "การตั้งค่าของคุณ")}
        subtitleThai="จัดการโปรไฟล์ ตำแหน่งบ้าน และพันธุ์เป้าหมายที่คุณสนใจ"
        subtitleEn="Manage your profile, home location, and target species preference."
      />

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-sm font-semibold">{t("Profile", "โปรไฟล์")}</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("Display name", "ชื่อที่แสดง")}</span>
                <span className="font-medium">{user.display_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("Email", "อีเมล")}</span>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-sm font-semibold">
              {t("Home location & target species", "ตำแหน่งบ้าน & พันธุ์เป้าหมาย")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                "Used to personalize your default Map and Prediction view.",
                "ใช้เพื่อปรับแต่งมุมมองเริ่มต้นของหน้าแผนที่และการพยากรณ์ให้เหมาะกับคุณ"
              )}
            </p>

            <div className="mt-4">
              <LocationPicker
                lat={lat}
                lon={lon}
                onChange={(la, lo) => {
                  setLat(la);
                  setLon(lo);
                }}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.01"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
              />
              <Input
                type="number"
                step="0.01"
                value={lon}
                onChange={(e) => setLon(parseFloat(e.target.value))}
              />
            </div>

            <div className="mt-4">
              <Label className="text-xs">{t("Target species", "พันธุ์เป้าหมาย")}</Label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {SPECIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleSave} disabled={saving} className="mt-5 w-full gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saved ? t("Saved", "บันทึกแล้ว") : t("Save preferences", "บันทึกการตั้งค่า")}
            </Button>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={() => logout()}>
            <LogOut className="size-4" />
            {t("Sign out", "ออกจากระบบ")}
          </Button>
        </div>
      </section>
    </div>
  );
}
