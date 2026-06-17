import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RiskBadge, StatusBadge } from "@/components/badges";
import { TIMELINE_STEPS, getCase } from "@/lib/abjust-data";
import { CheckCircle2, Circle, Layers, MessageSquare, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/timeline")({
  head: () => ({ meta: [{ title: "ติดตามเคสของฉัน — Abjust" }] }),
  component: TimelinePage,
});

function TimelinePage() {
  const c = getCase("ABJ-2410-0871")!;
  return (
    <AppShell title="ติดตามเรื่องของฉัน" subtitle="ความคืบหน้าของเคสที่คุณมีส่วนรายงาน">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header */}
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
              </div>
            </div>
            <Link to="/officer" className="text-xs font-semibold text-primary hover:underline">
              ดูในมุมเจ้าหน้าที่ →
            </Link>
          </div>

          <div className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
            {c.summary}
          </div>
        </div>

        {/* Timeline */}
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

        {/* LINE preview */}
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
              <div className="mt-2 text-[10.5px] opacity-80">วันนี้ · 14:28</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
