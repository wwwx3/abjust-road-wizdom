import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MiniMap } from "@/components/mini-map";
import { casesStore, useCases } from "@/lib/cases-store";
import { slaHint } from "@/lib/ai-pipeline";
import { Sparkles, Layers, Building2, Gauge, CheckCircle2, ArrowRight, Plus, Home, AlertTriangle, GitMerge } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/report/result")({
  head: () => ({ meta: [{ title: "ผลการประเมิน — Abjust" }] }),
  component: ResultPage,
});

function ResultPage() {
  const all = useCases();
  const id = casesStore.getLastCreatedId();
  const c = (id && all.find((x) => x.id === id)) || all[0];

  const wasMerged = c.mergedReports > 1 && c.updatedAt === "เมื่อสักครู่";

  const riskTone = c.riskLevel === "สูงมาก"
    ? "bg-danger/30"
    : c.riskLevel === "สูง"
      ? "bg-brand/40"
      : c.riskLevel === "ปานกลาง"
        ? "bg-info/30"
        : "bg-muted";

  return (
    <AppShell title="ผลการประเมินรายงาน" subtitle="ระบบสรุปและจัดลำดับความเสี่ยงเรียบร้อย">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> ส่งรายงานสำเร็จ · ระบบประมวลผลเสร็จสิ้น
        </div>

        {/* Hero summary card */}
        <div className="card-elevated overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-[oklch(0.32_0.07_265)] p-6 sm:p-7 text-primary-foreground">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono opacity-70">
                  {wasMerged ? "เคสที่รับรายงานของคุณ" : "เคสใหม่ของคุณ"}
                </div>
                <div className="mt-1 text-xl font-bold">{c.id}</div>
                {wasMerged && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                    <GitMerge className="h-3.5 w-3.5" /> AI รวมรายงานเข้ากับเคสเดิม · ตอนนี้มี {c.mergedReports} ฉบับ
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70">Risk Score</div>
                <div className="text-5xl font-extrabold tracking-tight">{Math.round(c.riskScore)}</div>
                <div className={cn("mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", riskTone)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-white" /> ระดับ: {c.riskLevel}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-info" /> AI-assisted Summary
              </div>
              <div className="mt-2 rounded-2xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
                {c.summary}
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Priority weighting · ความเสี่ยง 40% · ผู้ได้รับผลกระทบ 25% · จำนวนผู้แจ้ง 15% · ระยะเวลาค้าง 10% · ภาพ 10%
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <Stat
                icon={<Layers className="h-4 w-4" />}
                tone="bg-success/10 text-success"
                label="จำนวนรายงานในเคสนี้"
                value={`${c.mergedReports} ฉบับ`}
                hint="AI รวมรายงานในรัศมี 150 ม. หมวดเดียวกัน"
              />
              <Stat
                icon={<Building2 className="h-4 w-4" />}
                tone="bg-info/10 text-info"
                label="หน่วยงานที่เสนอแนะ"
                value={c.unit}
                hint="ตามประเภทปัญหาและพื้นที่"
              />
              <Stat
                icon={<Gauge className="h-4 w-4" />}
                tone="bg-brand/15 text-[oklch(0.42_0.13_60)]"
                label="SLA แนะนำ"
                value={slaHint(c.riskLevel).split(" · ")[0]}
                hint={slaHint(c.riskLevel).split(" · ")[1] ?? ""}
              />
            </div>

            <MiniMap label={c.location.label} />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          <Link
            to="/citizen/timeline"
            className="card-elevated p-4 hover:soft-shadow transition flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">ดู Timeline ของเคสนี้</div>
              <div className="text-xs text-muted-foreground truncate">ติดตามความคืบหน้าทุกขั้นตอน</div>
            </div>
          </Link>
          <Link
            to="/report"
            className="card-elevated p-4 hover:soft-shadow transition flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/20 text-[oklch(0.42_0.13_60)]">
              <Plus className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">ส่งรายงานใหม่</div>
              <div className="text-xs text-muted-foreground truncate">แจ้งปัญหาเพิ่มเติม</div>
            </div>
          </Link>
          <Link
            to="/"
            className="card-elevated p-4 hover:soft-shadow transition flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-foreground">
              <Home className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">กลับหน้าแรก</div>
              <div className="text-xs text-muted-foreground truncate">ภาพรวมแพลตฟอร์ม</div>
            </div>
          </Link>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>ผลลัพธ์นี้เป็นการประเมินแบบ rule-based AI fallback สำหรับ Prototype — เวอร์ชันจริงจะใช้ LLM และ vision model</span>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon, tone, label, value, hint }: { icon: React.ReactNode; tone: string; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`inline-grid h-8 w-8 place-items-center rounded-lg ${tone}`}>{icon}</div>
      <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{hint}</div>
    </div>
  );
}
