import {
  ESCALATION_LADDER,
  type EscalationState,
  timeRemainingLabel,
  nextActionByLevel,
  autoNextIfIgnored,
} from "@/lib/escalation";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Clock,
  MapPin,
  ArrowRight,
  Users,
  ListChecks,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function EscalationLadder({ state }: { state: EscalationState }) {
  const remaining = state.deadlineAt - Date.now();
  const stuckHere = ESCALATION_LADDER[state.level - 1];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-foreground">
            ลำดับการส่งต่อเมื่อเคสค้าง
          </div>
          <div className="text-[11px] text-muted-foreground">
            Escalation Ladder · workflow visibility
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            remaining <= 0 ? "bg-danger/10 text-danger" : "bg-info/10 text-info",
          )}
        >
          <Clock className="h-3 w-3" /> {timeRemainingLabel(remaining)}
        </span>
      </div>

      {/* "ตอนนี้เคสค้างที่ไหน" summary */}
      <div className="mb-3 grid sm:grid-cols-2 gap-2">
        <SummaryTile
          icon={<MapPin className="h-4 w-4" />}
          label="เคสค้างอยู่ที่ขั้น"
          value={`L${state.level} · ${stuckHere.label}`}
          tone="info"
        />
        <SummaryTile
          icon={<Clock className="h-4 w-4" />}
          label="ระยะเวลา"
          value={timeRemainingLabel(remaining)}
          tone={remaining <= 0 ? "danger" : "info"}
        />
        <SummaryTile
          icon={<Users className="h-4 w-4" />}
          label="ผู้รับผิดชอบขั้นถัดไป"
          value={state.currentOwner}
          tone="brand"
        />
        <SummaryTile
          icon={<ListChecks className="h-4 w-4" />}
          label="ขั้นถัดไปต้องทำ"
          value={nextActionByLevel(state)}
          tone="brand"
        />
      </div>

      <div className="mb-3 rounded-xl border border-warning/30 bg-warning/5 px-3 py-2 text-[11.5px] text-[oklch(0.4_0.1_60)] flex items-start gap-2">
        <Workflow className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          <span className="font-semibold">ส่งต่ออัตโนมัติ: </span>
          {autoNextIfIgnored(state)}
        </span>
      </div>

      <ol className="space-y-2">
        {ESCALATION_LADDER.map((step) => {
          const done = step.level < state.level;
          const current = step.level === state.level;
          return (
            <li
              key={step.level}
              className={cn(
                "rounded-xl border px-3 py-2.5 flex items-start gap-3 transition",
                current && "border-info/40 bg-info/5 ring-1 ring-info/20",
                done && "border-success/30 bg-success/5",
                !done && !current && "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                  current && "bg-info text-white",
                  done && "bg-success text-white",
                  !done && !current && "bg-muted text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : current ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  step.level
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[13px] font-semibold text-foreground">
                    L{step.level} · {step.label}
                  </div>
                  <span className="text-[10.5px] text-muted-foreground">
                    {step.owner}
                  </span>
                </div>
                <div className="text-[11.5px] text-muted-foreground mt-0.5">
                  {step.description}
                </div>
                {current && (
                  <div className="mt-1.5 rounded-md bg-background/60 border border-info/20 px-2 py-1 text-[11px] text-foreground">
                    <span className="font-semibold text-info">
                      ทำไมเคสมาถึงขั้นนี้:{" "}
                    </span>
                    {state.reason}
                  </div>
                )}
              </div>
              {current && step.level < 5 && (
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1.5" />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
        ระบบไม่ใช้แต้มและไม่จัดอันดับเจ้าหน้าที่
        แต่ใช้ workflow visibility เพื่อไม่ให้เคสที่ค้างเกินกำหนดหายไปจากระบบ
      </p>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "info" | "danger" | "brand";
}) {
  const toneClass = {
    info: "bg-info/10 text-info",
    danger: "bg-danger/10 text-danger",
    brand: "bg-brand/15 text-[oklch(0.42_0.13_60)]",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={cn("grid h-7 w-7 place-items-center rounded-lg", toneClass)}>
          {icon}
        </span>
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </div>
      <div className="mt-1.5 text-[12.5px] font-semibold text-foreground leading-snug">
        {value}
      </div>
    </div>
  );
}

export function AuditTrail({ state }: { state: EscalationState }) {
  return (
    <div>
      <div className="text-sm font-bold text-foreground mb-1">
        บันทึกเส้นทางความรับผิดชอบ
      </div>
      <div className="text-[11px] text-muted-foreground mb-3">
        Audit Trail · แสดงเฉพาะหน่วยงาน/บทบาท ไม่เปิดเผยชื่อบุคคล
      </div>
      <ol className="relative border-l-2 border-border pl-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {state.audit
          .slice()
          .sort((a, b) => b.ts - a.ts)
          .map((ev, i) => {
            const auto = ev.actor === "ระบบ Abjust";
            return (
              <li key={ev.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[22px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full ring-2 ring-background",
                    auto ? "bg-warning" : i === 0 ? "bg-info" : "bg-muted-foreground/50",
                  )}
                >
                  <Circle className="h-1.5 w-1.5 fill-background text-background" />
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[10.5px] font-mono text-muted-foreground">
                    {new Date(ev.ts).toLocaleString("th-TH")}
                  </div>
                  {ev.level !== undefined && (
                    <span className="text-[10px] font-semibold text-info bg-info/10 rounded px-1.5">
                      L{ev.level}
                    </span>
                  )}
                  {auto && (
                    <span className="text-[10px] font-semibold text-[oklch(0.42_0.13_60)] bg-warning/15 rounded px-1.5">
                      ส่งต่ออัตโนมัติ
                    </span>
                  )}
                </div>
                <div className="text-[13px] font-semibold text-foreground mt-0.5">
                  {ev.action}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  โดย{" "}
                  <span className="font-medium text-foreground">{ev.actor}</span>
                </div>
                {ev.reason && (
                  <div className="mt-1 text-[11.5px] text-foreground bg-muted/50 rounded-md px-2 py-1">
                    {ev.reason}
                  </div>
                )}
                {(ev.fromStatus || ev.toStatus) && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    สถานะ:{" "}
                    <span className="font-mono">
                      {ev.fromStatus ?? "-"} → {ev.toStatus ?? "-"}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
      </ol>
    </div>
  );
}
