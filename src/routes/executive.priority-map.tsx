import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ANALYTICS } from "@/lib/abjust-data";
import {
  MapPin,
  Flame,
  AlertTriangle,
  Layers,
  Building2,
  Crown,
  ArrowLeft,
  Hospital,
  School,
  Database,
  ShieldCheck,
  Activity,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/executive/priority-map")({
  head: () => ({
    meta: [
      { title: "แผนที่จุดเสี่ยงและปัญหาซ้ำของกรุงเทพฯ — Abjust" },
      {
        name: "description",
        content:
          "Bangkok Traffic Risk Priority Map — แผนที่สนับสนุนการตัดสินใจสำหรับผู้บริหารเมือง",
      },
    ],
  }),
  component: PriorityMapPage,
});

type Hotspot = {
  id: string;
  name: string;
  district: string;
  x: number; // % within map
  y: number;
  cases: number;
  recurring: number;
  unresolvedRatio: number; // 0..1
  avgRisk: number; // 0..100
  topCategory: string;
  status: "high" | "recurring" | "resolved" | "multi";
  escalations: number;
  nearby: string[];
  impact: "สูงมาก" | "สูง" | "ปานกลาง" | "ต่ำ";
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "H-01",
    name: "ใกล้โรงพยาบาลจุฬาลงกรณ์",
    district: "ปทุมวัน",
    x: 38,
    y: 58,
    cases: 47,
    recurring: 18,
    unresolvedRatio: 0.42,
    avgRisk: 82,
    topCategory: "รถจอดกีดขวางทางรถพยาบาล",
    status: "high",
    escalations: 6,
    nearby: ["รพ.จุฬาลงกรณ์", "ถ.พระราม 4"],
    impact: "สูงมาก",
  },
  {
    id: "H-02",
    name: "แยกอโศก-สุขุมวิท",
    district: "วัฒนา",
    x: 64,
    y: 50,
    cases: 63,
    recurring: 24,
    unresolvedRatio: 0.31,
    avgRisk: 76,
    topCategory: "สัญญาณไฟจราจรผิดปกติ",
    status: "recurring",
    escalations: 4,
    nearby: ["MRT สุขุมวิท", "BTS อโศก"],
    impact: "สูง",
  },
  {
    id: "H-03",
    name: "ทางเดินเท้าใกล้โรงเรียน",
    district: "บางรัก",
    x: 44,
    y: 66,
    cases: 28,
    recurring: 11,
    unresolvedRatio: 0.55,
    avgRisk: 71,
    topCategory: "ทางเดินเท้าถูกกีดขวาง",
    status: "high",
    escalations: 3,
    nearby: ["รร.อัสสัมชัญ", "ถ.เจริญกรุง"],
    impact: "สูง",
  },
  {
    id: "H-04",
    name: "ถ.รัชดาภิเษก-ห้วยขวาง",
    district: "ห้วยขวาง",
    x: 58,
    y: 32,
    cases: 39,
    recurring: 15,
    unresolvedRatio: 0.48,
    avgRisk: 68,
    topCategory: "น้ำท่วมถนนกระทบการจราจร",
    status: "multi",
    escalations: 5,
    nearby: ["MRT ห้วยขวาง", "ตลาดห้วยขวาง"],
    impact: "สูง",
  },
  {
    id: "H-05",
    name: "แยกราชประสงค์",
    district: "ปทุมวัน",
    x: 50,
    y: 52,
    cases: 22,
    recurring: 7,
    unresolvedRatio: 0.18,
    avgRisk: 54,
    topCategory: "ป้ายจราจรไม่ชัดเจน",
    status: "recurring",
    escalations: 2,
    nearby: ["BTS ชิดลม"],
    impact: "ปานกลาง",
  },
  {
    id: "H-06",
    name: "ถ.สุขุมวิท 71",
    district: "วัฒนา",
    x: 72,
    y: 56,
    cases: 19,
    recurring: 5,
    unresolvedRatio: 0.1,
    avgRisk: 42,
    topCategory: "จอดบนทางเท้า",
    status: "resolved",
    escalations: 1,
    nearby: ["BTS พระโขนง"],
    impact: "ปานกลาง",
  },
  {
    id: "H-07",
    name: "แยกลาดพร้าว",
    district: "จตุจักร",
    x: 54,
    y: 18,
    cases: 31,
    recurring: 12,
    unresolvedRatio: 0.38,
    avgRisk: 64,
    topCategory: "สัญญาณไฟจราจรผิดปกติ",
    status: "recurring",
    escalations: 3,
    nearby: ["MRT พหลโยธิน", "เซ็นทรัล ลาดพร้าว"],
    impact: "สูง",
  },
];

