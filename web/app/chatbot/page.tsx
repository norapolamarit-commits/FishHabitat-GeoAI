"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2, MessageCircle, BookOpenText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeroImage } from "@/components/page-hero-image";
import { PageNav } from "@/components/page-nav";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/locale";

interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: "llm" | "retrieval";
}

export default function ChatbotPage() {
  const t = useT();
  const { user } = useAuth();

  const SUGGESTIONS = [
    t("What does the suitability score mean?", "คะแนนความเหมาะสมหมายถึงอะไร"),
    t("How is risk calculated?", "ความเสี่ยงคำนวณอย่างไร"),
    t(
      "What model architecture does this platform use?",
      "แพลตฟอร์มนี้ใช้สถาปัตยกรรมโมเดลแบบใด"
    ),
    t(
      "Which datasets are real vs not wired in?",
      "ชุดข้อมูลใดเป็นข้อมูลจริง และชุดใดยังไม่ได้เชื่อมต่อ"
    ),
  ];
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.chatStatus().then((r) => setConfigured(r.configured)).catch(() => setConfigured(false));
    if (user) {
      api
        .chatHistory()
        .then((r) => setMessages(r.messages.map((m) => ({ role: m.role, content: m.content }))))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.sendChat(text);
      setMessages((m) => [...m, { role: "assistant", content: res.response, mode: res.mode }]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t("Failed to reach the chatbot", "ไม่สามารถเชื่อมต่อกับแชทบอทได้")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeroImage
        eyebrow={t("Chatbot", "แชทบอท")}
        title={t("Ask About the Platform", "สอบถามเกี่ยวกับแพลตฟอร์ม")}
        subtitleThai="ขับเคลื่อนด้วย Pathumma (AI FOR THAI / NECTEC) เมื่อมีการตั้งค่า API key และค้นคืนข้อมูลจากเอกสารจริงของแพลตฟอร์มนี้เสมอ"
        subtitleEn="Powered by Pathumma (AI FOR THAI / NECTEC) when configured, with real documentation retrieval always underneath — never a canned demo response."
      />

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto flex h-[65vh] max-w-2xl flex-col rounded-2xl border border-border bg-card">
          {configured === false && (
            <div className="flex items-start gap-2 border-b border-border bg-warning/10 px-4 py-2.5 text-xs text-warning">
              <BookOpenText className="mt-0.5 size-3.5 shrink-0" />
              <p>
                {t(
                  "No Pathumma API key is configured, so answers come straight from this platform's real documentation instead of a generative model.",
                  "ยังไม่ได้ตั้งค่า API key ของ Pathumma คำตอบจึงมาจากเอกสารจริงของแพลตฟอร์มนี้โดยตรง แทนที่จะเป็นโมเดลเชิงสร้างสรรค์"
                )}{" "}
                <a
                  href="https://aiforthai.in.th"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {t("Register a free key", "ลงทะเบียนรับ key ฟรี")}
                </a>{" "}
                {t("and set", "และตั้งค่า")}{" "}
                <code className="rounded bg-muted px-1 py-0.5">AIFORTHAI_APIKEY</code>{" "}
                {t("for fuller, generated answers.", "เพื่อให้ได้คำตอบที่สมบูรณ์ยิ่งขึ้นจากการสร้างขึ้นจริง")}
              </p>
            </div>
          )}

          {configured === null && messages.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {configured !== null && (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <MessageCircle className="size-8 text-accent/60" />
                    <p className="text-sm text-muted-foreground">
                      {t("Ask a question, or try one of these:", "ถามคำถาม หรือลองข้อความเหล่านี้:")}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                          m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/15 text-accent"
                        }`}
                      >
                        {m.role === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                    {m.role === "assistant" && m.mode && (
                      <span className="mt-1 ml-9 flex items-center gap-1 text-[10px] text-muted-foreground">
                        {m.mode === "llm" ? (
                          <>
                            <Sparkles className="size-3" />
                            {t("Pathumma-generated", "สร้างโดย Pathumma")}
                          </>
                        ) : (
                          <>
                            <BookOpenText className="size-3" />
                            {t("Matched from documentation", "จับคู่จากเอกสาร")}
                          </>
                        )}
                      </span>
                    )}
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    {t("Thinking...", "กำลังคิด...")}
                  </div>
                )}
                {error && <p className="text-xs text-danger">{error}</p>}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex gap-2 border-t border-border p-3"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("Ask a question about the platform...", "ถามคำถามเกี่ยวกับแพลตฟอร์ม...")}
                  disabled={loading}
                />
                <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </div>
        {!user && (
          <p className="mx-auto mt-3 max-w-2xl text-center text-xs text-muted-foreground">
            {t("Sign in to save your chat history across visits.", "เข้าสู่ระบบเพื่อบันทึกประวัติการแชทของคุณในทุกครั้งที่เข้าใช้งาน")}
          </p>
        )}
      </section>

      <PageNav current="/chatbot" />
    </div>
  );
}
