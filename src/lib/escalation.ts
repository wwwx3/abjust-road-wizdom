// Escalation Ladder & Audit Trail logic for Abjust prototype.
// Governance transparency only — no officer scoring, no blame.

import type { Case, RiskLevel } from "./abjust-data";

export type EscalationLevel = 1 | 2 | 3 | 4 | 5;

export interface EscalationStep {
  level: EscalationLevel;
  label: string;          // Thai short label
  owner: string;          // responsible unit / role label
  description: string;
}

export const ESCALATION_LADDER: EscalationStep[] = [
  {
    level: 1,
    label: "หน่วยงานเจ้าของเคส",
    owner: "หน่วยงานหลักที่ถูกมอบหมาย",
    description: "หน่วยงานหลักรับเคสและดำเนินการตามขั้นตอน",
  },
  {
    level: 2,
    label: "ผู้ประสานงานกลาง",
    owner: "ศูนย์ประสานงานเมือง",
    description: "เคสไม่ถูกรับภายในเวลา ระบบส่งต่อให้ผู้ประสานงานกลาง",
  },
  {
    level: 3,
    label: "หัวหน้าหน่วยงาน",
    owner: "หัวหน้าหน่วยงานที่เกี่ยวข้อง",
    description: "เคสยังไม่ถูกดำเนินการ ต้องถูกพิจารณาโดยหัวหน้าหน่วยงาน",
  },
  {
    level: 4,
    label: "ผู้บริหารเมือง",
    owner: "ผู้บริหารระดับเมือง",
    description: "เคสถูกแสดงใน Dashboard ผู้บริหาร เพื่อการตัดสินใจระดับนโยบาย",
  },
  {
    level: 5,
    label: "ภาพรวมสาธารณะ",
    owner: "เปิดเผยเป็นภาพรวมต่อสาธารณะ",
    description:
      "เคสค้างนานผิดปกติจะถูกรวมในตัวเลขสาธารณะแบบไม่เปิดเผยข้อมูลส่วนบุคคล",
  },
];

// First-response deadline in hours, by risk level
export const DEADLINE_HOURS: Record<RiskLevel, number> = {
  สูงมาก: 6,
  สูง: 12,
  ปานกลาง: 24,
  ต่ำ: 72,
};

export interface AuditEvent {
  id: string;
  ts: number;            // epoch ms
  actor: string;         // unit / role label (NEVER a person name)
  action: string;
  reason?: string;
  fromStatus?: string;
  toStatus?: string;
  level?: EscalationLevel;
}

export interface EscalationState {
  level: EscalationLevel;
  reason: string;
  lastEscalatedAt: number;     // epoch ms when current level was reached
  deadlineAt: number;          // epoch ms when next escalation will trigger
  transferCount: number;
  overdue: boolean;
  audit: AuditEvent[];
}

const nowFromNowLabel = (label: string): number => {
  // Parse very simple Thai "X นาที/ชั่วโมงที่แล้ว / เมื่อสักครู่ / เมื่อวาน" -> ms ago
  const now = Date.now();
  if (!label) return now;
  if (label.includes("เมื่อสักครู่")) return now - 60_000;
  if (label.includes("เมื่อวาน")) return now - 26 * 3600_000;
  const m = label.match(/(\d+)\s*นาที/);
  if (m) return now - parseInt(m[1]) * 60_000;
  const h = label.match(/(\d+)\s*ชั่วโมง/);
  if (h) return now - parseInt(h[1]) * 3600_000;
  return now - 60_000;
};

let _evtSeq = 1;
const evtId = () => `EVT-${Date.now().toString(36)}-${(_evtSeq++).toString(36)}`;

