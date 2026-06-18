// Shared, in-memory case store so the officer board can move cards and
// citizen reports can flow into the same dataset for the prototype.
import { useSyncExternalStore } from "react";
import { MOCK_CASES, type Case, type Status } from "./abjust-data";

let cases: Case[] = [...MOCK_CASES];
let lastCreatedId: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

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
    emit();
  },
  addCase(c: Case) {
    cases = [c, ...cases];
    lastCreatedId = c.id;
    emit();
  },
  incrementMerged(id: string) {
    cases = cases.map((c) =>
      c.id === id ? { ...c, mergedReports: c.mergedReports + 1, updatedAt: "เมื่อสักครู่" } : c,
    );
    lastCreatedId = id;
    emit();
  },
  getLastCreatedId: () => lastCreatedId,
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

export function nextCaseId(): string {
  const n = 900 + Math.floor(Math.random() * 99);
  return `ABJ-2410-0${n}`;
}
