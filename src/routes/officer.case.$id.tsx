import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RiskBadge, StatusBadge } from "@/components/badges";
import { MiniMap } from "@/components/mini-map";
import { STATUS_ORDER, TIMELINE_STEPS, type Status } from "@/lib/abjust-data";
import { casesStore, useCase } from "@/lib/cases-store";
import { useRole } from "@/lib/use-role";
import { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Layers,
  Building2,
  Camera,
  ShieldAlert,
  Send,
  CheckCircle2,
  Bell,
  Eye,
  ChevronDown,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/officer/case/$id")({
  head: () => ({ meta: [{ title: "รายละเอียดเคส — Abjust" }] }),
  component: CaseDetail,
});

function CaseDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const c = useCase(id);
  const [role] = useRole();
  const [notified, setNotified] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const viewOnly = role !== "officer";

  if (!c) {
    return (
      <AppShell title="ไม่พบเคส">
        <div className="card-elevated p-8 text-center">
          <div className="text-sm text-muted-foreground">ไม่พบเคสที่ระบุ</div>
          <button onClick={() => router.navigate({ to: "/officer" })} className="mt-4 text-sm font-semibold text-primary">
            ← กลับไปหน้า Dashboard
          </button>
        </div>
      </AppShell>
    );
  }

  const status = c.status;
  const setStatus = (s: Status) => {
    casesStore.updateStatus(c.id, s);
    setFlash(`อัปเดตสถานะเป็น: ${s}`);
    setTimeout(() => setFlash(null), 2000);
  };
  const notify = () => {
    setNotified(true);
    setFlash(`แจ้งเตือนผู้รายงาน ${c.mergedReports} รายผ่าน LINE/SMS แล้ว`);
    setTimeout(() => setFlash(null), 2500);
  };

  const mergedReports = Array.from({ length: Math.min(c.mergedReports, 5) }).map((_, i) => ({
    id: `RPT-${(8120 + i).toString()}`,
    user: ["คุณก", "คุณข", "คุณค", "คุณง", "คุณจ"][i],
    time: ["3 นาทีที่แล้ว", "12 นาทีที่แล้ว", "28 นาทีที่แล้ว", "1 ชั่วโมงที่แล้ว", "2 ชั่วโมงที่แล้ว"][i],
    snippet: [
      "รถจอดขวางทางเข้าฉุกเฉิน",
      "พบรถยนต์จอดขวางตลอดเช้า",
      "รถพยาบาลออกไม่ได้",
      "เห็นเหตุการณ์เดิมซ้ำ",
      "ขอความช่วยเหลือด่วน",
    ][i],
  }));

  return (
    <AppShell title={`รายละเอียดเคส ${c.id}`} subtitle={c.title}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Link to="/officer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> กลับ Dashboard
          </Link>
          {viewOnly && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-3 py-1 text-xs font-semibold text-info">
              <Eye className="h-3.5 w-3.5" /> มุมมองสำหรับประชาชน (view-only)
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
          {/* Left column */}
          <div className="space-y-5">
            {/* Overview */}
            <div className="card-elevated p-5 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ภาพรวมเคส</div>
              <h2 className="mt-1 text-xl font-bold text-foreground">{c.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                <span className="inline-flex items-center rounded-md bg-primary/8 px-1.5 py-0.5 text-[10.5px] font-semibold text-primary">
                  #{c.category}
                </span>
                <StatusBadge status={status} />
                <RiskBadge level={c.riskLevel} score={c.riskScore} />
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  <Layers className="h-3 w-3" /> รวม {c.mergedReports} รายงาน
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-info" /> AI Summary
                </div>
                <div className="mt-2 rounded-2xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
                  {c.summary}
                </div>
              </div>

              <div className="mt-5 grid sm:grid-cols-3 gap-3">
                <Mini label="Risk Score" value={`${c.riskScore} / 100`} />
                <Mini label="หน่วยงาน" value={c.unit} icon={<Building2 className="h-3.5 w-3.5" />} />
                <Mini label="เขต" value={c.district} />
              </div>
            </div>

            {/* Location */}
            <div className="card-elevated p-5 sm:p-6">
              <div className="text-sm font-bold text-foreground mb-3">ตำแหน่ง</div>
              <MiniMap label={c.location.label} />
              <div className="mt-3 text-xs font-mono text-muted-foreground">
                lat: {c.location.lat} · lng: {c.location.lng}
              </div>
            </div>

            {/* Merged reports */}
            <div className="card-elevated p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-foreground">รายงานที่ถูกรวมในเคสนี้</div>
                <span className="text-xs text-muted-foreground">{c.mergedReports} รายงาน</span>
              </div>
              <div className="space-y-2">
                {mergedReports.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-success text-primary-foreground text-xs font-bold">
                      {r.user[2]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{r.id}</span> · {r.user} · {r.time}
                      </div>
                      <div className="text-sm text-foreground mt-0.5">{r.snippet}</div>
                    </div>
                  </div>
                ))}
                {c.mergedReports > 5 && (
                  <div className="text-center text-xs text-muted-foreground py-1">
                    + อีก {c.mergedReports - 5} รายงาน
                  </div>
                )}
              </div>
            </div>

            {/* Evidence */}
            <div className="card-elevated p-5 sm:p-6">
              <div className="text-sm font-bold text-foreground mb-3">หลักฐาน</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-video rounded-xl bg-gradient-to-br from-muted to-secondary border border-border grid place-items-center text-muted-foreground">
                    <Camera className="h-6 w-6" />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-warning/10 px-3 py-2 text-xs text-[oklch(0.4_0.1_60)]">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>ควรเบลอใบหน้าและป้ายทะเบียนก่อนใช้งานจริง</span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Officer actions */}
            {!viewOnly && (
              <div className="card-elevated p-5 sm:p-6">
                <div className="text-sm font-bold text-foreground">การจัดการโดยเจ้าหน้าที่</div>
                <div className="text-xs text-muted-foreground">เปลี่ยนสถานะและส่งการแจ้งเตือนถึงผู้รายงาน</div>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-foreground">สถานะปัจจุบัน</label>
                  <div className="relative mt-1.5">
                    <select
                      value={status}
                      onChange={(e) => { setStatus(e.target.value as Status); setSaved(false); }}
                      className="w-full appearance-none rounded-xl border border-input bg-card px-4 py-2.5 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/40"
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={() => setSaved(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" /> บันทึกสถานะ
                  </button>
                  <button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition">
                    <Bell className="h-4 w-4" /> แจ้งผู้รายงานทั้งหมด ({c.mergedReports})
                  </button>
                  <button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-success/30 bg-success/5 px-4 py-2.5 text-sm font-semibold text-success hover:bg-success/10 transition">
                    <Send className="h-4 w-4" /> ทำเครื่องหมายว่าแก้ไขแล้ว
                  </button>
                </div>

                {saved && (
                  <div className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-xs font-semibold text-success">
                    ✓ บันทึกสถานะใหม่เรียบร้อย
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="card-elevated p-5 sm:p-6">
              <div className="text-sm font-bold text-foreground mb-4">Timeline</div>
              <ol className="space-y-2.5">
                {TIMELINE_STEPS.map((step, i) => {
                  const done = i < c.currentStep;
                  const current = i === c.currentStep;
                  return (
                    <li key={step} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                          done && "bg-success text-white",
                          current && "bg-info text-white animate-pulse",
                          !done && !current && "bg-muted text-muted-foreground",
                        )}
                      >
                        {done ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
                      </span>
                      <div className="min-w-0">
                        <div className={cn("text-[13px] font-medium", current ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground")}>
                          {step}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Mini({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-foreground">
        {icon}{value}
      </div>
    </div>
  );
}