// ---- Bangkok district choropleth (24 simplified counties) ----
type District = {
  name: string;
  unresolved: number;
  pushedBack: number;
  col: number;
  row: number;
};

const DISTRICT_GRID: District[] = [
  // row 0 (north)
  { name: "สายไหม", unresolved: 8, pushedBack: 2, col: 0, row: 0 },
  { name: "ดอนเมือง", unresolved: 12, pushedBack: 3, col: 1, row: 0 },
  { name: "หลักสี่", unresolved: 6, pushedBack: 2, col: 2, row: 0 },
  { name: "บางเขน", unresolved: 10, pushedBack: 3, col: 3, row: 0 },
  { name: "คลองสามวา", unresolved: 7, pushedBack: 2, col: 4, row: 0 },
  { name: "มีนบุรี", unresolved: 9, pushedBack: 3, col: 5, row: 0 },
  // row 1
  { name: "บางซื่อ", unresolved: 11, pushedBack: 4, col: 0, row: 1 },
  { name: "จตุจักร", unresolved: 22, pushedBack: 8, col: 1, row: 1 },
  { name: "ลาดพร้าว", unresolved: 14, pushedBack: 5, col: 2, row: 1 },
  { name: "บึงกุ่ม", unresolved: 8, pushedBack: 3, col: 3, row: 1 },
  { name: "คันนายาว", unresolved: 5, pushedBack: 2, col: 4, row: 1 },
  { name: "หนองจอก", unresolved: 4, pushedBack: 1, col: 5, row: 1 },
  // row 2
  { name: "ดุสิต", unresolved: 13, pushedBack: 4, col: 0, row: 2 },
  { name: "ห้วยขวาง", unresolved: 24, pushedBack: 10, col: 1, row: 2 },
  { name: "วังทองหลาง", unresolved: 11, pushedBack: 3, col: 2, row: 2 },
  { name: "บางกะปิ", unresolved: 9, pushedBack: 3, col: 3, row: 2 },
  { name: "สะพานสูง", unresolved: 6, pushedBack: 2, col: 4, row: 2 },
  { name: "ลาดกระบัง", unresolved: 8, pushedBack: 3, col: 5, row: 2 },
  // row 3 (south)
  { name: "ปทุมวัน", unresolved: 28, pushedBack: 14, col: 0, row: 3 },
  { name: "บางรัก", unresolved: 21, pushedBack: 9, col: 1, row: 3 },
  { name: "วัฒนา", unresolved: 26, pushedBack: 11, col: 2, row: 3 },
  { name: "คลองเตย", unresolved: 18, pushedBack: 7, col: 3, row: 3 },
  { name: "พระโขนง", unresolved: 12, pushedBack: 4, col: 4, row: 3 },
  { name: "บางนา", unresolved: 10, pushedBack: 3, col: 5, row: 3 },
];

const CELL_W = 13;
const CELL_H = 15;
const GRID_X0 = 8;
const GRID_Y0 = 6;

const DISTRICTS = DISTRICT_GRID.map((d) => {
  // deterministic per-cell jitter so borders look organic, not a perfect grid
  const seed = (d.col * 7 + d.row * 13) % 11;
  const jx = ((seed % 5) - 2) * 0.35;
  const jy = (((seed * 3) % 5) - 2) * 0.35;
  const x = GRID_X0 + d.col * CELL_W + jx;
  const y = GRID_Y0 + d.row * CELL_H + jy;
  const w = CELL_W;
  const h = CELL_H;
  // rectangle with slight corner perturbation
  const t1 = ((seed * 2) % 5) * 0.2;
  const t2 = ((seed * 5) % 5) * 0.2;
  const path = `M ${x} ${y + t1} L ${x + w - t2} ${y} L ${x + w} ${y + h - t1} L ${x + t2} ${y + h} Z`;
  return {
    name: d.name,
    unresolved: d.unresolved,
    pushedBack: d.pushedBack,
    cx: x + w / 2,
    cy: y + h / 2,
    path,
  };
});

const DISTRICT_MAX = Math.max(...DISTRICTS.map((d) => d.unresolved + d.pushedBack));

