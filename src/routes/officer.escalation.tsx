import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/badges";
import { casesStore, useAllEscalations } from "@/lib/cases-store";
import { ESCALATION_LADDER, timeRemainingLabel } from "@/lib/escalation";
import { useRole } from "@/lib/use-role";
import type { Case } from "@/lib/abjust-data";
import type { EscalationState } from "@/lib/escalation";
import {
  AlertTriangle,
  Flame,
  Users,
  ShieldAlert,
  Crown,
  Repeat,
  Eye,
  PlayCircle,
  ArrowRight,
  Clock,
  MapPin,
  Layers,
  Building2,
  Hourglass,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/officer/escalation")({
  head: () => ({ meta: [{ title: "Escalation & Audit — Abjust" }] }),
  component: EscalationPage,
});

type FilterKey =
  | "all"
  | "overdue"
  | "noOwner"
  | "coordinator"
  | "multi"
  | "supervisor"
  | "executive";

function EscalationPage() {
  const items = useAllEscalations();
  const [role] = useRole();
  const isOfficer = role === "officer";
  const [flash, setFlash] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("overdue");

  const overdue = items.filter((x) => x.state.overdue || x.state.deadlineAt - Date.now() <= 0);
  const noOwnerHighRisk = items.filter(
    (x) => x.case.riskLevel === "สูงมาก" && x.case.status === "รับเรื่องแล้ว",
  );
  const atCoordinator = items.filter((x) => x.state.level === 2);
  const multiTransfer = items.filter((x) => x.state.transferCount >= 1);
  const atSupervisor = items.filter((x) => x.state.level >= 3);
  const atExecutive = items.filter((x) => x.state.level >= 4);

  const filtered = useMemo(() => {
    const base =
      filter === "all"
        ? items
        : filter === "overdue"
          ? overdue
          : filter === "noOwner"
            ? noOwnerHighRisk
            : filter === "coordinator"
              ? atCoordinator
              : filter === "multi"
                ? multiTransfer
                : filter === "supervisor"
                  ? atSupervisor
                  : atExecutive;
    return base
      .slice()
      .sort((a, b) => {
        // High-risk overdue first, then by deadline
        const ra = a.case.riskLevel === "สูงมาก" ? 0 : 1;
        const rb = b.case.riskLevel === "สูงมาก" ? 0 : 1;
        if (ra !== rb) return ra - rb;
        return a.state.deadlineAt - b.state.deadlineAt;
      });
  }, [filter, items, overdue, noOwnerHighRisk, atCoordinator, multiTransfer, atSupervisor, atExecutive]);

  const simulateOverdue = () => {
    const target = items.find((x) => x.case.id === "ABJ-2410-0871") ?? items[0];
    if (!target) return;
    casesStore.simulateOverdue(target.case.id);
    setFlash(
      `จำลองเคสค้าง: ${target.case.id} ถูกส่งต่อไปยัง ${ESCALATION_LADDER[Math.min(target.state.level, 4)].label}`,
    );
    setTimeout(() => setFlash(null), 2500);
  };

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "overdue", label: "ค้างเกินกำหนด", count: overdue.length },
    { key: "noOwner", label: "เสี่ยงสูง · ยังไม่มีเจ้าภาพ", count: noOwnerHighRisk.length },
    { key: "coordinator", label: "อยู่ที่ผู้ประสานงานกลาง", count: atCoordinator.length },
    { key: "multi", label: "ถูกส่งต่อหลายครั้ง", count: multiTransfer.length },
    { key: "supervisor", label: "ต้องเห็นโดยหัวหน้าหน่วยงาน", count: atSupervisor.length },
    { key: "executive", label: "ผู้บริหารเมือง", count: atExecutive.length },
    { key: "all", label: "ทั้งหมด", count: items.length },
  ];

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

        {/* Section heading */}
        <div className="card-elevated p-5 sm:p-6 bg-gradient-to-br from-primary/5 via-background to-info/5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Workflow className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-base font-bold text-foreground">การส่งต่อและบันทึกความรับผิดชอบ</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Escalation &amp; Audit — Backlog visibility board สำหรับเจ้าหน้าที่และผู้บริหาร
                ไม่ใช่กระดานให้คะแนนหรือลงโทษบุคคล
              </div>
            </div>
          </div>
        </div>

        {/* Workflow-health KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Kpi icon={<Clock className="h-4 w-4" />} tone="bg-danger/10 text-danger" label="เคสค้างเกินกำหนด" value={overdue.length} />
          <Kpi icon={<Flame className="h-4 w-4" />} tone="bg-danger/10 text-danger" label="เคสความเสี่ยงสูงที่ยังไม่มีเจ้าภาพ" value={noOwnerHighRisk.length} />
          <Kpi icon={<Users className="h-4 w-4" />} tone="bg-info/10 text-info" label="เคสรอผู้ประสานงานกลาง" value={atCoordinator.length} />
          <Kpi icon={<Repeat className="h-4 w-4" />} tone="bg-warning/10 text-[oklch(0.45_0.13_60)]" label="เคสที่ถูกส่งต่อหลายครั้ง" value={multiTransfer.length} />
          <Kpi icon={<ShieldAlert className="h-4 w-4" />} tone="bg-[oklch(0.95_0.05_295)] text-[oklch(0.4_0.15_295)]" label="เคสที่ต้องเห็นโดยหัวหน้าหน่วยงาน" value={atSupervisor.length} />
          <Kpi icon={<Crown className="h-4 w-4" />} tone="bg-brand/15 text-[oklch(0.42_0.13_60)]" label="เคสที่ต้องแสดงให้ผู้บริหารเมือง" value={atExecutive.length} />
        </div>

        {/* Escalation ladder reference */}
        <div className="card-elevated p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-foreground">ลำดับการส่งต่อเมื่อเคสค้าง</div>
              <div className="text-[11px] text-muted-foreground">
                หากเคสไม่ถูกอัปเดตตามเวลาที่กำหนด ระบบจะย้ายไปยังระดับถัดไปอัตโนมัติ
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {ESCALATION_LADDER.map((s, i) => (
              <div
                key={s.level}
                className={cn(
                  "rounded-xl border px-3 py-2.5 relative",
                  i === 0 && "bg-muted/40 border-border",
                  i === 1 && "bg-info/5 border-info/25",
                  i === 2 && "bg-[oklch(0.96_0.04_295)] border-[oklch(0.85_0.06_295)]",
                  i === 3 && "bg-brand/8 border-brand/25",
                  i === 4 && "bg-success/5 border-success/25",
                )}
              >
                <div className="text-[10px] font-bold tracking-wider text-muted-foreground">
                  LEVEL {s.level}
                </div>
                <div className="text-[12.5px] font-semibold text-foreground mt-0.5 leading-snug">
                  {s.label}
                </div>
                <div className="text-[10.5px] text-muted-foreground mt-1 leading-snug">
                  {s.owner}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
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

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition border",
                filter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-accent",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  filter === f.key ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Backlog cards */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <div className="text-sm font-bold text-foreground">
                {filter === "overdue" ? "เคสค้างเกินกำหนด" : filters.find((f) => f.key === filter)?.label}
              </div>
              <div className="text-[11px] text-muted-foreground">
                คลิกการ์ดเพื่อดูตำแหน่งที่เคสค้าง ระยะเวลา ผู้รับผิดชอบขั้นถัดไป และเหตุผลการส่งต่อ
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{filtered.length} เคส</span>
          </div>

          {filtered.length === 0 ? (
            <div className="card-elevated p-10 text-center text-xs text-muted-foreground">
              ไม่มีเคสในกลุ่มนี้
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(({ case: c, state }) => (
                <EscalationCard key={c.id} c={c} state={state} />
              ))}
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

function EscalationCard({ c, state }: { c: Case; state: EscalationState }) {
  const critical = c.riskLevel === "สูงมาก";
  const remaining = state.deadlineAt - Date.now();
  const isOverdue = remaining <= 0 || state.overdue;
  const currentStep = ESCALATION_LADDER[state.level - 1];
  const nextStep = state.level < 5 ? ESCALATION_LADDER[state.level] : null;
  const escalatedAt = new Date(state.lastEscalatedAt).toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      to="/officer/case/$id"
      params={{ id: c.id }}
      className={cn(
        "card-elevated p-4 block transition hover:soft-shadow hover:-translate-y-0.5",
        critical && isOverdue && "ring-1 ring-danger/30 bg-gradient-to-br from-danger/5 to-background",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
            {c.id}
          </span>
          <span className="inline-flex items-center rounded-md bg-primary/8 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            #{c.category}
          </span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
            isOverdue ? "bg-danger/10 text-danger" : "bg-info/10 text-info",
          )}
        >
          <Hourglass className="h-3 w-3" /> {timeRemainingLabel(remaining)}
        </span>
      </div>

      <div className="mt-2 text-[13.5px] font-semibold leading-snug text-foreground line-clamp-2">
        {c.title}
      </div>

      {/* Where stuck (current level) */}
      <div className="mt-3 rounded-xl border border-info/25 bg-info/5 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-bold tracking-wider text-info">
            ค้างอยู่ที่ · LEVEL {state.level}
          </div>
          <RiskBadge level={c.riskLevel} score={c.riskScore} />
        </div>
        <div className="mt-0.5 text-[12.5px] font-semibold text-foreground">
          {currentStep.label}
        </div>
        <div className="text-[10.5px] text-muted-foreground flex items-center gap-1 mt-0.5">
          <Building2 className="h-3 w-3" /> {c.unit}
        </div>
        {state.reason && (
          <div className="mt-1.5 text-[11px] text-foreground/80 leading-snug">
            <span className="font-semibold">เหตุผล: </span>
            {state.reason}
          </div>
        )}
      </div>

      {/* Next action */}
      {nextStep && (
        <div className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2">
          <div className="text-[10px] font-bold tracking-wider text-muted-foreground">
            ขั้นถัดไปหากไม่มีการดำเนินการ
          </div>
          <div className="mt-0.5 text-[12px] font-semibold text-foreground flex items-center gap-1">
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            {nextStep.label}
          </div>
          <div className="text-[10.5px] text-muted-foreground mt-0.5">{nextStep.owner}</div>
        </div>
      )}

      {/* Footer meta */}
      <div className="mt-3 flex items-center justify-between gap-2 text-[10.5px] text-muted-foreground border-t border-border pt-2.5">
        <span className="inline-flex items-center gap-1 min-w-0">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{c.location.label}</span>
        </span>
        <span className="inline-flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1">
            <Repeat className="h-3 w-3" /> {state.transferCount}x
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3 w-3" /> {c.mergedReports}
          </span>
        </span>
      </div>
      <div className="mt-1.5 text-[10px] text-muted-foreground">
        ส่งต่อล่าสุด: <span className="font-mono">{escalatedAt}</span>
      </div>
    </Link>
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
