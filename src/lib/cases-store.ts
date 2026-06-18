// Shared, in-memory case store so the officer board can move cards and
// citizen reports can flow into the same dataset for the prototype.
import { useSyncExternalStore } from "react";
import { MOCK_CASES, type Case, type Status } from "./abjust-data";
import {
  appendAudit,
  escalateOnce,
  seedEscalation,
  type EscalationState,
} from "./escalation";

const MINE_KEY = "abjust:mine";
const SEED_MINE = ["ABJ-2410-0871"];

function loadMine(): Set<string> {
  if (typeof window === "undefined") return new Set(SEED_MINE);
  try {
    const raw = window.localStorage.getItem(MINE_KEY);
    if (!raw) return new Set(SEED_MINE);
    const arr = JSON.parse(raw) as string[];
    return new Set(arr.length ? arr : SEED_MINE);
  } catch {
    return new Set(SEED_MINE);
  }
}

function saveMine(s: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MINE_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

let cases: Case[] = [...MOCK_CASES];
let mine: Set<string> = loadMine();
let lastCreatedId: string | null = null;
let pendingDraft: Draft | null = null;
const escalations: Map<string, EscalationState> = new Map(
  cases.map((c) => [c.id, seedEscalation(c)]),
);
// Pre-escalate a couple of demo cases so the Escalation board is alive on load
(() => {
  const demoL2 = cases.find((c) => c.id === "ABJ-2410-0851"); // จอดบนทางเท้า, รับเรื่องแล้ว
  if (demoL2) {
    const s = escalations.get(demoL2.id);
    if (s) escalations.set(demoL2.id, escalateOnce(demoL2, { ...s, overdue: true }));
  }
  const demoL3 = cases.find((c) => c.id === "ABJ-2410-0848"); // ขับย้อนศร
  if (demoL3) {
    const s0 = escalations.get(demoL3.id);
    if (s0) {
      const s1 = escalateOnce(demoL3, { ...s0, overdue: true });
      escalations.set(demoL3.id, escalateOnce(demoL3, s1));
    }
  }
})();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function ensureEsc(id: string): EscalationState | undefined {
  const c = cases.find((x) => x.id === id);
  if (!c) return undefined;
  let s = escalations.get(id);
  if (!s) {
    s = seedEscalation(c);
    escalations.set(id, s);
  }
  return s;
}

export interface Draft {
  category: string;
  description: string;
  lat: number;
  lng: number;
  locationLabel: string;
  note: string;
  attachmentCount: number;
  imageSeverity: number; // 0-100, heuristic from attachments
  createdAt: number;
}

export const casesStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getAll: () => cases,
  get(id: string) {
    return cases.find((c) => c.id === id);
  },
  updateStatus(id: string, status: Status) {
    const prev = cases.find((c) => c.id === id);
    cases = cases.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            updatedAt: "เมื่อสักครู่",
            currentStep: stepForStatus(status, c.currentStep),
          }
        : c,
    );
    const s = ensureEsc(id);
    if (s && prev) {
      escalations.set(
        id,
        appendAudit(s, {
          actor: prev.unit,
          action: "เจ้าหน้าที่อัปเดตสถานะเคส",
          fromStatus: prev.status,
          toStatus: status,
          level: s.level,
        }),
      );
    }
    emit();
  },
  addCase(c: Case, mineFlag = true) {
    cases = [c, ...cases];
    escalations.set(c.id, seedEscalation(c));
    lastCreatedId = c.id;
    if (mineFlag) {
      mine.add(c.id);
      saveMine(mine);
    }
    emit();
  },
  incrementMerged(id: string, mineFlag = true) {
    cases = cases.map((c) =>
      c.id === id ? { ...c, mergedReports: c.mergedReports + 1, updatedAt: "เมื่อสักครู่" } : c,
    );
    lastCreatedId = id;
    if (mineFlag) {
      mine.add(id);
      saveMine(mine);
    }
    emit();
  },
  getLastCreatedId: () => lastCreatedId,
  getMineIds: () => [...mine],
  isMine: (id: string) => mine.has(id),
  setDraft(d: Draft | null) {
    pendingDraft = d;
    emit();
  },
  getDraft: () => pendingDraft,
  clearDraft() {
    pendingDraft = null;
    emit();
  },
  getEscalation(id: string): EscalationState | undefined {
    return ensureEsc(id);
  },
  simulateOverdue(id: string) {
    const c = cases.find((x) => x.id === id);
    const s = ensureEsc(id);
    if (!c || !s) return;
    // Push to next escalation level with full reasons
    let next = escalateOnce(c, { ...s, overdue: true });
    if (next.level < 2) next = escalateOnce(c, next);
    escalations.set(id, next);
    emit();
  },
  escalate(id: string, reason?: string) {
    const c = cases.find((x) => x.id === id);
    const s = ensureEsc(id);
    if (!c || !s) return;
    escalations.set(id, escalateOnce(c, s, reason));
    emit();
  },
  requestCitizenReview(id: string) {
    const s = ensureEsc(id);
    if (!s) return;
    escalations.set(
      id,
      appendAudit(s, {
        actor: "ประชาชนผู้รายงาน",
        action: "ประชาชนขอให้ตรวจสอบสถานะอีกครั้ง",
        reason: "ไม่มีการอัปเดตตามระยะเวลาที่กำหนด",
        level: s.level,
      }),
    );
    emit();
  },
  transferUnit(id: string, toUnit: string, reason: string) {
    const prev = cases.find((c) => c.id === id);
    if (!prev) return;
    cases = cases.map((c) =>
      c.id === id ? { ...c, unit: toUnit, updatedAt: "เมื่อสักครู่" } : c,
    );
    const s = ensureEsc(id);
    if (s) {
      escalations.set(id, {
        ...appendAudit(s, {
          actor: prev.unit,
          action: `เคสถูกส่งต่อไปยัง ${toUnit}`,
          reason,
          level: s.level,
        }),
        transferCount: s.transferCount + 1,
      });
    }
    emit();
  },
};

function stepForStatus(s: Status, fallback: number): number {
  const map: Record<Status, number> = {
    "รับเรื่องแล้ว": 0,
    "กำลังตรวจสอบ": 3,
    "มอบหมายหน่วยงานแล้ว": 4,
    "กำลังดำเนินการ": 5,
    "แก้ไขเสร็จสิ้น": 7,
  };
  return map[s] ?? fallback;
}

export function useCases(): Case[] {
  return useSyncExternalStore(casesStore.subscribe, casesStore.getAll, casesStore.getAll);
}

export function useCase(id: string): Case | undefined {
  const all = useCases();
  return all.find((c) => c.id === id);
}

export function useMyCases(): Case[] {
  const all = useCases();
  return all.filter((c) => casesStore.isMine(c.id));
}

export function nextCaseId(): string {
  const n = 900 + Math.floor(Math.random() * 99);
  return `ABJ-2410-0${n}`;
}

export function useEscalation(id: string): EscalationState | undefined {
  useCases(); // re-subscribe on emit
  return casesStore.getEscalation(id);
}

export function useAllEscalations(): Array<{ case: Case; state: EscalationState }> {
  const all = useCases();
  return all
    .map((c) => {
      const s = casesStore.getEscalation(c.id);
      return s ? { case: c, state: s } : null;
    })
    .filter((x): x is { case: Case; state: EscalationState } => x !== null);
}
