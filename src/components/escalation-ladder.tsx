import { ESCALATION_LADDER, type EscalationState, timeRemainingLabel } from "@/lib/escalation";
import { CheckCircle2, Circle, Loader2, Clock, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function EscalationLadder({ state }: { state: EscalationState }) {
  const remaining = state.deadlineAt - Date.now();
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-foreground">ลำดับการส่งต่อเมื่อเคสค้าง</div>
          <div className="text-[11px] text-muted-foreground">Escalation Ladder</div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            remaining <= 0
              ? "bg-danger/10 text-danger"
              : "bg-info/10 text-info",
          )}
        >
          <Clock className="h-3 w-3" /> {timeRemainingLabel(remaining)}
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
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : current ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : step.level}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[13px] font-semibold text-foreground">{step.label}</div>
                  <span className="text-[10.5px] text-muted-foreground">{step.owner}</span>
                </div>
                <div className="text-[11.5px] text-muted-foreground mt-0.5">{step.description}</div>
                {current && (
                  <div className="mt-1.5 rounded-md bg-background/60 border border-info/20 px-2 py-1 text-[11px] text-foreground">
                    <span className="font-semibold text-info">เหตุผล: </span>
                    {state.reason}
                  </div>
                )}
              </div>
              {current && step.level < 5 && (
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1.5" />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
        ระบบไม่ได้ใช้แต้มลงโทษเจ้าหน้าที่ แต่ใช้ความโปร่งใสของกระบวนการ
        เพื่อป้องกันไม่ให้เคสหายไปจากระบบหรือถูกเพิกเฉยโดยไม่มีผู้รับงานต่อ
      </p>
    </div>
  );
}

export function AuditTrail({ state }: { state: EscalationState }) {
  return (
    <div>
      <div className="text-sm font-bold text-foreground mb-1">บันทึกเส้นทางความรับผิดชอบ</div>
      <div className="text-[11px] text-muted-foreground mb-3">Audit Trail · แสดงเฉพาะหน่วยงาน/บทบาท ไม่เปิดเผยชื่อบุคคล</div>
      <ol className="relative border-l border-border pl-4 space-y-3">
        {state.audit
          .slice()
          .sort((a, b) => a.ts - b.ts)
          .map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[21px] top-1 grid h-3 w-3 place-items-center rounded-full bg-card ring-2 ring-border">
                <Circle className="h-1.5 w-1.5 fill-primary text-primary" />
              </span>
              <div className="text-[10.5px] font-mono text-muted-foreground">
                {new Date(ev.ts).toLocaleString("th-TH")}
              </div>
              <div className="text-[13px] font-semibold text-foreground mt-0.5">{ev.action}</div>
              <div className="text-[11px] text-muted-foreground">
                โดย <span className="font-medium text-foreground">{ev.actor}</span>
                {ev.level !== undefined && <> · ระดับ {ev.level}</>}
              </div>
              {ev.reason && (
                <div className="mt-1 text-[11.5px] text-foreground bg-muted/50 rounded-md px-2 py-1">
                  {ev.reason}
                </div>
              )}
              {(ev.fromStatus || ev.toStatus) && (
                <div className="mt-1 text-[11px] text-muted-foreground">
                  สถานะ: <span className="font-mono">{ev.fromStatus ?? "-"} → {ev.toStatus ?? "-"}</span>
                </div>
              )}
            </li>
          ))}
      </ol>
    </div>
  );
}
