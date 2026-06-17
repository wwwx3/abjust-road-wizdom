import type { RiskLevel, Status } from "@/lib/abjust-data";
import { cn } from "@/lib/utils";

export function RiskBadge({ level, score, className }: { level: RiskLevel; score?: number; className?: string }) {
  const styles: Record<RiskLevel, string> = {
    "สูงมาก": "bg-danger/10 text-danger ring-danger/20",
    "สูง": "bg-brand/15 text-[oklch(0.42_0.13_60)] ring-brand/30",
    "ปานกลาง": "bg-info/10 text-info ring-info/20",
    "ต่ำ": "bg-success/10 text-success ring-success/20",
  };
  const dot: Record<RiskLevel, string> = {
    "สูงมาก": "bg-danger",
    "สูง": "bg-brand",
    "ปานกลาง": "bg-info",
    "ต่ำ": "bg-success",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[level],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[level])} />
      {level}
      {typeof score === "number" && <span className="opacity-70">· {score}</span>}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const styles: Record<Status, string> = {
    "รับเรื่องแล้ว": "bg-muted text-muted-foreground ring-border",
    "กำลังตรวจสอบ": "bg-info/10 text-info ring-info/20",
    "มอบหมายหน่วยงานแล้ว": "bg-[oklch(0.95_0.06_295)] text-[oklch(0.4_0.15_295)] ring-[oklch(0.85_0.08_295)]",
    "กำลังดำเนินการ": "bg-brand/15 text-[oklch(0.42_0.13_60)] ring-brand/30",
    "แก้ไขเสร็จสิ้น": "bg-success/10 text-success ring-success/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