function priorityScore(h: Hotspot): number {
  return Math.round(
    h.recurring * 1.6 +
      h.avgRisk * 0.5 +
      h.unresolvedRatio * 40 +
      h.escalations * 3 +
      (h.impact === "สูงมาก" ? 12 : h.impact === "สูง" ? 8 : h.impact === "ปานกลาง" ? 4 : 0),
  );
}

const STATUS_COLOR: Record<Hotspot["status"], string> = {
  high: "bg-danger",
  recurring: "bg-[oklch(0.68_0.16_55)]",
  resolved: "bg-info",
  multi: "bg-[oklch(0.55_0.18_295)]",
};

const STATUS_LABEL: Record<Hotspot["status"], string> = {
  high: "เคสเสี่ยงสูง ยังไม่ปิด",
  recurring: "จุดปัญหาซ้ำ",
  resolved: "Hotspot ที่แก้ไขแล้ว",
  multi: "หลายหน่วยงาน / Escalate",
};

type Mode = "heatmap" | "recurring" | "policy";

function PriorityMapPage() {
  const [mode, setMode] = useState<Mode>("heatmap");
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [onlyRecurring, setOnlyRecurring] = useState(false);
  const [onlyHighRisk, setOnlyHighRisk] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(HOTSPOTS[0].id);

  const filtered = useMemo(() => {
    return HOTSPOTS.filter((h) => {
      if (onlyOverdue && h.unresolvedRatio < 0.35) return false;
      if (onlyRecurring && h.recurring < 10) return false;
      if (onlyHighRisk && h.avgRisk < 70) return false;
      if (mode === "recurring" && h.recurring < 8) return false;
      if (mode === "policy" && priorityScore(h) < 55) return false;
      return true;
    });
  }, [mode, onlyOverdue, onlyRecurring, onlyHighRisk]);

  const ranked = useMemo(
    () => [...HOTSPOTS].sort((a, b) => priorityScore(b) - priorityScore(a)),
    [],
  );

  const selected = HOTSPOTS.find((h) => h.id === selectedId) ?? HOTSPOTS[0];

  const totals = {
    cases: HOTSPOTS.reduce((s, h) => s + h.cases, 0),
    highRisk: HOTSPOTS.filter((h) => h.avgRisk >= 70).length,
    recurring: HOTSPOTS.filter((h) => h.recurring >= 10).length,
    overdue: HOTSPOTS.filter((h) => h.unresolvedRatio >= 0.35).length,
    topDistrict: ANALYTICS.topDistricts[0].name,
    topCategory: ANALYTICS.topCategories[0].name,
  };

  return (
    <AppShell
      title="แผนที่จุดเสี่ยงและปัญหาซ้ำของกรุงเทพฯ"
      subtitle="Bangkok Traffic Risk Priority Map · สนับสนุนการตัดสินใจสำหรับผู้บริหารเมือง"
    >
      <div className="space-y-5">
        {/* Back */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> กลับสู่ Analytics
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground">
            <Crown className="h-3 w-3" /> Executive Dashboard · ภาพรวมเชิงพื้นที่
          </div>
        </div>

        {/* Executive summary */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <Stat label="จำนวนเคสทั้งหมด" value={totals.cases} tone="text-foreground" />
          <Stat label="เคสความเสี่ยงสูง" value={totals.highRisk} tone="text-danger" />
          <Stat label="จุดปัญหาซ้ำ" value={totals.recurring} tone="text-[oklch(0.55_0.16_55)]" />
          <Stat label="เคสค้างเกินกำหนด" value={totals.overdue} tone="text-[oklch(0.5_0.18_25)]" />
          <Stat label="เขตเสี่ยงสะสมสูงสุด" value={totals.topDistrict} tone="text-primary" />
          <Stat label="หมวดปัญหาที่พบบ่อย" value={totals.topCategory} tone="text-foreground" />
        </div>

        {/* Tabs + Filters */}
        <div className="card-elevated p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "heatmap", label: "Heatmap ความเสี่ยง" },
                { id: "recurring", label: "จุดปัญหาซ้ำ" },
                { id: "policy", label: "พื้นที่ควรติดตามเชิงนโยบาย" },
              ] as { id: Mode; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  mode === t.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase text-muted-foreground mr-1">
              <Filter className="h-3 w-3" /> Filters
            </div>
            <div className="inline-flex rounded-full border border-border bg-card overflow-hidden">
              {(["7", "30", "90"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-3 py-1 text-[11px] font-medium",
                    range === r ? "bg-foreground text-background" : "text-muted-foreground",
                  )}
                >
                  {r} วัน
                </button>
              ))}
            </div>
            <Toggle active={onlyOverdue} onClick={() => setOnlyOverdue((v) => !v)}>
              เฉพาะเคสค้าง
            </Toggle>
            <Toggle active={onlyRecurring} onClick={() => setOnlyRecurring((v) => !v)}>
              เฉพาะเคสซ้ำ
            </Toggle>
            <Toggle active={onlyHighRisk} onClick={() => setOnlyHighRisk((v) => !v)}>
              เฉพาะเคสเสี่ยงสูง
            </Toggle>
          </div>
        </div>

        {/* Map + Detail */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
          {/* Map */}
          <div className="card-elevated p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <div className="text-sm font-bold text-foreground">
                แผนที่กรุงเทพมหานคร · เคสค้าง + ถูกตีกลับ รายเขต
              </div>
              <Legend />
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-[oklch(0.985_0.005_85)]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 75" preserveAspectRatio="none">
                {/* River backdrop */}
                <path
                  d="M -5 20 C 15 30, 25 10, 40 25 S 65 55, 80 45 S 95 70, 110 60"
                  stroke="oklch(0.82 0.07 220)"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.4"
                />
                {/* District choropleth */}
                {DISTRICTS.map((d) => {
                  const t = Math.min(1, (d.unresolved + d.pushedBack) / DISTRICT_MAX);
                  const L = 0.96 - t * 0.46;
                  const C = 0.02 + t * 0.22;
                  const fill = `oklch(${L.toFixed(3)} ${C.toFixed(3)} 25)`;
                  const isSel = selected.district === d.name;
                  return (
                    <path
                      key={d.name}
                      d={d.path}
                      fill={fill}
                      stroke={isSel ? "oklch(0.2 0.05 25)" : "oklch(1 0 0)"}
                      strokeWidth={isSel ? 0.7 : 0.35}
                      vectorEffect="non-scaling-stroke"
                      className="cursor-pointer"
                      onClick={() => {
                        const h = HOTSPOTS.find((x) => x.district === d.name);
                        if (h) setSelectedId(h.id);
                      }}
                    >
                      <title>{`${d.name} · ค้าง ${d.unresolved} · ตีกลับ ${d.pushedBack}`}</title>
                    </path>
                  );
                })}
                {/* Labels */}
                {DISTRICTS.map((d) => {
                  const t = Math.min(1, (d.unresolved + d.pushedBack) / DISTRICT_MAX);
                  return (
                    <text
                      key={`l-${d.name}`}
                      x={d.cx}
                      y={d.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="2"
                      fontWeight={600}
                      fill={t > 0.55 ? "oklch(0.99 0 0)" : "oklch(0.3 0.02 25)"}
                      style={{ pointerEvents: "none" }}
                    >
                      {d.name}
                    </text>
                  );
                })}
              </svg>

              {/* Markers */}
              {filtered.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedId(h.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  aria-label={h.name}
                >
                  <span
                    className={cn(
                      "relative grid place-items-center h-6 w-6 rounded-full ring-2 ring-background shadow-md transition",
                      STATUS_COLOR[h.status],
                      selected.id === h.id && "scale-125",
                    )}
                  >
                    <MapPin className="h-3 w-3 text-white" />
                  </span>
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded-md bg-foreground/90 px-1.5 py-0.5 text-[9px] font-medium text-background opacity-0 group-hover:opacity-100">
                    {h.name}
                  </span>
                </button>
              ))}

              <div className="absolute bottom-2 left-2 rounded-md bg-background/90 backdrop-blur px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                กรุงเทพมหานคร · 24 เขต · ความเข้มสีแดง = เคสค้าง + ถูกตีกลับ
              </div>

              <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-background/90 backdrop-blur px-2 py-1 text-[9.5px] font-medium text-muted-foreground">
                <span>น้อย</span>
                <span
                  className="h-2 w-20 rounded-sm"
                  style={{
                    background:
                      "linear-gradient(to right, oklch(0.96 0.02 25), oklch(0.78 0.12 25), oklch(0.62 0.2 25), oklch(0.5 0.22 25))",
                  }}
                />
                <span>มาก</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              แผนที่ผ่าเขตการปกครองของกรุงเทพฯ ออกเป็น 24 เขต ความเข้มของสีแดงในแต่ละเขตสะท้อน <span className="font-semibold text-foreground">จำนวนเคสที่ยังไม่ได้รับการแก้ไข</span> รวมกับ <span className="font-semibold text-foreground">เคสที่ถูกหน่วยงานตีกลับหรือปฏิเสธ</span> เพื่อให้ผู้บริหารเห็นภาระคงค้างเชิงพื้นที่และจัดลำดับการติดตามเชิงโครงสร้าง
            </p>
          </div>

          {/* Detail */}
          <div className="card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">รายละเอียดจุดเสี่ยง</div>
                <div className="text-sm font-bold text-foreground">{selected.name}</div>
                <div className="text-[11px] text-muted-foreground">เขต{selected.district} · {selected.id}</div>
              </div>
              <div
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold text-white",
                  STATUS_COLOR[selected.status],
                )}
              >
                {STATUS_LABEL[selected.status]}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <Mini label="จำนวนเคสทั้งหมด" value={selected.cases} />
              <Mini label="จำนวนเคสซ้ำ" value={selected.recurring} />
              <Mini label="ค่าเฉลี่ย Risk Score" value={selected.avgRisk} />
              <Mini label="สัดส่วนเคสที่ยังไม่ปิด" value={`${Math.round(selected.unresolvedRatio * 100)}%`} />
              <Mini label="จำนวนต้อง Escalate" value={selected.escalations} />
              <Mini label="ระดับผลกระทบ" value={selected.impact} />
            </div>

            <div className="rounded-xl border border-border bg-card p-3 mb-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">หมวดปัญหาที่พบบ่อย</div>
              <div className="text-xs font-medium text-foreground">{selected.topCategory}</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 mb-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">โครงสร้างพื้นฐานใกล้เคียง</div>
              <div className="flex flex-wrap gap-1.5">
                {selected.nearby.map((n) => (
                  <span key={n} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10.5px] text-foreground">
                    {n.includes("รพ") ? <Hospital className="h-3 w-3" /> : n.includes("รร") ? <School className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary mb-1.5">
                <Activity className="h-3 w-3" /> ข้อเสนอแนะเชิงนโยบาย
              </div>
              <div className="text-xs leading-relaxed text-foreground">
                {recommendation(selected)}
              </div>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="text-sm font-bold text-foreground">อันดับพื้นที่ที่ควรได้รับการติดตาม</div>
              <div className="text-[11px] text-muted-foreground">
                Area Priority Score · คำนวณจากความถี่ของปัญหาซ้ำ ความรุนแรงของเคส ความค้างของกระบวนการ ผลกระทบต่อประชาชน และความใกล้กับจุดสำคัญของเมือง
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {ranked.map((h, i) => {
              const score = priorityScore(h);
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedId(h.id)}
                  className={cn(
                    "w-full text-left flex items-center gap-3 rounded-xl border p-3 transition",
                    selected.id === h.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-accent",
                  )}
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-sm font-extrabold text-foreground">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-semibold text-foreground truncate">{h.name}</div>
                      <span className="text-[10.5px] text-muted-foreground">เขต{h.district}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground">
                      <Tag tone="danger">เสี่ยง {h.avgRisk}</Tag>
                      <Tag tone="amber">ซ้ำ {h.recurring}</Tag>
                      <Tag tone="muted">ค้าง {Math.round(h.unresolvedRatio * 100)}%</Tag>
                      <span>· {h.topCategory}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {policyBadges(h).map((b) => (
                        <span key={b} className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-foreground">{b}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground">Priority</div>
                    <div className="text-xl font-extrabold text-foreground tabular-nums">{score}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Open data */}
        <div className="card-elevated p-5 bg-gradient-to-br from-background to-info/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-info/15 text-info">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Open Data / Public View</div>
              <div className="text-[11px] text-muted-foreground">ภาพรวมระดับพื้นที่ที่สามารถเผยแพร่ต่อสาธารณะได้</div>
            </div>
          </div>
          <ul className="mt-2 grid sm:grid-cols-2 gap-1.5 text-[11px] text-foreground">
            <li>• ยอดเคสรวมระดับเขต</li>
            <li>• จำนวนจุดปัญหาซ้ำต่อเขต</li>
            <li>• แนวโน้มหมวดปัญหา</li>
            <li>• เวลาเฉลี่ยในการตอบสนอง / อัปเดต</li>
            <li>• Public Risk Heatmap แบบไม่ระบุตัวบุคคล</li>
          </ul>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-info/30 bg-info/5 p-3 text-[11px] text-foreground">
            <ShieldCheck className="h-4 w-4 text-info shrink-0 mt-0.5" />
            <div>
              ข้อมูลในระดับภาพรวมเชิงพื้นที่สามารถต่อยอดเป็น Open Data ได้ โดยไม่เปิดเผยข้อมูลส่วนบุคคล — ไม่แสดงชื่อประชาชน เจ้าหน้าที่ ทะเบียนรถ หรือใบหน้า
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          ระบบนี้ไม่ได้ใช้แผนที่เพื่อดูเพียงจำนวนเคส แต่เพื่อสนับสนุนการตัดสินใจเชิงเมืองจากข้อมูลความเสี่ยง ปัญหาซ้ำ และความค้างของกระบวนการ
        </p>
      </div>
    </AppShell>
  );
}

function recommendation(h: Hotspot): string {
  if (h.status === "high" && h.unresolvedRatio > 0.4) return "ควรติดตามเร่งด่วน และจัดลำดับความสำคัญในการแก้ไขก่อนพื้นที่อื่น พร้อมประสานหน่วยงานที่เกี่ยวข้องเพื่อปลดล็อกความค้างของกระบวนการ";
  if (h.status === "multi") return "ควรประสานหลายหน่วยงาน และใช้ข้อมูลนี้ประกอบการจัดสรรทรัพยากรในรอบงบประมาณถัดไป";
  if (h.recurring >= 15) return "ควรติดตามเชิงโครงสร้าง เนื่องจากเป็นจุดปัญหาซ้ำที่บ่งชี้ปัญหาเชิงกายภาพหรือเชิงระบบของพื้นที่";
  if (h.status === "resolved") return "พื้นที่นี้แก้ไขแล้ว ควรเฝ้าระวังการกลับมาเกิดซ้ำและใช้เป็นกรณีศึกษาเชิงนโยบาย";
  return "ควรเฝ้าระวังต่อเนื่อง และใช้ข้อมูลนี้ประกอบการจัดสรรทรัพยากรเชิงพื้นที่";
}

function policyBadges(h: Hotspot): string[] {
  const out: string[] = [];
  if (h.avgRisk >= 70) out.push("เสี่ยงสูง");
  if (h.recurring >= 10) out.push("ปัญหาซ้ำ");
  if (h.unresolvedRatio >= 0.35) out.push("ค้างเกินกำหนด");
  if (h.recurring >= 15) out.push("ต้องติดตามเชิงโครงสร้าง");
  if (h.impact === "สูงมาก" || h.impact === "สูง") out.push("กระทบการเดินทางของประชาชน");
  return out;
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="card-elevated p-3.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground leading-snug">{label}</div>
      <div className={cn("mt-1 text-xl font-extrabold tabular-nums truncate", tone)}>{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-snug">{label}</div>
      <div className="mt-0.5 text-base font-extrabold text-foreground tabular-nums">{value}</div>
    </div>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-medium transition",
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Tag({ tone, children }: { tone: "danger" | "amber" | "muted"; children: React.ReactNode }) {
  const cls =
    tone === "danger"
      ? "bg-danger/10 text-danger"
      : tone === "amber"
        ? "bg-[oklch(0.95_0.08_75)] text-[oklch(0.45_0.16_55)]"
        : "bg-muted text-muted-foreground";
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cls)}>{children}</span>;
}

function Legend() {
  const items: { color: string; label: string }[] = [
    { color: "bg-danger", label: "เสี่ยงสูง · ยังไม่ปิด" },
    { color: "bg-[oklch(0.68_0.16_55)]", label: "จุดปัญหาซ้ำ" },
    { color: "bg-[oklch(0.55_0.18_295)]", label: "หลายหน่วยงาน" },
    { color: "bg-info", label: "แก้ไขแล้ว" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1">
          <span className={cn("h-2 w-2 rounded-full", i.color)} /> {i.label}
        </span>
      ))}
    </div>
  );
}

// suppress unused icon import warnings if any
void AlertTriangle;
void Flame;
void Layers;
void Building2;
