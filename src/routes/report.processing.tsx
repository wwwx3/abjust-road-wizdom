import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Search,
  GitMerge,
  ShieldAlert,
  Gauge,
  CheckCircle2,
  Loader2,
  ArrowRight,
  MapPin,
  Layers,
  Building2,
  XCircle,
  PlusCircle,
} from "lucide-react";
import { casesStore, nextCaseId, useCases } from "@/lib/cases-store";
import {
  CATEGORY_META,
  generateDescription,
  riskScore,
  riskLevelOf,
  priorityScore,
  recommendUnit,
  slaHint,
  findSimilarCases,
  impactedFromCategory,
  type SimilarCandidate,
} from "@/lib/ai-pipeline";
import type { Case } from "@/lib/abjust-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/report/processing")({
  head: () => ({ meta: [{ title: "AI กำลังประมวลผล — Abjust" }] }),
  component: ProcessingPage,
});

type Stage = "summary" | "risk" | "similar" | "verify" | "priority" | "done";

const STAGE_ORDER: Stage[] = ["summary", "risk", "similar", "verify", "priority", "done"];

function ProcessingPage() {
  const router = useRouter();
  const all = useCases();
  const draft = casesStore.getDraft();

  // Redirect if user landed here without a draft
  useEffect(() => {
    if (!draft) router.navigate({ to: "/report" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [stage, setStage] = useState<Stage>("summary");
  const [scanIdx, setScanIdx] = useState(0);
  const [chosenMerge, setChosenMerge] = useState<string | null>(null);
  const [decision, setDecision] = useState<"new" | "merge" | null>(null);
  const finalIdRef = useRef<string | null>(null);

  // --- precompute pipeline outputs from draft (memoised) ---
  const computed = useMemo(() => {
    if (!draft) return null;
    const meta = CATEGORY_META[draft.category] ?? CATEGORY_META["อื่น ๆ"];
    const impactedCount = impactedFromCategory(draft.category);
    const hour = new Date().getHours();
    const isRush = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
    const openCases = all.filter((c) => c.status !== "แก้ไขเสร็จสิ้น");
    const recurrence = all.filter((c) => c.category === draft.category).length;
    const risk = riskScore({ category: draft.category, impactedCount, recurrenceCount: recurrence });
    const level = riskLevelOf(risk);
    const summary = generateDescription({
      category: draft.category,
      description: draft.description,
      lat: draft.lat,
      lng: draft.lng,
      locationLabel: draft.locationLabel,
    });
    const candidates = findSimilarCases(
      openCases.map((c) => ({
        id: c.id,
        category: c.category,
        lat: c.location.lat,
        lng: c.location.lng,
        _ref: c,
      })),
      { category: draft.category, lat: draft.lat, lng: draft.lng, radiusM: 800 },
    );
    return { meta, impactedCount, isRush, recurrence, risk, level, summary, candidates };
  }, [draft, all]);

  // --- stage timeline ---
  useEffect(() => {
    if (!draft || !computed) return;
    if (stage === "summary") {
      const t = setTimeout(() => setStage("risk"), 1100);
      return () => clearTimeout(t);
    }
    if (stage === "risk") {
      const t = setTimeout(() => setStage("similar"), 1400);
      return () => clearTimeout(t);
    }
    if (stage === "similar") {
      // animate scan through open cases
      const total = Math.max(6, Math.min(12, all.length));
      let i = 0;
      const iv = setInterval(() => {
        i += 1;
        setScanIdx(i);
        if (i >= total) {
          clearInterval(iv);
          // if no candidates at all, skip verify
          setTimeout(() => {
            if (!computed.candidates.length) {
              setDecision("new");
              setStage("priority");
            } else {
              setStage("verify");
            }
          }, 350);
        }
      }, 180);
      return () => clearInterval(iv);
    }
    if (stage === "priority") {
      const t = setTimeout(() => setStage("done"), 1300);
      return () => clearTimeout(t);
    }
  }, [stage, draft, computed, all.length]);

  // --- persist case once we reach "done" ---
  useEffect(() => {
    if (stage !== "done" || !draft || !computed || finalIdRef.current) return;
    if (decision === "merge" && chosenMerge) {
      casesStore.incrementMerged(chosenMerge);
      finalIdRef.current = chosenMerge;
    } else {
      const id = nextCaseId();
      const c: Case = {
        id,
        category: draft.category,
        title: draft.description.split("\n")[0].slice(0, 70) || `รายงาน ${draft.category}`,
        summary: computed.summary + ` · SLA: ${slaHint(computed.level)}`,
        riskScore: computed.risk,
        riskLevel: computed.level,
        status: "รับเรื่องแล้ว",
        mergedReports: 1,
        unit: recommendUnit(draft.category),
        district: draft.locationLabel || "ไม่ระบุเขต",
        location: { lat: draft.lat, lng: draft.lng, label: draft.locationLabel || "พิกัดที่ผู้แจ้งระบุ" },
        updatedAt: "เมื่อสักครู่",
        currentStep: 2,
      };
      casesStore.addCase(c);
      finalIdRef.current = id;
    }
  }, [stage, decision, chosenMerge, draft, computed]);

  if (!draft || !computed) {
    return (
      <AppShell title="AI กำลังประมวลผล" subtitle="กำลังเตรียมข้อมูล…">
        <div className="mx-auto max-w-3xl py-20 text-center text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
          กำลังเปิดข้อมูลจากแบบฟอร์ม…
        </div>
      </AppShell>
    );
  }

  const stageIdx = STAGE_ORDER.indexOf(stage);
  const priority = priorityScore({
    risk: computed.risk,
    impactedCount: computed.impactedCount,
    reporterCount: decision === "merge" && chosenMerge
      ? (all.find((c) => c.id === chosenMerge)?.mergedReports ?? 0) + 1
      : 1,
    ageHours: 0,
    imageSeverity: draft.imageSeverity,
  });

  const openForScan = all.filter((c) => c.status !== "แก้ไขเสร็จสิ้น");

  return (
    <AppShell title="AI Triage Pipeline" subtitle="เห็นการคำนวณทุกขั้นตอนแบบเรียลไทม์ — rule-based fallback">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* stage rail */}
        <div className="card-elevated p-4">
          <StageRail stage={stage} stageIdx={stageIdx} />
        </div>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-5">
          {/* LEFT — input & summary */}
          <div className="space-y-4">
            <Panel
              icon={<Sparkles className="h-4 w-4" />}
              tone="info"
              title="1 · AI Summary"
              done={stageIdx > 0}
              active={stage === "summary"}
            >
              <Kv label="หมวด" value={draft.category} />
              <Kv label="พิกัด" value={`${draft.lat.toFixed(5)}, ${draft.lng.toFixed(5)}`} mono />
              <Kv label="สถานที่" value={draft.locationLabel || "ไม่ระบุ"} />
              <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-foreground">
                {stage === "summary" ? <Typing text={computed.summary} /> : computed.summary}
              </div>
            </Panel>

            <Panel
              icon={<ShieldAlert className="h-4 w-4" />}
              tone="brand"
              title="2 · Risk Score (rule-based)"
              done={stageIdx > 1}
              active={stage === "risk"}
            >
              <RiskBreakdown
                category={draft.category}
                baseSeverity={computed.meta.baseSeverity}
                isRush={computed.isRush}
                impacted={computed.impactedCount}
                recurrence={computed.recurrence}
                animate={stage === "risk"}
                finalRisk={computed.risk}
                level={computed.level}
              />
            </Panel>
          </div>

          {/* RIGHT — duplicates + priority */}
          <div className="space-y-4">
            <Panel
              icon={<Search className="h-4 w-4" />}
              tone="success"
              title="3 · Similar-case scan"
              done={stageIdx > 2}
              active={stage === "similar" || stage === "verify"}
            >
              <SimilarScan
                stage={stage}
                scanIdx={scanIdx}
                pool={openForScan}
                candidates={computed.candidates}
                chosen={chosenMerge}
                onConfirmMerge={(id) => {
                  setChosenMerge(id);
                  setDecision("merge");
                  setStage("priority");
                }}
                onMarkNew={() => {
                  setChosenMerge(null);
                  setDecision("new");
                  setStage("priority");
                }}
                draftLat={draft.lat}
                draftLng={draft.lng}
              />
            </Panel>

            <Panel
              icon={<Gauge className="h-4 w-4" />}
              tone="warning"
              title="4 · Priority weighting"
              done={stage === "done"}
              active={stage === "priority"}
            >
              <PriorityBars
                risk={computed.risk}
                impacted={computed.impactedCount}
                reporters={decision === "merge" && chosenMerge
                  ? (all.find((c) => c.id === chosenMerge)?.mergedReports ?? 0) + 1
                  : 1}
                ageHours={0}
                imageSeverity={draft.imageSeverity}
                animate={stage === "priority" || stage === "done"}
                final={priority}
              />
              {decision === "merge" && chosenMerge && (
                <div className="mt-3 text-[11px] text-success-foreground inline-flex items-center gap-1.5 bg-success/15 px-2.5 py-1 rounded-full">
                  <GitMerge className="h-3 w-3" /> รวมเข้ากับ {chosenMerge} · เพิ่ม impacted count
                </div>
              )}
            </Panel>
          </div>
        </div>

        {/* footer */}
        {stage === "done" ? (
          <div className="card-elevated p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-success/30">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-sm">
                <div className="font-semibold text-foreground">
                  ประมวลผลเสร็จ · เคส {finalIdRef.current ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  ส่งเข้าบอร์ดเจ้าหน้าที่และ Timeline ของคุณเรียบร้อย
                </div>
              </div>
            </div>
            <Link
              to="/report/result"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
            >
              ดูผลสรุป <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground text-center">
            ทุกขั้นตอนเป็น rule-based AI fallback ทำงานในเครื่อง · พร้อมเปลี่ยนเป็น LLM/Vision model ได้ในไฟล์ <code>ai-pipeline.ts</code>
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* ============== sub-components ============== */

function StageRail({ stage, stageIdx }: { stage: Stage; stageIdx: number }) {
  const items: { id: Stage; label: string }[] = [
    { id: "summary", label: "สรุปเหตุการณ์" },
    { id: "risk", label: "คำนวณ Risk" },
    { id: "similar", label: "ค้นเคสคล้าย" },
    { id: "verify", label: "ยืนยันซ้ำ" },
    { id: "priority", label: "Priority Score" },
    { id: "done", label: "เปิดเคส" },
  ];
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {items.map((it, i) => {
        const done = i < stageIdx;
        const active = it.id === stage;
        return (
          <div key={it.id} className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                done && "bg-success/15 text-success",
                active && "bg-primary text-primary-foreground",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-current/20 text-[9px]">{i + 1}</span>
              )}
              {it.label}
            </div>
            {i < items.length - 1 && <div className="h-px w-4 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

function Panel({
  icon,
  tone,
  title,
  done,
  active,
  children,
}: {
  icon: React.ReactNode;
  tone: "info" | "brand" | "success" | "warning";
  title: string;
  done?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  const toneClass = {
    info: "bg-info/10 text-info",
    brand: "bg-brand/15 text-[oklch(0.42_0.13_60)]",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
  }[tone];
  return (
    <div
      className={cn(
        "card-elevated p-4 transition",
        active && "ring-2 ring-primary/30",
        done && !active && "opacity-95",
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("grid h-7 w-7 place-items-center rounded-lg", toneClass)}>{icon}</div>
        <div className="text-sm font-bold text-foreground flex-1">{title}</div>
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : active ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <span className="text-[10px] text-muted-foreground">รอ</span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Kv({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs py-1">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={cn("font-semibold text-foreground text-right truncate", mono && "font-mono")}>{value}</span>
    </div>
  );
}

function Typing({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const step = Math.max(1, Math.floor(text.length / 40));
    const iv = setInterval(() => setN((x) => Math.min(text.length, x + step)), 25);
    return () => clearInterval(iv);
  }, [text]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="inline-block w-1.5 h-3 bg-primary/70 align-middle animate-pulse ml-0.5" />}
    </>
  );
}

function RiskBreakdown({
  category,
  baseSeverity,
  isRush,
  impacted,
  recurrence,
  animate,
  finalRisk,
  level,
}: {
  category: string;
  baseSeverity: number;
  isRush: boolean;
  impacted: number;
  recurrence: number;
  animate: boolean;
  finalRisk: number;
  level: string;
}) {
  const rushBonus = isRush ? 10 : 0;
  const impactedBonus = Math.min(Math.max(impacted - 1, 0), 5) * 4;
  const recBonus = Math.min(recurrence, 3) * 3;
  const [shown, setShown] = useState(animate ? 0 : finalRisk);
  useEffect(() => {
    if (!animate) {
      setShown(finalRisk);
      return;
    }
    let v = 0;
    const iv = setInterval(() => {
      v = Math.min(finalRisk, v + Math.max(1, finalRisk / 18));
      setShown(Math.round(v * 10) / 10);
      if (v >= finalRisk) clearInterval(iv);
    }, 50);
    return () => clearInterval(iv);
  }, [animate, finalRisk]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <Term label={`base · ${category}`} val={`+${baseSeverity}`} />
        <Term label="ชั่วโมงเร่งด่วน" val={isRush ? `+${rushBonus}` : "+0"} muted={!isRush} />
        <Term label={`ผู้กระทบ ≈ ${impacted}`} val={`+${impactedBonus}`} />
        <Term label={`เกิดซ้ำ × ${recurrence}`} val={`+${recBonus}`} muted={!recBonus} />
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk score</div>
          <div className="text-3xl font-extrabold text-foreground tabular-nums">{shown}</div>
        </div>
        <div className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          level === "สูงมาก" && "bg-danger/15 text-danger",
          level === "สูง" && "bg-brand/20 text-[oklch(0.42_0.13_60)]",
          level === "ปานกลาง" && "bg-info/15 text-info",
          level === "ต่ำ" && "bg-muted text-muted-foreground",
        )}>
          ระดับ {level}
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-gradient-to-r from-info via-brand to-danger transition-all" style={{ width: `${shown}%` }} />
      </div>
    </div>
  );
}

function Term({ label, val, muted }: { label: string; val: string; muted?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between rounded-lg border border-border bg-card px-2 py-1.5", muted && "opacity-60")}>
      <span className="text-muted-foreground truncate mr-2">{label}</span>
      <span className="font-mono font-semibold text-foreground">{val}</span>
    </div>
  );
}

function SimilarScan({
  stage,
  scanIdx,
  pool,
  candidates,
  chosen,
  onConfirmMerge,
  onMarkNew,
  draftLat,
  draftLng,
}: {
  stage: Stage;
  scanIdx: number;
  pool: Case[];
  candidates: SimilarCandidate<{ id: string; category: string; lat: number; lng: number; _ref: Case }>[];
  chosen: string | null;
  onConfirmMerge: (id: string) => void;
  onMarkNew: () => void;
  draftLat: number;
  draftLng: number;
}) {
  if (stage === "summary" || stage === "risk") {
    return <div className="text-xs text-muted-foreground">รอเริ่มสแกน…</div>;
  }
  if (stage === "similar") {
    return (
      <div>
        <div className="text-xs text-muted-foreground mb-2 inline-flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" /> สแกนเคสที่เปิดอยู่ {Math.min(scanIdx, pool.length)} / {pool.length}
          <span className="ml-1 text-muted-foreground">· รัศมี 800 ม.</span>
        </div>
        <div className="space-y-1 max-h-44 overflow-hidden">
          {pool.slice(0, Math.min(scanIdx, pool.length)).map((c, i) => (
            <div
              key={c.id}
              className={cn(
                "flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-[11px]",
                i === scanIdx - 1 && "ring-2 ring-primary/40",
              )}
            >
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="font-mono text-foreground">{c.id}</span>
              <span className="truncate text-muted-foreground">· {c.category}</span>
              <span className="ml-auto font-mono text-muted-foreground">
                ~{Math.round(haversineApprox(c.location.lat, c.location.lng, draftLat, draftLng))} ม.
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // verify
  if (stage === "verify") {
    if (!candidates.length) {
      return <div className="text-xs text-muted-foreground">ไม่พบเคสคล้าย — กำลังสร้างเคสใหม่</div>;
    }
    return (
      <div>
        <div className="text-[11px] text-foreground font-semibold mb-2">
          AI พบ {candidates.length} เคสที่อาจซ้ำ — กรุณายืนยันว่าเป็นเหตุการณ์เดียวกันหรือไม่
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {candidates.map((cand) => {
            const c = cand.case._ref;
            const isChosen = chosen === c.id;
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-xl border-2 p-3 text-xs",
                  isChosen ? "border-success bg-success/5" : "border-border bg-card",
                  cand.withinAutoRadius && !isChosen && "border-brand/40 bg-brand/5",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-foreground">{c.id}</span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        cand.sameCategory ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                      )}>
                        {cand.sameCategory ? "หมวดเดียวกัน" : "หมวดต่าง"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ~{Math.round(cand.distance)} ม.
                      </span>
                    </div>
                    <div className="mt-1 text-foreground line-clamp-2">{c.title}</div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" />{c.mergedReports} ฉบับ</span>
                      <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{c.unit}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase text-muted-foreground">ความคล้าย</div>
                    <div className="text-base font-bold tabular-nums text-foreground">{cand.similarity}%</div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => onConfirmMerge(c.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-[11px] font-semibold text-success-foreground hover:opacity-90 transition"
                  >
                    <GitMerge className="h-3.5 w-3.5" /> ใช่ เหตุการณ์เดียวกัน
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onMarkNew}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition"
        >
          <PlusCircle className="h-3.5 w-3.5" /> ไม่ใช่ — เปิดเคสใหม่
        </button>
      </div>
    );
  }
  // priority/done
  return (
    <div className="text-xs">
      {chosen ? (
        <div className="rounded-lg bg-success/10 px-3 py-2 text-success inline-flex items-center gap-1.5 font-semibold">
          <GitMerge className="h-3.5 w-3.5" /> รวมเข้ากับ {chosen}
        </div>
      ) : (
        <div className="rounded-lg bg-info/10 px-3 py-2 text-info inline-flex items-center gap-1.5 font-semibold">
          <XCircle className="h-3.5 w-3.5" /> ไม่พบเคสซ้ำ — เปิดเคสใหม่
        </div>
      )}
    </div>
  );
}

function PriorityBars({
  risk,
  impacted,
  reporters,
  ageHours,
  imageSeverity,
  animate,
  final,
}: {
  risk: number;
  impacted: number;
  reporters: number;
  ageHours: number;
  imageSeverity: number;
  animate: boolean;
  final: number;
}) {
  const impactedNorm = Math.min(impacted, 200) / 2;
  const reportersNorm = Math.min(reporters, 20) * 5;
  const ageNorm = Math.min(ageHours, 48) * (100 / 48);
  const rows = [
    { label: "ความเสี่ยง", w: 0.4, raw: risk },
    { label: "ผู้ได้รับผลกระทบ", w: 0.25, raw: impactedNorm },
    { label: "จำนวนผู้แจ้ง", w: 0.15, raw: reportersNorm },
    { label: "ระยะเวลาค้าง", w: 0.1, raw: ageNorm },
    { label: "ภาพ/วิดีโอ", w: 0.1, raw: imageSeverity },
  ];
  const [progress, setProgress] = useState(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) return;
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(1, p + 0.06);
      setProgress(p);
      if (p >= 1) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [animate]);

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const contrib = r.raw * r.w * progress;
        return (
          <div key={r.label}>
            <div className="flex items-baseline justify-between text-[11px]">
              <span className="text-muted-foreground">
                {r.label} <span className="text-[10px] opacity-70">×{r.w}</span>
              </span>
              <span className="font-mono font-semibold text-foreground">{contrib.toFixed(1)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${(r.raw / 100) * 100 * progress}%` }} />
            </div>
          </div>
        );
      })}
      <div className="mt-3 flex items-end justify-between border-t border-border pt-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Priority</span>
        <span className="text-2xl font-extrabold tabular-nums text-foreground">{(final * progress).toFixed(1)}</span>
      </div>
    </div>
  );
}

// inline small haversine (avoid extra import noise)
function haversineApprox(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const r = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dp = toRad(lat2 - lat1);
  const dl = toRad(lng2 - lng1);
  const a =
    Math.sin(dp / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}
