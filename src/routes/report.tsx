import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CATEGORIES, SAMPLE_REPORT } from "@/lib/abjust-data";
import { MiniMap } from "@/components/mini-map";
import { useState } from "react";
import {
  Sparkles,
  MapPin,
  Camera,
  Send,
  AlertTriangle,
  ChevronDown,
  Wand2,
  Crosshair,
} from "lucide-react";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "แจ้งปัญหาจราจร — Abjust" }] }),
  component: ReportPage,
});

const urgencyLevels = [
  { value: "low", label: "ไม่เร่งด่วน", desc: "พบเห็นทั่วไป", tone: "border-border bg-card" },
  { value: "med", label: "เร่งด่วนปานกลาง", desc: "ควรดำเนินการเร็ว", tone: "border-info/40 bg-info/5" },
  { value: "high", label: "เร่งด่วน", desc: "กระทบการเดินทาง", tone: "border-brand/40 bg-brand/10" },
  { value: "critical", label: "เร่งด่วนมาก", desc: "เสี่ยงต่อชีวิต", tone: "border-danger/40 bg-danger/5" },
];

function ReportPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(false);
  const [urgency, setUrgency] = useState("high");

  const useSample = () => {
    setCategory(SAMPLE_REPORT.category);
    setDesc(SAMPLE_REPORT.description);
    setLat(String(SAMPLE_REPORT.lat));
    setLng(String(SAMPLE_REPORT.lng));
    setLabel(SAMPLE_REPORT.label);
    setNote(SAMPLE_REPORT.note);
    setPhoto(true);
    setUrgency("critical");
  };

  const useCurrent = () => {
    setLat("13.7563");
    setLng("100.5018");
    setLabel("ตำแหน่งปัจจุบัน · กรุงเทพฯ");
  };

  const submit = () => {
    router.navigate({ to: "/report/result" });
  };

  return (
    <AppShell
      title="แจ้งปัญหาจราจร"
      subtitle="กรอกข้อมูลให้ครบถ้วนเพื่อให้ระบบประเมินความเสี่ยงได้แม่นยำ"
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success font-bold">1</span>
            ขั้นตอนที่ 1 จาก 1 — กรอกข้อมูล
          </div>
          <button
            onClick={useSample}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-[oklch(0.42_0.13_60)] hover:bg-brand/20 transition"
          >
            <Wand2 className="h-3.5 w-3.5" /> ใช้ข้อมูลตัวอย่าง
          </button>
        </div>

        <div className="space-y-4">
          <Section title="A. ข้อมูลปัญหา" subtitle="เลือกประเภทและอธิบายเหตุการณ์โดยย่อ">
            <Field label="ประเภทปัญหา" required>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-input bg-card px-4 py-3 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value="">เลือกประเภทปัญหา…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </Field>
            <Field label="รายละเอียดเหตุการณ์" required>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                placeholder="อธิบายสิ่งที่พบ เช่น ตำแหน่ง ลักษณะรถ ผลกระทบ ฯลฯ"
                className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
              />
            </Field>
          </Section>

          <Section title="B. ตำแหน่ง" subtitle="ระบุตำแหน่งของปัญหา (ตัวอย่างใช้แผนที่จำลอง)">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Latitude">
                <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="13.7563" className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring/40" />
              </Field>
              <Field label="Longitude">
                <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="100.5018" className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring/40" />
              </Field>
            </div>
            <button
              onClick={useCurrent}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition"
            >
              <Crosshair className="h-3.5 w-3.5" /> ใช้ตำแหน่งปัจจุบัน
            </button>
            <div className="mt-3">
              <MiniMap label={label || "ยังไม่ระบุตำแหน่ง — กรอกพิกัดหรือใช้ตำแหน่งปัจจุบัน"} />
            </div>
          </Section>

          <Section title="C. หลักฐาน" subtitle="แนบภาพถ่ายและบันทึกเพิ่มเติม (ไม่บังคับ)">
            <button
              onClick={() => setPhoto((p) => !p)}
              className={`flex w-full items-center gap-4 rounded-xl border-2 border-dashed px-4 py-5 transition ${
                photo ? "border-success/40 bg-success/5" : "border-border bg-muted/40 hover:bg-muted"
              }`}
            >
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${photo ? "bg-success/15 text-success" : "bg-card text-muted-foreground"}`}>
                <Camera className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">
                  {photo ? "แนบรูปภาพแล้ว · evidence_2410.jpg" : "แตะเพื่อแนบรูปภาพ"}
                </div>
                <div className="text-xs text-muted-foreground">JPG, PNG · สูงสุด 10 MB</div>
              </div>
            </button>
            <Field label="บันทึกเพิ่มเติม (optional)" className="mt-3">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น พบบ่อยช่วงเวลาเร่งด่วน" className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
            </Field>
          </Section>

          <Section title="D. ระดับความเร่งด่วน" subtitle="ระบบจะนำไปประกอบการคำนวณ Risk Score">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {urgencyLevels.map((u) => (
                <button
                  key={u.value}
                  onClick={() => setUrgency(u.value)}
                  className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                    urgency === u.value ? "border-primary ring-2 ring-primary/15" : u.tone
                  }`}
                >
                  <div className="text-sm font-semibold text-foreground">{u.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{u.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          <div className="card-elevated p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-info/10 text-info shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-sm">
                <div className="font-semibold text-foreground">พร้อมส่งเข้าระบบประเมินความเสี่ยง</div>
                <div className="text-xs text-muted-foreground">AI จะสรุปและให้ Risk Score ภายในไม่กี่วินาที</div>
              </div>
            </div>
            <button
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition w-full sm:w-auto justify-center"
            >
              <Send className="h-4 w-4" /> ส่งรายงาน
            </button>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Prototype นี้ไม่ได้ส่งข้อมูลจริงไปยัง Traffy Fondue/BMA — ใช้สำหรับการสาธิตเท่านั้น</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-5 sm:p-6">
      <div className="mb-4">
        <div className="text-sm font-bold text-foreground">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-foreground">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
