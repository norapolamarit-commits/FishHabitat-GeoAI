"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Loader2, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/locale";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        await api.signup({ email, password, display_name: displayName });
      } else {
        await api.login({ email, password });
      }
      await refresh();
      router.push("/settings");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Something went wrong", "เกิดข้อผิดพลาดบางอย่าง"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* LEFT — pure visual panel, hidden on small screens (real reference image, no text) */}
      <div className="relative hidden overflow-hidden bg-[#04101C] lg:block">
        <Image
          src="/hero-illustration.jpg"
          alt="Satellite and oceanographic data network over a coastal fishing region"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="relative z-10 flex items-center gap-2 p-10 text-white">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Waves className="size-4.5" />
          </div>
          <span className="font-heading text-sm font-semibold tracking-tight">
            FishHabitat<span className="text-accent">GeoAI</span>
          </span>
        </div>
      </div>

      {/* RIGHT — bold statement + the actual login/signup form */}
      <div className="relative flex items-center justify-center overflow-hidden bg-[#04101C] px-4 py-16 text-white sm:px-6 lg:bg-background lg:text-foreground">
        <div className="relative z-10 w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              {t("GeoAI Research Platform", "แพลตฟอร์มวิจัย GeoAI")}
            </p>
            <h1 className="font-heading text-2xl font-bold uppercase leading-tight tracking-tight sm:text-3xl">
              {t("AI-Based Fishing Habitat", "")}{" "}
              <span className="bg-gradient-to-r from-[#4fd1f2] via-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
                {t("Suitability Assessment", "การประเมินความเหมาะสมของแหล่งทำประมงด้วย AI")}
              </span>
            </h1>
            <div className="mt-4 border-l-2 border-accent pl-3">
              <p className="text-sm leading-relaxed text-white/70 lg:text-muted-foreground">
                {t(
                  "Developing an AI system to assess fishing ground suitability from satellite and oceanographic data.",
                  "การพัฒนาระบบปัญญาประดิษฐ์เพื่อประเมินความเหมาะสมของพื้นที่ทำประมงจากข้อมูลดาวเทียมและข้อมูลสมุทรศาสตร์"
                )}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-sm lg:border-border lg:bg-card"
          >
            <h2 className="font-heading text-lg font-semibold">
              {mode === "login" ? t("Welcome back", "ยินดีต้อนรับกลับ") : t("Create an account", "สร้างบัญชี")}
            </h2>
            <p className="mt-1 text-xs text-white/60 lg:text-muted-foreground">
              {t(
                "Optional — the site is fully public without an account. Sign in to save your home location and species preference.",
                "ไม่จำเป็นต้องมี — เว็บไซต์นี้เปิดให้ใช้งานได้แบบสาธารณะโดยไม่ต้องมีบัญชี เข้าสู่ระบบเพื่อบันทึกตำแหน่งบ้านและพันธุ์ปลาที่คุณสนใจ"
              )}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <Label className="text-xs">{t("Display name", "ชื่อที่แสดง")}</Label>
                  <Input
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1.5"
                    placeholder={t("Your name", "ชื่อของคุณ")}
                  />
                </div>
              )}
              <div>
                <Label className="text-xs">{t("Email", "อีเมล")}</Label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label className="text-xs">{t("Password", "รหัสผ่าน")}</Label>
                <Input
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5"
                  placeholder={t("At least 8 characters", "อย่างน้อย 8 ตัวอักษร")}
                />
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : mode === "login" ? (
                  <LogIn className="size-4" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {mode === "login" ? t("Sign in", "เข้าสู่ระบบ") : t("Create account", "สร้างบัญชี")}
              </Button>
            </form>

            <button
              className="mt-5 w-full text-center text-xs text-white/60 hover:text-white lg:text-muted-foreground lg:hover:text-foreground"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
            >
              {mode === "login"
                ? t("Need an account? Sign up", "ยังไม่มีบัญชี? สมัครสมาชิก")
                : t("Already have an account? Sign in", "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ")}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
