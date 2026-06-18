import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { RiskBadge, StatusBadge } from "@/components/badges";
import { TIMELINE_STEPS } from "@/lib/abjust-data";
import { useMyCases, casesStore, useEscalation } from "@/lib/cases-store";
import { citizenFriendlyStateText, timeRemainingLabel } from "@/lib/escalation";
import { CheckCircle2, Circle, Layers, MessageSquare, Bell, Loader2, Inbox, Plus, MapPin, Radio, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/timeline")({
  head: () => ({ meta: [{ title: "ติดตามเรื่องของฉัน — Abjust" }] }),
  component: TimelinePage,
});

function TimelinePage() {
  const myCases = useMyCases();
  const lastId = casesStore.getLastCreatedId();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select the most recent submission or the first case
  useEffect(() => {
    if (selectedId && myCases.some((c) => c.id === selectedId)) return;
    const preferred = (lastId && myCases.find((c) => c.id === lastId)) || myCases[0];
    setSelectedId(preferred ? preferred.id : null);
  }, [myCases, lastId, selectedId]);

  const c = useMemo(
    () => myCases.find((x) => x.id === selectedId) ?? myCases[0],
    [myCases, selectedId],
  );

  if (myCases.length === 0 || !c) {
    return (
      <AppShell title="ติดตามเรื่องของฉัน" subtitle="ความคืบหน้าของเคสที่คุณมีส่วนรายงาน">
        <div className="mx-auto max-w-2xl card-elevated p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <div className="mt-3 text-base font-semibold text-foreground">ยังไม่มีรายงานของคุณ</div>
          <div className="mt-1 text-sm text-muted-foreground">เมื่อคุณส่งรายงาน เคสจะปรากฏที่นี่แบบเรียลไทม์</div>
          <Link
            to="/report"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" /> ส่งรายงานใหม่
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="ติดตามเรื่องของฉัน" subtitle="ความคืบหน้าของเคสที่คุณมีส่วนรายงาน">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[320px_1fr] gap-5">
        {/* Sidebar list */}
        <aside className="card-elevated p-3 lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Radio className="h-3.5 w-3.5 text-success animate-pulse" /> เรียลไทม์
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">{myCases.length} เคส</span>
          </div>
          <div className="mt-1 space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {myCases.map((mc) => {
              const active = mc.id === c.id;
              return (
                <button
                  key={mc.id}
                  onClick={() => setSelectedId(mc.id)}
                  className={cn(
                    "w-full text-left rounded-xl border px-3 py-2.5 transition",
                    active
                      ? "border-primary/40 bg-primary/5 ring-2 ring-primary/15"
                      : "border-border bg-card hover:bg-accent/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-mono text-muted-foreground">{mc.id}</div>
                    <RiskBadge level={mc.riskLevel} score={mc.riskScore} />
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground line-clamp-2">{mc.title}</div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <StatusBadge status={mc.status} />
                    <span className="text-[10.5px] text-muted-foreground">{mc.updatedAt}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <Link
            to="/report"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent/40 transition"
          >
            <Plus className="h-3.5 w-3.5" /> ส่งรายงานใหม่
          </Link>
        </aside>

        {/* Detail */}
        <div className="space-y-5">
          <div className="card-elevated p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-mono text-muted-foreground">{c.id}</div>
                <h2 className="mt-1 text-xl font-bold text-foreground">{c.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={c.status} />
                  <RiskBadge level={c.riskLevel} score={c.riskScore} />
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Layers className="h-3 w-3" /> รวม {c.mergedReports} รายงาน
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {c.district}
                  </span>
                </div>
              </div>
              <Link to="/officer/case/$id" params={{ id: c.id }} className="text-xs font-semibold text-primary hover:underline">
                ดูในมุมเจ้าหน้าที่ →
              </Link>
            </div>

            <div className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
              {c.summary}
            </div>
            <CitizenStatusPanel id={c.id} />
          </div>

          <div className="card-elevated p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-foreground">ความคืบหน้า</div>
                <div className="text-xs text-muted-foreground">{c.currentStep + 1} จาก {TIMELINE_STEPS.length} ขั้นตอน</div>
              </div>
              <div className="text-xs text-muted-foreground">อัปเดตล่าสุด {c.updatedAt}</div>
            </div>

            <ol className="relative">
              {TIMELINE_STEPS.map((step, i) => {
                const done = i < c.currentStep;
                const current = i === c.currentStep;
                return (
                  <li key={step} className="relative pl-10 pb-5 last:pb-0">
                    {i < TIMELINE_STEPS.length - 1 && (
                      <span
                        className={cn(
                          "absolute left-[15px] top-7 bottom-0 w-px",
                          done ? "bg-success" : "bg-border",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full ring-4",
                        done && "bg-success text-white ring-success/15",
                        current && "bg-info text-white ring-info/15 animate-pulse",
                        !done && !current && "bg-card text-muted-foreground ring-border",
                      )}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <Loader2 className="h-4 w-4 animate-spin" /> : <Circle className="h-3.5 w-3.5" />}
                    </span>
                    <div
                      className={cn(
                        "rounded-xl border px-4 py-3",
                        current ? "border-info/30 bg-info/5" : done ? "border-success/20 bg-success/5" : "border-border bg-card",
                      )}
                    >
                      <div className="text-sm font-semibold text-foreground">{step}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {done ? "เสร็จเรียบร้อย" : current ? "กำลังดำเนินการอยู่ในขั้นนี้" : "รอดำเนินการ"}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-5 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
              ประชาชนสามารถติดตามได้ว่าเรื่องของตนอยู่ในขั้นตอนไหน ไม่หายไปจากระบบ
            </p>
          </div>

          <div className="card-elevated overflow-hidden">
            <div className="bg-[oklch(0.95_0.04_145)] px-5 py-3 flex items-center gap-2 text-xs font-semibold text-success">
              <MessageSquare className="h-4 w-4" /> ตัวอย่างการแจ้งเตือนผ่าน LINE OA
            </div>
            <div className="p-5 bg-muted/30">
              <div className="ml-auto max-w-sm rounded-2xl rounded-tr-sm bg-success px-4 py-3 text-sm text-white shadow">
                <div className="flex items-center gap-2 font-semibold">
                  <Bell className="h-4 w-4" /> Abjust แจ้งความคืบหน้า
                </div>
                <div className="mt-1.5 text-[13px] leading-relaxed opacity-95">
                  เคส <span className="font-mono">{c.id}</span> ของคุณได้รับการมอบหมายให้ <strong>{c.unit}</strong> เรียบร้อยแล้ว · เจ้าหน้าที่กำลังลงพื้นที่
                </div>
                <div className="mt-2 text-[10.5px] opacity-80">วันนี้ · {c.updatedAt}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CitizenStatusPanel({ id }: { id: string }) {
  const esc = useEscalation(id);
  const [done, setDone] = useState(false);
  if (!esc) return null;
  const overdue = esc.overdue || esc.deadlineAt - Date.now() <= 0;
  const friendly = citizenFriendlyStateText(esc);
  const canRequest = overdue;
  return (
    <div className="mt-4 rounded-2xl border border-border bg-gradient-to-br from-background to-info/5 p-4">
      <div className="flex items-start gap-3">
        <div className={cn("grid h-9 w-9 place-items-center rounded-xl shrink-0", overdue ? "bg-warning/15 text-[oklch(0.42_0.13_60)]" : "bg-info/10 text-info")}>
          {overdue ? <AlertCircle className="h-5 w-5" /> : <Loader2 className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">{friendly}</div>
          <div className="text-[11.5px] text-muted-foreground mt-0.5">
            {overdue
              ? `เคสนี้ใช้เวลานานกว่าปกติ (${timeRemainingLabel(esc.deadlineAt - Date.now())})`
              : "เคสยังอยู่ในระยะเวลามาตรฐาน"}
          </div>
        </div>
      </div>
      {canRequest && !done && (
        <button
          onClick={() => {
            casesStore.requestCitizenReview(id);
            setDone(true);
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> ขอให้ตรวจสอบสถานะอีกครั้ง
        </button>
      )}
      {done && (
        <div className="mt-3 rounded-xl bg-success/10 border border-success/30 px-3 py-2 text-[12px] text-success font-semibold">
          ✓ ส่งคำขอตรวจสอบสถานะแล้ว เจ้าหน้าที่จะเห็นในระบบ
        </div>
      )}
      <div className="mt-2 text-[10.5px] text-muted-foreground">
        สามารถขอตรวจสอบสถานะได้เมื่อเคสไม่มีการอัปเดตตามระยะเวลาที่กำหนด
      </div>
    </div>
  );
}
