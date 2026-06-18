import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/badges";
import { ScoringDialog } from "@/components/scoring-dialog";
import { STATUS_ORDER, type Case, type Status } from "@/lib/abjust-data";
import { casesStore, useCases } from "@/lib/cases-store";
import { useRole } from "@/lib/use-role";
import { Layers, MapPin, Clock, Plus, Filter, Flame, GripVertical, Lock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/officer")({
  head: () => ({ meta: [{ title: "Dashboard เจ้าหน้าที่ — Abjust" }] }),
  component: OfficerDashboard,
});

const columnTone: Record<string, string> = {
  "รับเรื่องแล้ว": "bg-muted/60 border-border",
  "กำลังตรวจสอบ": "bg-info/5 border-info/20",
  "มอบหมายหน่วยงานแล้ว": "bg-[oklch(0.96_0.04_295)] border-[oklch(0.85_0.06_295)]",
  "กำลังดำเนินการ": "bg-brand/8 border-brand/25",
  "แก้ไขเสร็จสิ้น": "bg-success/5 border-success/20",
};

const columnAccent: Record<string, string> = {
  "รับเรื่องแล้ว": "bg-muted-foreground/60",
  "กำลังตรวจสอบ": "bg-info",
  "มอบหมายหน่วยงานแล้ว": "bg-[oklch(0.55_0.16_295)]",
  "กำลังดำเนินการ": "bg-brand",
  "แก้ไขเสร็จสิ้น": "bg-success",
};

