import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CATEGORIES, SAMPLE_REPORT, riskLevelOf as _legacy } from "@/lib/abjust-data";
import { MiniMap } from "@/components/mini-map";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Camera,
  Send,
  AlertTriangle,
  ChevronDown,
  Wand2,
  Crosshair,
  X,
  Video,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { casesStore } from "@/lib/cases-store";

// silence unused legacy import warning (kept for backward-compat re-export)
void _legacy;

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

interface Attachment {
  id: string;
  name: string;
  size: number;
  kind: "image" | "video";
  url: string;
}

function ReportPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [urgency, setUrgency] = useState("high");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach((a) => URL.revokeObjectURL(a.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useSample = () => {
    setCategory(SAMPLE_REPORT.category);
    setDesc(SAMPLE_REPORT.description);
    setLat(String(SAMPLE_REPORT.lat));
    setLng(String(SAMPLE_REPORT.lng));
    setLabel(SAMPLE_REPORT.label);
    setNote(SAMPLE_REPORT.note);
    setUrgency("critical");
    setError(null);
  };

  const useCurrent = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(5));
          setLng(pos.coords.longitude.toFixed(5));
          setLabel("ตำแหน่งปัจจุบันของคุณ");
        },
        () => {
          setLat("13.7563");
          setLng("100.5018");
          setLabel("ตำแหน่งปัจจุบัน · กรุงเทพฯ (จำลอง)");
        },
        { timeout: 5000 },
      );
    } else {
      setLat("13.7563");
      setLng("100.5018");
      setLabel("ตำแหน่งปัจจุบัน · กรุงเทพฯ (จำลอง)");
    }
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const limit = 10 * 1024 * 1024;
    const added: Attachment[] = [];
    Array.from(files).forEach((f) => {
      if (f.size > limit * 5) return; // 50 MB hard cap for video demo
      const kind: "image" | "video" = f.type.startsWith("video/") ? "video" : "image";
      added.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        size: f.size,
        kind,
        url: URL.createObjectURL(f),
      });
    });
    setAttachments((prev) => [...prev, ...added]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  const submit = () => {
    setError(null);
    if (!category) {
      setError("กรุณาเลือกประเภทปัญหา");
      return;
    }
    if (!desc.trim()) {
      setError("กรุณากรอกรายละเอียดเหตุการณ์");
      return;
    }
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (Number.isNaN(latN) || Number.isNaN(lngN)) {
      setError("กรุณาระบุพิกัด (ใช้ปุ่ม 'ใช้ตำแหน่งปัจจุบัน' ได้)");
      return;
    }
    setSubmitting(true);

    // --- AI pipeline (offline rule-based) ---
    const impactedCount = impactedFromUrgency(urgency);
    const openCases = casesStore
      .getAll()
      .filter((c) => c.status !== "แก้ไขเสร็จสิ้น")
      .map((c) => ({ id: c.id, category: c.category, lat: c.location.lat, lng: c.location.lng }));
    const dup = findDuplicate(openCases, { category, lat: latN, lng: lngN });

    if (dup) {
      casesStore.incrementMerged(dup.case.id);
      setTimeout(() => router.navigate({ to: "/report/result" }), 400);
      return;
    }

    const recurrence = casesStore
      .getAll()
      .filter((c) => c.category === category).length;
    const risk = riskScore({ category, impactedCount, recurrenceCount: recurrence });
    const level = riskLevelOf(risk);
    const imageSeverity = attachments.length > 0 ? 60 : 25;
    const _prio = priorityScore({
      risk,
      impactedCount,
      reporterCount: 1,
      ageHours: 0,
      imageSeverity,
    });
    const summary = generateDescription({
      category,
      description: desc,
      lat: latN,
      lng: lngN,
      locationLabel: label,
    });
    const id = nextCaseId();
    const newCase: Case = {
      id,
      category,
      title: desc.split("\n")[0].slice(0, 70) || `รายงาน ${category}`,
      summary: summary + ` · SLA: ${slaHint(level)}`,
      riskScore: risk,
      riskLevel: level,
      status: "รับเรื่องแล้ว",
      mergedReports: 1,
      unit: recommendUnit(category),
      district: label || "ไม่ระบุเขต",
      location: { lat: latN, lng: lngN, label: label || "พิกัดที่ผู้แจ้งระบุ" },
      updatedAt: "เมื่อสักครู่",
      currentStep: 2,
    };
    casesStore.addCase(newCase);

    setTimeout(() => router.navigate({ to: "/report/result" }), 400);
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

          <Section title="C. หลักฐาน (ภาพถ่าย / วิดีโอ)" subtitle="แนบหลักฐานเพื่อให้ AI ประเมินความรุนแรงจากภาพได้แม่นยำขึ้น">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/40 hover:bg-muted px-4 py-5 transition"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-card text-muted-foreground">
                <Upload className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">
                  แตะเพื่อแนบรูปภาพหรือวิดีโอ
                </div>
                <div className="text-xs text-muted-foreground">JPG, PNG, MP4, MOV · เลือกได้หลายไฟล์</div>
              </div>
            </button>

            {attachments.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attachments.map((a) => (
                  <div key={a.id} className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-video">
                    {a.kind === "image" ? (
                      <img src={a.url} alt={a.name} className="h-full w-full object-cover" />
                    ) : (
                      <video src={a.url} className="h-full w-full object-cover" muted playsInline />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] text-white truncate flex items-center gap-1">
                      {a.kind === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      <span className="truncate">{a.name}</span>
                    </div>
                    <button
                      onClick={() => removeAttachment(a.id)}
                      aria-label="ลบไฟล์"
                      className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {attachments.length > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                <Camera className="h-3 w-3" /> แนบแล้ว {attachments.length} ไฟล์ · AI จะใช้ประเมิน image severity
              </div>
            )}

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

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          <div className="card-elevated p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-info/10 text-info shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-sm">
                <div className="font-semibold text-foreground">พร้อมส่งเข้าระบบประเมินความเสี่ยง</div>
                <div className="text-xs text-muted-foreground">AI จะสรุป จัดลำดับ และตรวจหารายงานซ้ำภายในไม่กี่วินาที</div>
              </div>
            </div>
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition w-full sm:w-auto justify-center disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> {submitting ? "กำลังประมวลผล…" : "ส่งรายงาน"}
            </button>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Prototype นี้เป็นการสาธิตเท่านั้น ข้อมูลจะถูกประมวลผลในเครื่องและไม่ถูกส่งไปยังหน่วยงานจริง</span>
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
