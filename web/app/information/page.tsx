"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  Database,
  FlaskConical,
  Mail,
  GraduationCap,
  Users2,
  Waves,
  AlertTriangle,
  SearchX,
  Sprout,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { PageNav } from "@/components/page-nav";
import { useT } from "@/lib/locale";

const REFERENCES = [
  "Nurdin, S. et al. (2015). Sains Malaysiana 44(2):225-232.",
  "Yu, W. et al. (2015). PLOS ONE 10(4):e0122997.",
  "Zainuddin, M. et al. (2017). PLOS ONE 12(10):e0185601.",
  "Mugo, R., Saitoh, S. et al. (2020). PLOS ONE 15(8):e0237742.",
];

function PersonCard({ role, focus, index }: { role: string; focus: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border border-border bg-card p-6 text-center"
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-accent">
        <Users2 className="size-6" />
      </div>
      <h3 className="mt-3 font-heading text-sm font-semibold">{role}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{focus}</p>
    </motion.div>
  );
}

export default function InformationPage() {
  const t = useT();

  const MOTIVATION_CARDS = [
    {
      icon: Waves,
      tone: "text-secondary dark:text-accent",
      title: t("Research Motivation", "แรงจูงใจในการวิจัย"),
      body: t(
        "Thailand's coastal fisheries — anchored by skipjack tuna and Indian mackerel — support hundreds of thousands of livelihoods, but effort is often deployed on intuition and historical habit rather than current environmental conditions. Near-real-time satellite and reanalysis data now make it possible to estimate where conditions are favorable before a boat ever leaves port.",
        "การประมงชายฝั่งของไทย ซึ่งมีปลาโอแถบและปลาทูเป็นชนิดหลัก หล่อเลี้ยงชีวิตความเป็นอยู่ของผู้คนนับแสนครัวเรือน แต่การออกเรือส่วนใหญ่ยังอาศัยสัญชาตญาณและความเคยชินในอดีตมากกว่าสภาพแวดล้อมปัจจุบัน ข้อมูลดาวเทียมและข้อมูลการวิเคราะห์ซ้ำ (reanalysis) แบบใกล้เรียลไทม์ในปัจจุบันทำให้สามารถประเมินได้ว่าบริเวณใดมีสภาพเอื้ออำนวยก่อนที่เรือจะออกจากท่า"
      ),
    },
    {
      icon: AlertTriangle,
      tone: "text-warning",
      title: t("Problem Statement", "สภาพปัญหา"),
      body: t(
        "Overfishing pressure, a changing climate, and rising fuel costs make wasted fishing effort increasingly expensive — both economically and ecologically. Meanwhile, catch and effort records (CPUE) that would let a model learn directly from real outcomes are fragmented, delayed, or restricted to national fisheries agencies.",
        "แรงกดดันจากการทำประมงเกินขนาด การเปลี่ยนแปลงสภาพภูมิอากาศ และต้นทุนเชื้อเพลิงที่สูงขึ้น ทำให้การออกเรือที่สูญเปล่ามีต้นทุนสูงขึ้นเรื่อยๆ ทั้งในเชิงเศรษฐกิจและเชิงนิเวศ ในขณะเดียวกัน ข้อมูลปริมาณจับต่อหน่วยความพยายาม (CPUE) ที่จะช่วยให้โมเดลเรียนรู้จากผลลัพธ์จริงได้โดยตรงนั้น กลับกระจัดกระจาย ล่าช้า หรือถูกจำกัดการเข้าถึงไว้เฉพาะหน่วยงานประมงของรัฐ"
      ),
    },
    {
      icon: SearchX,
      tone: "text-danger",
      title: t("Research Gap", "ช่องว่างงานวิจัย"),
      body: t(
        "Most published habitat suitability work targets large open-ocean fisheries with institutional data access. Few openly reproducible platforms exist for semi-enclosed Southeast Asian seas, and fewer still are explicit about where their evidence is real and where it is a literature-derived stand-in.",
        "งานวิจัยด้านดัชนีความเหมาะสมของแหล่งที่อยู่อาศัยที่ตีพิมพ์ส่วนใหญ่มุ่งเน้นการประมงในทะเลเปิดขนาดใหญ่ที่มีหน่วยงานให้เข้าถึงข้อมูลได้ มีแพลตฟอร์มที่เปิดเผยและทำซ้ำได้สำหรับทะเลกึ่งปิดในเอเชียตะวันออกเฉียงใต้อยู่น้อยมาก และยิ่งมีน้อยกว่านั้นที่ระบุอย่างชัดเจนว่าส่วนใดเป็นหลักฐานจริง และส่วนใดเป็นค่าประมาณจากวรรณกรรม"
      ),
    },
  ];

  const OBJECTIVES = [
    {
      title: t("Open real-data pipeline", "ไปป์ไลน์ข้อมูลจริงแบบเปิด"),
      description: t(
        "Assemble a fully reproducible ingestion pipeline over the Gulf of Thailand and Andaman Sea using only free, no-authentication public sources.",
        "สร้างไปป์ไลน์การนำเข้าข้อมูลที่ทำซ้ำได้อย่างสมบูรณ์ ครอบคลุมอ่าวไทยและทะเลอันดามัน โดยใช้เฉพาะแหล่งข้อมูลสาธารณะที่ไม่มีค่าใช้จ่ายและไม่ต้องยืนยันตัวตน"
      ),
    },
    {
      title: t("Explainable multi-modal AI", "AI หลายรูปแบบข้อมูลที่อธิบายผลได้"),
      description: t(
        "Fuse satellite imagery, environmental variables, and historical time series through a CNN + gradient-boosted + LSTM stacking ensemble, explained with real SHAP values.",
        "ผสานภาพถ่ายดาวเทียม ตัวแปรสิ่งแวดล้อม และอนุกรมเวลาย้อนหลัง ผ่าน stacking ensemble ที่รวม CNN, gradient-boosted trees และ LSTM เข้าด้วยกัน พร้อมอธิบายผลด้วยค่า SHAP จริง"
      ),
    },
    {
      title: t("Radical data transparency", "ความโปร่งใสของข้อมูลอย่างถึงที่สุด"),
      description: t(
        "Label every number by its real basis — real observed, real derived, or literature proxy — so nothing is ever presented as more certain than it is.",
        "ระบุที่มาของตัวเลขทุกตัวอย่างชัดเจน ไม่ว่าจะเป็นค่าสังเกตจริง ค่าคำนวณจากข้อมูลจริง หรือค่าประมาณจากวรรณกรรม เพื่อไม่ให้มีการนำเสนอความแน่นอนเกินกว่าที่เป็นจริง"
      ),
    },
    {
      title: t("An interactive research platform", "แพลตฟอร์มวิจัยเชิงโต้ตอบ"),
      description: t(
        "Deliver a GIS map, prediction tool, and analytics dashboard usable by researchers, students, and coastal communities alike.",
        "ส่งมอบแผนที่ GIS เครื่องมือทำนายผล และแดชบอร์ดวิเคราะห์ข้อมูล ที่นักวิจัย นักศึกษา และชุมชนชายฝั่งสามารถนำไปใช้ได้จริง"
      ),
    },
  ];

  const PROJECT_TIMELINE = [
    {
      phase: t("Phase 1", "เฟส 1"),
      title: t("Region scoping & data pipeline", "กำหนดขอบเขตพื้นที่และไปป์ไลน์ข้อมูล"),
      detail: t(
        "Defined the Gulf of Thailand + Andaman Sea study area and target species; built ingestion for SST, chlorophyll-a, bathymetry, salinity, wind, and currents.",
        "กำหนดพื้นที่ศึกษาอ่าวไทยและทะเลอันดามัน รวมถึงชนิดพันธุ์เป้าหมาย และสร้างระบบนำเข้าข้อมูลอุณหภูมิผิวน้ำทะเล (SST) คลอโรฟิลล์-เอ ความลึกท้องทะเล ความเค็ม ลม และกระแสน้ำ"
      ),
    },
    {
      phase: t("Phase 2", "เฟส 2"),
      title: t("Habitat Suitability Index formulation", "การสร้างดัชนีความเหมาะสมของแหล่งที่อยู่อาศัย (HSI)"),
      detail: t(
        "Derived a literature-grounded HSI proxy for skipjack tuna and Indian mackerel from published suitability ranges, since no open CPUE dataset exists for the region.",
        "พัฒนาค่าประมาณดัชนี HSI สำหรับปลาโอแถบและปลาทู โดยอ้างอิงจากช่วงค่าความเหมาะสมที่ตีพิมพ์ในวรรณกรรม เนื่องจากยังไม่มีชุดข้อมูล CPUE แบบเปิดสำหรับภูมิภาคนี้"
      ),
    },
    {
      phase: t("Phase 3", "เฟส 3"),
      title: t("Multi-modal model development", "การพัฒนาโมเดลหลายรูปแบบข้อมูล"),
      detail: t(
        "Trained a frozen EfficientNet-B0 image branch, an XGBoost tabular branch, and an LSTM temporal branch, fused through a stacking meta-learner.",
        "ฝึกสอนสาขาภาพด้วย EfficientNet-B0 แบบตรึงพารามิเตอร์ (frozen) สาขาข้อมูลตารางด้วย XGBoost และสาขาข้อมูลเชิงเวลาด้วย LSTM แล้วผสานรวมด้วย stacking meta-learner"
      ),
    },
    {
      phase: t("Phase 4", "เฟส 4"),
      title: t("Explainability & platform build", "การอธิบายผลโมเดลและการสร้างแพลตฟอร์ม"),
      detail: t(
        "Wired real SHAP explanations into the API and built the map, prediction, and analytics interfaces around it.",
        "เชื่อมต่อการอธิบายผลด้วยค่า SHAP จริงเข้ากับ API และสร้างส่วนติดต่อผู้ใช้สำหรับแผนที่ การทำนายผล และการวิเคราะห์ข้อมูลโดยรอบ"
      ),
    },
    {
      phase: t("Phase 5", "เฟส 5"),
      title: t("Evaluation & open release", "การประเมินผลและการเผยแพร่แบบเปิด"),
      detail: t(
        "Spatial-block validation, honest reporting of model limitations, and publication of the platform and methodology for reuse.",
        "ตรวจสอบความถูกต้องด้วยวิธี spatial-block validation รายงานข้อจำกัดของโมเดลอย่างตรงไปตรงมา และเผยแพร่แพลตฟอร์มพร้อมระเบียบวิธีเพื่อให้นำไปใช้ซ้ำได้"
      ),
    },
  ];

  const ADVISOR = {
    role: t("Faculty Advisor", "อาจารย์ที่ปรึกษาโครงการ"),
    focus: t("Fisheries science & remote sensing supervision", "ที่ปรึกษาด้านวิทยาศาสตร์การประมงและการสำรวจระยะไกล"),
  };

  const RESEARCHERS = [
    {
      role: t("Research Lead", "หัวหน้าโครงการวิจัย"),
      focus: t("Project scope, HSI methodology, evaluation design", "ขอบเขตโครงการ ระเบียบวิธี HSI การออกแบบการประเมินผล"),
    },
    {
      role: t("GeoAI / ML Engineer", "วิศวกร GeoAI / ML"),
      focus: t("Data pipeline, model architecture, explainability", "ไปป์ไลน์ข้อมูล สถาปัตยกรรมโมเดล การอธิบายผล"),
    },
    {
      role: t("Frontend & Platform Engineer", "วิศวกรฟรอนต์เอนด์และแพลตฟอร์ม"),
      focus: t("GIS map, dashboard, and prediction interface", "แผนที่ GIS แดชบอร์ด และส่วนติดต่อการทำนายผล"),
    },
  ];

  const TOPIC_CARDS = [
    {
      href: "/ai",
      icon: Cpu,
      title: t("AI Architecture", "สถาปัตยกรรม AI"),
      description: t(
        "A real, dual-branch stacking ensemble — EfficientNet-B0, oceanographic features, a per-station LSTM, and a stacking meta-learner, explained with SHAP.",
        "stacking ensemble สองสาขาที่เป็นของจริง ประกอบด้วย EfficientNet-B0 คุณลักษณะเชิงสมุทรศาสตร์ LSTM รายสถานี และ stacking meta-learner อธิบายผลด้วย SHAP"
      ),
    },
    {
      href: "/datasets",
      icon: Database,
      title: t("Datasets", "ชุดข้อมูล"),
      description: t(
        "Nineteen datasets referenced by the project spec — each honestly marked as a live, real, no-auth source this build actually uses, or not yet wired in.",
        "ชุดข้อมูลสิบเก้าชุดที่อ้างอิงในสเปกโครงการ — แต่ละชุดระบุอย่างตรงไปตรงมาว่าเป็นแหล่งข้อมูลสดจริงที่ไม่ต้องยืนยันตัวตนซึ่งระบบนี้ใช้งานจริง หรือยังไม่ได้เชื่อมต่อใช้งาน"
      ),
    },
    {
      href: "/research",
      icon: FlaskConical,
      title: t("Research", "งานวิจัย"),
      description: t(
        "Methodology and honest evaluation — real metrics from the actual trained ensemble, including a genuinely underperforming baseline, reported as-is.",
        "ระเบียบวิธีและการประเมินผลอย่างตรงไปตรงมา — ค่าตัวชี้วัดจริงจากโมเดล ensemble ที่ฝึกสอนจริง รวมถึง baseline ที่ประสิทธิภาพต่ำกว่าจริงๆ ซึ่งรายงานตามความเป็นจริง"
      ),
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow={t("Information", "ข้อมูลโครงการ")}
            title={t(
              "Why We Built an Open GeoAI Platform for Thai Fisheries",
              "ทำไมเราจึงสร้างแพลตฟอร์ม GeoAI แบบเปิดสำหรับการประมงไทย"
            )}
            description={t(
              "A student research project built end-to-end with faculty supervision — the motivation, the team, the AI architecture, the data catalog, and the research methodology all in one place.",
              "โครงการวิจัยของนักศึกษาที่พัฒนาแบบครบวงจรภายใต้การดูแลของอาจารย์ที่ปรึกษา — รวมแรงจูงใจ ทีมงาน สถาปัตยกรรม AI แคตตาล็อกข้อมูล และระเบียบวิธีวิจัยไว้ในที่เดียว"
            )}
          />
        </div>
      </section>

      {/* MOTIVATION / PROBLEM / GAP */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {MOTIVATION_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-7"
            >
              <card.icon className={`size-7 ${card.tone}`} />
              <h3 className="mt-4 font-heading text-lg font-semibold">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* OBJECTIVES */}
      <section className="bg-muted/40 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow={t("What this project sets out to do", "สิ่งที่โครงการนี้มุ่งดำเนินการ")}
            title={t("Four objectives", "วัตถุประสงค์สี่ประการ")}
            description={t(
              "Each objective is scoped to what open data and disclosed methodology can honestly support.",
              "แต่ละวัตถุประสงค์ถูกกำหนดขอบเขตตามสิ่งที่ข้อมูลเปิดและระเบียบวิธีที่เปิดเผยสามารถรองรับได้อย่างตรงไปตรงมา"
            )}
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {OBJECTIVES.map((obj, i) => (
              <motion.div
                key={obj.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary dark:text-accent">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold">{obj.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {obj.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPECTED IMPACT */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success"
          >
            <Sprout className="size-7" />
          </motion.div>
          <SectionHeading
            title={t("Expected Impact", "ผลกระทบที่คาดหวัง")}
            description={t(
              "If the open-data approach proves informative, the same architecture is designed to be upgraded — swap the literature proxy for real CPUE data, or add Copernicus Marine/Sentinel Hub layers, without redesigning the platform. In the meantime, it offers a free, transparent decision-support reference for researchers, students, and coastal communities in the region.",
              "หากแนวทางข้อมูลเปิดนี้พิสูจน์ได้ว่าเป็นประโยชน์ สถาปัตยกรรมเดียวกันนี้ถูกออกแบบมาให้สามารถอัปเกรดได้ — เปลี่ยนจากค่าประมาณจากวรรณกรรมเป็นข้อมูล CPUE จริง หรือเพิ่มชั้นข้อมูลจาก Copernicus Marine/Sentinel Hub โดยไม่ต้องออกแบบแพลตฟอร์มใหม่ ในระหว่างนี้ แพลตฟอร์มนี้เป็นแหล่งอ้างอิงสนับสนุนการตัดสินใจที่ไม่มีค่าใช้จ่ายและโปร่งใส สำหรับนักวิจัย นักศึกษา และชุมชนชายฝั่งในภูมิภาค"
            )}
          />
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-muted/40 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow={t("How we got here", "เส้นทางที่ผ่านมา")}
            title={t("Project Timeline", "ไทม์ไลน์โครงการ")}
          />
          <div className="mt-14 space-y-0">
            {PROJECT_TIMELINE.map((item, i) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative flex gap-6 pb-10 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-[#04141F] font-heading text-xs font-bold">
                    {i + 1}
                  </div>
                  {i < PROJECT_TIMELINE.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {item.phase}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 flex items-center justify-center gap-2 text-center font-heading text-lg font-semibold">
            <GraduationCap className="size-5 text-accent" />
            {t("Advisor", "อาจารย์ที่ปรึกษา")}
          </h2>
          <div className="mx-auto max-w-xs">
            <PersonCard role={ADVISOR.role} focus={ADVISOR.focus} index={0} />
          </div>

          <h2 className="mb-6 mt-14 text-center font-heading text-lg font-semibold">
            {t("Researchers", "ทีมนักวิจัย")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {RESEARCHERS.map((r, i) => (
              <PersonCard key={r.role} role={r.role} focus={r.focus} index={i} />
            ))}
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading text-sm font-semibold">{t("Contact", "ติดต่อ")}</h3>
              <div className="mt-4 space-y-3 text-sm">
                <a
                  href="mailto:research@fishhabitatgeoai.org"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-4" />
                  research@fishhabitatgeoai.org
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading text-sm font-semibold">{t("Key References", "เอกสารอ้างอิงหลัก")}</h3>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                {REFERENCES.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI ARCHITECTURE / DATASETS / RESEARCH — link cards to the existing full pages */}
      <section className="bg-muted/40 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center font-heading text-lg font-semibold">
            {t("Explore the model and the evidence", "สำรวจโมเดลและหลักฐาน")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {TOPIC_CARDS.map((card, i) => (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-accent/15 group-hover:text-accent dark:text-accent">
                    <card.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-base font-semibold">{card.title}</h3>
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

      <PageNav current="/information" />
    </div>
  );
}