function OfficerDashboard() {
  const router = useRouter();
  const cases = useCases();
  const [role] = useRole();
  const isOfficer = role === "officer";
  const [filterDistrict, setFilterDistrict] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [dragOver, setDragOver] = useState<Status | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const districts = useMemo(
    () => Array.from(new Set(cases.map((c) => c.district))).sort(),
    [cases],
  );

  const filtered = filterDistrict ? cases.filter((c) => c.district === filterDistrict) : cases;

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: filtered
      .filter((c) => c.status === status)
      .sort((a, b) => b.riskScore - a.riskScore),
  }));

  const total = filtered.length;
  const critical = filtered.filter((c) => c.riskLevel === "สูงมาก").length;
  const inProgress = filtered.filter((c) => c.status === "กำลังดำเนินการ").length;
  const merged = filtered.reduce((s, c) => s + c.mergedReports, 0);

  const onDrop = (status: Status) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    if (!isOfficer) return;
    const id = e.dataTransfer.getData("text/case-id");
    if (!id) return;
    const c = casesStore.get(id);
    if (!c || c.status === status) return;
    casesStore.updateStatus(id, status);
    setFlash(`ย้าย ${id} → ${status}`);
    setTimeout(() => setFlash(null), 2000);
  };

  return (
    <AppShell
      title="Dashboard เคสจราจร"
      subtitle="ภาพรวมเคสและสถานะการดำเนินงานของหน่วยงาน"
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi label="เคสทั้งหมด" value={total} tone="text-foreground" />
        <Kpi label="ความเสี่ยงสูงมาก" value={critical} tone="text-danger" icon={<Flame className="h-4 w-4 text-danger" />} />
        <Kpi label="กำลังดำเนินการ" value={inProgress} tone="text-[oklch(0.42_0.13_60)]" />
        <Kpi label="รายงานที่ถูกรวม" value={merged} tone="text-success" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">Board</span>
          <span className="text-sm text-muted-foreground">· เรียงตาม Risk Score (สูงสุดก่อน)</span>
          {isOfficer ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success">
              <GripVertical className="h-3 w-3" /> ลากการ์ดเพื่อเปลี่ยนสถานะ
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              <Lock className="h-3 w-3" /> เฉพาะเจ้าหน้าที่ลากย้ายได้
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition"
          >
            <Filter className="h-3.5 w-3.5" /> ตัวกรอง{filterDistrict ? ` · ${filterDistrict}` : ""}
          </button>
          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            <Plus className="h-3.5 w-3.5" /> เพิ่มเคสด้วยตนเอง
          </Link>
        </div>
      </div>

      {showFilter && (
        <div className="mb-4 card-elevated p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">เขต:</span>
          <button
            onClick={() => setFilterDistrict("")}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
              !filterDistrict ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent",
            )}
          >
            ทั้งหมด
          </button>
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDistrict(d)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                filterDistrict === d ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {flash && (
        <div className="mb-3 rounded-xl bg-success/10 border border-success/30 px-3 py-2 text-xs font-semibold text-success">
          ✓ {flash}
        </div>
      )}

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {grouped.map(({ status, items }) => (
          <div key={status} className="flex-shrink-0 w-[320px]">
            <div
              onDragOver={(e) => {
                if (!isOfficer) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOver !== status) setDragOver(status);
              }}
              onDragLeave={() => dragOver === status && setDragOver(null)}
              onDrop={onDrop(status)}
              className={cn(
                "rounded-2xl border p-3 transition",
                columnTone[status],
                dragOver === status && isOfficer && "ring-2 ring-primary/40 border-primary/40",
              )}
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", columnAccent[status])} />
                  <span className="text-sm font-bold text-foreground">{status}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{items.length}</span>
                </div>
                <button
                  onClick={() => router.navigate({ to: "/report" })}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-background/60 transition"
                  title="เพิ่มเคสใหม่"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2.5 max-h-[calc(100vh-360px)] overflow-y-auto scrollbar-thin pr-1">
                {items.map((c) => (
                  <CaseCard
                    key={c.id}
                    c={c}
                    isOfficer={isOfficer}
                    dragging={draggingId === c.id}
                    onDragStart={(e) => {
                      if (!isOfficer) {
                        e.preventDefault();
                        return;
                      }
                      e.dataTransfer.setData("text/case-id", c.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(c.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border bg-background/50 py-8 text-center text-xs text-muted-foreground">
                    {isOfficer ? "ลากการ์ดมาวางที่นี่" : "ไม่มีเคสในสถานะนี้"}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function CaseCard({
  c,
  isOfficer,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  c: Case;
  isOfficer: boolean;
  dragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const critical = c.riskLevel === "สูงมาก";
  return (
    <div
      draggable={isOfficer}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative rounded-xl bg-card p-3.5 border transition hover:soft-shadow",
        critical ? "border-danger/30 ring-1 ring-danger/10" : "border-border",
        isOfficer ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        dragging && "opacity-50 rotate-1",
      )}
    >
      {isOfficer && (
        <div className="absolute right-2 top-2 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}
      <Link
        to="/officer/case/$id"
        params={{ id: c.id }}
        onClick={(e) => {
          // Don't navigate if a drag just started
          if (dragging) e.preventDefault();
        }}
        draggable={false}
        className="block"
      >
        <div className="flex items-start justify-between gap-2 pr-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
              {c.id}
            </span>
            <span className="inline-flex items-center rounded-md bg-primary/8 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              #{c.category}
            </span>
          </div>
        </div>

        <div className="mt-2 text-[13.5px] font-semibold leading-snug text-foreground line-clamp-2">
          {c.title}
        </div>
        <div className="mt-1 text-[11.5px] leading-snug text-muted-foreground line-clamp-2">
          {c.summary}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <RiskBadge level={c.riskLevel} score={c.riskScore} />
          <div className="flex items-center gap-2">
            <span
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.stopPropagation()}
              className="inline-flex"
            >
              <ScoringDialog
                c={c}
                trigger={
                  <button
                    type="button"
                    aria-label="ดูที่มาของคะแนน AI"
                    className="inline-flex items-center gap-1 rounded-md bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold text-info hover:bg-info/20 transition"
                  >
                    <Info className="h-3 w-3" /> ที่มา
                  </button>
                }
              />
            </span>
            <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
              <Layers className="h-3 w-3" />
              <span className="font-semibold text-foreground">{c.mergedReports}</span>
              <span>รายงาน</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[10.5px] text-muted-foreground border-t border-border pt-2.5">
          <span className="inline-flex items-center gap-1 min-w-0">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{c.location.label}</span>
          </span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" /> {c.updatedAt}
          </span>
        </div>
      </Link>
    </div>
  );
}

function Kpi({ label, value, tone, icon }: { label: string; value: number; tone: string; icon?: React.ReactNode }) {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className={cn("mt-1 text-3xl font-extrabold tracking-tight", tone)}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
