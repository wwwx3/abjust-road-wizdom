// AI pipeline — rule-based fallbacks that run fully offline.
// Designed as a separable layer: swap implementations here when an
// LLM API or vision model is wired in later.

import type { RiskLevel } from "./abjust-data";

// ---------- Category metadata ----------
// baseSeverity is the rule-based baseline 0-100 for each Thai category.
export const CATEGORY_META: Record<string, { baseSeverity: number; defaultUnit: string }> = {
  "จอดรถผิดกฎหมาย": { baseSeverity: 60, defaultUnit: "Traffic Enforcement Unit" },
  "จอดขวางช่องจราจร": { baseSeverity: 75, defaultUnit: "Traffic Enforcement Unit" },
  "จอดบนทางเท้า": { baseSeverity: 65, defaultUnit: "เทศกิจเขต" },
  "ขับย้อนศร": { baseSeverity: 85, defaultUnit: "Traffic Enforcement Unit" },
  "ขับไหล่ทาง": { baseSeverity: 70, defaultUnit: "Traffic Enforcement Unit" },
  "กีดขวางทางรถฉุกเฉิน": { baseSeverity: 95, defaultUnit: "Traffic Enforcement Unit" },
  "สัญญาณไฟจราจรผิดปกติ": { baseSeverity: 80, defaultUnit: "สำนักการจราจรและขนส่ง" },
  "ทางเดินเท้าถูกกีดขวาง": { baseSeverity: 50, defaultUnit: "เทศกิจเขต" },
  "น้ำท่วมถนนกระทบการจราจร": { baseSeverity: 78, defaultUnit: "สำนักการระบายน้ำ" },
  "ป้ายหรือเส้นจราจรไม่ชัดเจน": { baseSeverity: 45, defaultUnit: "สำนักการจราจรและขนส่ง" },
  "สิ่งกีดขวางหรือจุดเสี่ยงบนถนน": { baseSeverity: 70, defaultUnit: "สำนักการโยธา" },
  "อื่น ๆ": { baseSeverity: 40, defaultUnit: "ศูนย์รับเรื่องร้องเรียน กทม." },
};

export const DUPLICATE_RADIUS_M = 150;

// ---------- Geometry ----------
export function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const r = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const p1 = toRad(lat1);
  const p2 = toRad(lat2);
  const dp = toRad(lat2 - lat1);
  const dl = toRad(lng2 - lng1);
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

// ---------- 1) AI description ----------
export function generateDescription(opts: {
  category: string;
  description: string;
  lat: number;
  lng: number;
  locationLabel?: string;
}): string {
  const hour = new Date().getHours();
  const isRush = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
  const timeCtx = isRush ? "ช่วงชั่วโมงเร่งด่วน" : "นอกชั่วโมงเร่งด่วน";
  const place = opts.locationLabel
    ? `บริเวณ${opts.locationLabel} (${opts.lat.toFixed(5)}, ${opts.lng.toFixed(5)})`
    : `บริเวณพิกัด (${opts.lat.toFixed(5)}, ${opts.lng.toFixed(5)})`;
  let base = `ระบบตรวจพบเหตุ "${opts.category}" ${place} ในช่วง${timeCtx}`;
  if (opts.description?.trim()) {
    base += ` รายละเอียดจากผู้แจ้ง: ${opts.description.trim()}`;
  }
  base += " AI แนะนำให้เจ้าหน้าที่ตรวจสอบและจัดลำดับตามผลกระทบจริง";
  return base;
}

// ---------- 2) Risk scoring (rule-based, 0-100) ----------
export function riskScore(opts: {
  category: string;
  impactedCount: number; // จำนวนผู้ได้รับผลกระทบโดยประมาณ
  recurrenceCount: number; // จำนวนครั้งที่เคยเกิดในจุดเดิม
}): number {
  const meta = CATEGORY_META[opts.category] ?? CATEGORY_META["อื่น ๆ"];
  let score = meta.baseSeverity;
  const hour = new Date().getHours();
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) score += 10;
  score += Math.min(Math.max(opts.impactedCount - 1, 0), 5) * 4;
  score += Math.min(opts.recurrenceCount, 3) * 3;
  return Math.round(Math.min(score, 100) * 10) / 10;
}

export function riskLevelOf(score: number): RiskLevel {
  if (score >= 80) return "สูงมาก";
  if (score >= 60) return "สูง";
  if (score >= 40) return "ปานกลาง";
  return "ต่ำ";
}

// ---------- 3) Priority score (composite, 0-100) ----------
// น้ำหนัก: ความเสี่ยง 40% · ผู้ได้รับผลกระทบ 25% · จำนวนผู้แจ้ง 15% ·
// ระยะเวลาค้าง 10% · ความรุนแรงจากภาพ 10%
export function priorityScore(opts: {
  risk: number; // 0-100
  impactedCount: number; // คนที่กระทบ
  reporterCount: number; // จำนวนผู้แจ้ง
  ageHours: number;
  imageSeverity?: number; // 0-100 (จาก vision model หรือ heuristic)
}): number {
  const impacted = Math.min(opts.impactedCount, 200) / 2; // 0-100
  const reporters = Math.min(opts.reporterCount, 20) * 5; // 0-100
  const age = Math.min(opts.ageHours, 48) * (100 / 48); // 0-100
  const image = opts.imageSeverity ?? 30;
  const score =
    opts.risk * 0.4 +
    impacted * 0.25 +
    reporters * 0.15 +
    age * 0.1 +
    image * 0.1;
  return Math.round(score * 10) / 10;
}

// SLA hint per priority level (Critical < 24hr, High < 3d, Medium < 7d, Low backlog)
export function slaHint(level: RiskLevel): string {
  switch (level) {
    case "สูงมาก":
      return "ดำเนินการภายใน 24 ชั่วโมง · เสี่ยงต่อชีวิต";
    case "สูง":
      return "ดำเนินการภายใน 3 วัน · กระทบคนหมู่มาก";
    case "ปานกลาง":
      return "ดำเนินการภายใน 7 วัน · กระทบการใช้ชีวิต";
    default:
      return "เพิ่มในรายการคิว · ใช้งานได้แต่ไม่เรียบร้อย";
  }
}

// ---------- 4) Duplicate detection ----------
export interface DuplicateCandidate {
  id: string;
  category: string;
  lat: number;
  lng: number;
}

export function findDuplicate<T extends DuplicateCandidate>(
  openCases: T[],
  opts: { category: string; lat: number; lng: number },
): { case: T; distance: number } | null {
  let best: { case: T; distance: number } | null = null;
  for (const c of openCases) {
    if (c.category !== opts.category) continue;
    const d = haversineM(opts.lat, opts.lng, c.lat, c.lng);
    if (d < DUPLICATE_RADIUS_M && (!best || d < best.distance)) {
      best = { case: c, distance: d };
    }
  }
  return best;
}

// ---------- 5) Recommended unit ----------
export function recommendUnit(category: string): string {
  return (CATEGORY_META[category] ?? CATEGORY_META["อื่น ๆ"]).defaultUnit;
}

// Map urgency selection from citizen UI to an "impactedCount" estimate
export function impactedFromUrgency(u: string): number {
  switch (u) {
    case "critical":
      return 80;
    case "high":
      return 40;
    case "med":
      return 15;
    default:
      return 3;
  }
}
