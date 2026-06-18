import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/badges";
import { casesStore, useAllEscalations } from "@/lib/cases-store";
import { ESCALATION_LADDER, timeRemainingLabel } from "@/lib/escalation";
import { useRole } from "@/lib/use-role";
import { AlertTriangle, Flame, Users, ShieldAlert, Crown, Repeat, Eye, PlayCircle, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/officer/escalation")({
  head: () => ({ meta: [{ title: "Escalation & Audit — Abjust" }] }),
  component: EscalationPage,
});

function EscalationPage() {
  const items = useAllEscalations();
  const [role] = useRole();
  const isOfficer = role === "officer";
  const [flash, setFlash] = useState<string | null>(null);

  const overdue = items.filter((x) => x.state.overdue || x.state.deadlineAt - Date.now() <= 0);
  const noOwnerHighRisk = items.filter(
    (x) => x.case.riskLevel === "สูงมาก" && x.case.status === "รับเรื่องแล้ว",
  );
  const atCoordinator = items.filter((x) => x.state.level === 2);
  const multiTransfer = items.filter((x) => x.state.transferCount >= 1);
  const atSupervisor = items.filter((x) => x.state.level >= 3);
  const atExecutive = items.filter((x) => x.state.level >= 4);

  const simulateOverdue = () => {
    // pick the demo case
    const target = items.find((x) => x.case.id === "ABJ-2410-0871") ?? items[0];
    if (!target) return;
    casesStore.simulateOverdue(target.case.id);
    setFlash(`จำลองเคสค้าง: ${target.case.id} ถูกส่งต่อไปยัง ${ESCALATION_LADDER[Math.min(target.state.level, 4)].label}`);
    setTimeout(() => setFlash(null), 2500);
  };

  return (
    <AppShell
      title="Escalation & Audit"
      subtitle="การส่งต่อและบันทึกความรับผิดชอบ — มองเห็นเคสที่ค้าง ไม่ใช่ลงโทษเจ้าหน้าที่"
    >
      <div className="space-y-5">
        {!isOfficer && (
          <div className="rounded-xl border border-info/30 bg-info/5 px-4 py-2.5 text-xs text-info flex items-center gap-2">
            <Eye className="h-4 w-4" /> โหมดดูอย่างเดียว — เปลี่ยนเป็นบทบาทเจ้าหน้าที่เพื่อจำลองการส่งต่อ
          </div>
        )}

        {/* Workflow-health KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Kpi icon={<Clock className="h-4 w-4" />} tone="bg-danger/10 text-danger" label="เคสค้างเกินกำหนด" value={overdue.length} />
          <Kpi icon={<Flame className="h-4 w-4" />} tone="bg-danger/10 text-danger" label="เคสความเสี่ยงสูงที่ยังไม่มีเจ้าภาพ" value={noOwnerHighRisk.length} />
          <Kpi icon={<Users className="h-4 w-4" />} tone="bg-info/10 text-info" label="เคสรอผู้ประสานงานกลาง" value={atCoordinator.length} />
          <Kpi icon={<Repeat className="h-4 w-4" />} tone="bg-warning/10 text-[oklch(0.45_0.13_60)]" label="เคสที่ถูกส่งต่อหลายครั้ง" value={multiTransfer.length} />
          <Kpi icon={<ShieldAlert className="h-4 w-4" />} tone="bg-[oklch(0.95_0.05_295)] text-[oklch(0.4_0.15_295)]" label="เคสที่ต้องเห็นโดยหัวหน้าหน่วยงาน" value={atSupervisor.length} />
          <Kpi icon={<Crown className="h-4 w-4" />} tone="bg-brand/15 text-[oklch(0.42_0.13_60)]" label="เคสที่ต้องแสดงใน Dashboard ผู้บริหาร" value={atExecutive.length} />
        </div>

        <div className="card-elevated p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            ตัวเลขด้านบนคือสุขภาพของเวิร์กโฟลว์ ไม่ใช่คะแนนเจ้าหน้าที่
            เป้าหมายคือทำให้เคสที่ค้างหรือไม่มีผู้รับงานไม่หายไปจากระบบ
          </div>
          <button
            onClick={simulateOverdue}
            disabled={!isOfficer}
            className="inline-flex items-center gap-2 rounded-xl bg-danger/10 text-danger px-3.5 py-2 text-xs font-semibold hover:bg-danger/15 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PlayCircle className="h-4 w-4" /> จำลองเคสค้างเกินกำหนด
          </button>
        </div>

        {flash && (
          <div className="rounded-xl bg-success/10 border border-success/30 px-3 py-2 text-xs font-semibold text-success">
            ✓ {flash}
          </div>
        )}

        {/* Backlog table */}
        <div className="card-elevated p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-foreground">เคสค้างเกินกำหนด</div>
              <div className="text-[11px] text-muted-foreground">Backlog visibility — ไม่ใช่ blame board</div>
            </div>
            <span className="text-xs text-muted-foreground">{overdue.length} เคส</span>
          </div>
          {overdue.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 py-10 text-center text-xs text-muted-foreground">
              ไม่มีเคสที่ค้างเกินกำหนดในขณะนี้
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <Th>Case ID</Th>
                    <Th>ความเสี่ยง</Th>
                    <Th>หมวด</Th>
                    <Th>หน่วยงานปัจจุบัน</Th>
                    <Th>ระดับการส่งต่อ</Th>
                    <Th>เวลาค้าง</Th>
                    <Th>การส่งต่อ</Th>
                    <Th>ขั้นถัดไป</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {overdue
                    .sort((a, b) => (a.state.deadlineAt - b.state.deadlineAt))
                    .map(({ case: c, state }) => (
                      <tr key={c.id} className={cn("hover:bg-muted/40", c.riskLevel === "สูงมาก" && "bg-danger/5")}>
                        <Td><span className="font-mono text-muted-foreground">{c.id}</span></Td>
                        <Td><RiskBadge level={c.riskLevel} score={c.riskScore} /></Td>
                        <Td className="max-w-[160px] truncate" title={c.category}>{c.category}</Td>
                        <Td>{c.unit}</Td>
                        <Td>
                          <span className="inline-flex items-center gap-1 rounded-md bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">
                            L{state.level} · {ESCALATION_LADDER[state.level - 1].label}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-danger font-semibold">{timeRemainingLabel(state.deadlineAt - Date.now())}</span>
                        </Td>
                        <Td>{state.transferCount}x</Td>
                        <Td className="text-muted-foreground text-[11.5px]">
                          {state.level < 5 ? `ต้องการการตัดสินใจจาก ${ESCALATION_LADDER[state.level].label}` : "อยู่ในภาพรวมสาธารณะ"}
                        </Td>
                        <Td>
                          <Link
                            to="/officer/case/$id"
                            params={{ id: c.id }}
                            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-[11.5px]"
                          >
                            ดูรายละเอียด <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-elevated p-5 sm:p-6 bg-gradient-to-br from-background to-muted/40">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-warning/10 text-[oklch(0.45_0.13_60)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="text-[12.5px] leading-relaxed text-foreground">
              <div className="font-semibold mb-1">เป้าหมายของระบบนี้</div>
              เทคโนโลยีไม่สามารถบังคับให้มนุษย์ลงมือทำได้โดยตรง
              แต่สามารถทำให้การเพิกเฉยไม่หายไปจากระบบ
              และทำให้ผู้บริหารเห็นจุดค้างของกระบวนการได้ชัดเจนขึ้น
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({ icon, tone, label, value }: { icon: React.ReactNode; tone: string; label: string; value: number }) {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between">
        <div className={cn("grid h-8 w-8 place-items-center rounded-lg", tone)}>{icon}</div>
        <div className="text-2xl font-extrabold text-foreground tabular-nums">{value}</div>
      </div>
      <div className="mt-2 text-[11.5px] font-semibold text-muted-foreground leading-snug">{label}</div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="py-2 px-2 font-semibold">{children}</th>;
}
function Td({ children, className, title }: { children?: React.ReactNode; className?: string; title?: string }) {
  return <td className={cn("py-2.5 px-2 align-middle", className)} title={title}>{children}</td>;
}