export function seedEscalation(c: Case): EscalationState {
  const createdAt = nowFromNowLabel(c.updatedAt);
  const deadlineMs = DEADLINE_HOURS[c.riskLevel] * 3600_000;
  const audit: AuditEvent[] = [
    {
      id: evtId(),
      ts: createdAt - 30_000,
      actor: "ระบบ Abjust",
      action: "รับเรื่องและสร้างเคส",
      level: 1,
    },
    {
      id: evtId(),
      ts: createdAt - 20_000,
      actor: "AI Triage",
      action: `ระบบแนะนำหน่วยงานหลัก: ${c.unit}`,
      reason: `Risk Score ${c.riskScore} / ระดับ ${c.riskLevel}`,
      level: 1,
    },
    {
      id: evtId(),
      ts: createdAt - 10_000,
      actor: c.unit,
      action: "เคสถูกมอบหมายให้หน่วยงานหลัก",
      level: 1,
    },
  ];
  // If status is past "รับเรื่องแล้ว" treat as accepted
  if (c.status !== "รับเรื่องแล้ว") {
    audit.push({
      id: evtId(),
      ts: createdAt - 5_000,
      actor: c.unit,
      action: "หน่วยงานหลักรับเคสและเริ่มดำเนินการ",
      fromStatus: "รับเรื่องแล้ว",
      toStatus: c.status,
      level: 1,
    });
  }
  return {
    level: 1,
    reason: "เคสอยู่กับหน่วยงานหลักที่ถูกมอบหมาย",
    lastEscalatedAt: createdAt,
    deadlineAt: createdAt + deadlineMs,
    transferCount: 0,
    overdue: false,
    audit,
  };
}

export function escalateOnce(
  c: Case,
  state: EscalationState,
  forcedReason?: string,
): EscalationState {
  if (state.level >= 5) return state;
  const nextLevel = (state.level + 1) as EscalationLevel;
  const step = ESCALATION_LADDER[nextLevel - 1];
  const deadlineMs = DEADLINE_HOURS[c.riskLevel] * 3600_000;
  const now = Date.now();
  const reason =
    forcedReason ??
    (nextLevel === 2
      ? `ไม่มีการรับเคสภายใน ${DEADLINE_HOURS[c.riskLevel]} ชั่วโมง ระบบส่งต่อผู้ประสานงานกลางอัตโนมัติ`
      : nextLevel === 3
        ? "ไม่มีการอัปเดตภายในเวลาที่กำหนด ระบบส่งต่อหัวหน้าหน่วยงาน"
        : nextLevel === 4
          ? "เคสยังไม่ถูกดำเนินการ ระบบแสดงในส่วนของผู้บริหารเมือง"
          : "เคสค้างเกินกำหนดสะสม ระบบรวมในภาพรวมสาธารณะ");
  return {
    ...state,
    level: nextLevel,
    reason,
    lastEscalatedAt: now,
    deadlineAt: now + Math.max(3, Math.floor(DEADLINE_HOURS[c.riskLevel] / 2)) * 3600_000,
    overdue: true,
    audit: [
      ...state.audit,
      {
        id: evtId(),
        ts: now,
        actor: "ระบบ Abjust",
        action: `เคสถูกส่งต่อไปยัง ${step.label}`,
        reason,
        level: nextLevel,
      },
    ],
  };
}

export function appendAudit(
  state: EscalationState,
  ev: Omit<AuditEvent, "id" | "ts"> & { ts?: number },
): EscalationState {
  return {
    ...state,
    audit: [
      ...state.audit,
      { id: evtId(), ts: ev.ts ?? Date.now(), ...ev },
    ],
  };
}

export function timeRemainingLabel(ms: number): string {
  if (ms <= 0) {
    const over = -ms;
    const h = Math.floor(over / 3600_000);
    if (h >= 24) return `ค้างเกิน ${Math.floor(h / 24)} วัน`;
    if (h >= 1) return `ค้างเกิน ${h} ชั่วโมง`;
    return `ค้างเกิน ${Math.max(1, Math.floor(over / 60_000))} นาที`;
  }
  const h = Math.floor(ms / 3600_000);
  if (h >= 24) return `เหลือ ~${Math.floor(h / 24)} วัน`;
  if (h >= 1) return `เหลือ ~${h} ชั่วโมง`;
  return `เหลือ ~${Math.max(1, Math.floor(ms / 60_000))} นาที`;
}

export function citizenFriendlyStateText(state: EscalationState): string {
  if (state.level === 1 && !state.overdue) return "เคสอยู่กับหน่วยงานที่เกี่ยวข้อง";
  if (state.level >= 2) return "อยู่ระหว่างการประสานงานเพิ่มเติม";
  return "เคสอยู่กับหน่วยงานที่เกี่ยวข้อง";
}
