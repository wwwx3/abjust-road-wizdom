import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/badges";
import { casesStore, useAllEscalations, useEscalation, useCase } from "@/lib/cases-store";
import {
  ESCALATION_LADDER,
  timeRemainingLabel,
  nextActionByLevel,
  autoNextIfIgnored,
} from "@/lib/escalation";
import { DEMO_ESCALATION_CASE_ID } from "@/lib/abjust-data";
import { useRole } from "@/lib/use-role";
import { EscalationLadder, AuditTrail } from "@/components/escalation-ladder";
import {
  AlertTriangle,
  Flame,
  Users,
  ShieldAlert,
  Crown,
  Repeat,
  Eye,
  PlayCircle,
  ArrowRight,
  Clock,
  RotateCcw,
  Workflow,
  Info,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/officer/escalation")({
  head: () => ({ meta: [{ title: "Escalation & Audit — Abjust" }] }),
  component: EscalationPage,
});

function EscalationPage() {
  const items = useAllEscalations();
  const [, setRole] = useRole();
  const [flash, setFlash] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const demoCase = useCase(DEMO_ESCALATION_CASE_ID);
  const demoState = useEscalation(DEMO_ESCALATION_CASE_ID);

  const overdue = items.filter(
    (x) => x.state.overdue || x.state.deadlineAt - Date.now() <= 0,
  );
  const noOwnerHighRisk = items.filter(
    (x) => x.case.riskLevel === "สูงมาก" && !x.state.accepted,
  );
  const atCoordinator = items.filter((x) => x.state.level === 2);
  const multiTransfer = items.filter((x) => x.state.transferCount >= 1);
  const atSupervisor = items.filter((x) => x.state.level >= 3);
  const atExecutive = items.filter((x) => x.state.level >= 4);

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 2400);
  };

  const runDemo = async () => {
    if (running) return;
    setRole("officer"); // ensure role is officer so officer actions work after demo
    setRunning(true);
    await casesStore.runDemoSequence(DEMO_ESCALATION_CASE_ID, (label) =>
      showFlash(label),
    );
    setRunning(false);
  };

  const resetDemo = () => {
    casesStore.resetDemo(DEMO_ESCALATION_CASE_ID);
    showFlash("รีเซ็ตเคสตัวอย่างกลับสู่สถานะเริ่มต้น");
  };

  const acceptDemo = () => {
    casesStore.acceptCase(DEMO_ESCALATION_CASE_ID, "หน่วยบังคับใช้กฎหมายจราจร");
    showFlash("หน่วยงานหลักรับเคสแล้ว");
  };

  return (
    <AppShell
      title="Escalation & Audit"
      subtitle="ลำดับการส่งต่อและบันทึกความรับผิดชอบ — workflow visibility, ไม่ใช่การลงโทษ"
    >
      <div className="space-y-5">
        {/* Dedicated demo card */}
        <DemoSimulatorCard
          running={running}
          onRun={runDemo}
          onReset={resetDemo}
        />

        {/* Live demo state — shows the simulator's effect on THIS page */}
        {demoCase && demoState && (
          <section>
            <SectionHeader
              title="สถานะเคสตัวอย่างแบบเรียลไทม์"
              subtitle={`${demoCase.id} · ${demoCase.title}`}
              right={
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                  <Radio className="h-3 w-3 animate-pulse" /> Live
                </span>
              }
            />
            <div className="grid lg:grid-cols-2 gap-3">
              <div className="card-elevated p-4 sm:p-5">
                <EscalationLadder state={demoState} />
                <div className="mt-3 flex flex-wrap gap-2">
                  {!demoState.accepted && demoState.level >= 1 && (
                    <button
                      onClick={acceptDemo}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-success px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                    >
                      ✓ รับเคสเป็นหน่วยงานหลัก
                    </button>
                  )}
                  <Link
                    to="/officer/case/$id"
                    params={{ id: DEMO_ESCALATION_CASE_ID }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition"
                  >
                    เปิดมุมเจ้าหน้าที่ <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <div className="card-elevated p-4 sm:p-5">
                <AuditTrail state={demoState} />
              </div>
            </div>
          </section>
        )}

        {flash && (
          <div className="rounded-xl bg-success/10 border border-success/30 px-3 py-2 text-xs font-semibold text-success">
            ✓ {flash}
          </div>
        )}

        {/* Executive summary */}

        <section>
          <SectionHeader
            title="Executive summary — สุขภาพของกระบวนการ"
            subtitle="ตัวเลขเชิงระบบเพื่อหาจุดค้าง ไม่ใช่คะแนนเจ้าหน้าที่"
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Kpi
              icon={<Clock className="h-4 w-4" />}
              tone="bg-danger/10 text-danger"
              label="เคสค้างเกินกำหนด"
              value={overdue.length}
            />
            <Kpi
              icon={<Flame className="h-4 w-4" />}
              tone="bg-danger/10 text-danger"
              label="ความเสี่ยงสูงที่ยังไม่มีหน่วยงานหลักรับเคส"
              value={noOwnerHighRisk.length}
            />
            <Kpi
              icon={<Users className="h-4 w-4" />}
              tone="bg-info/10 text-info"
              label="ต้องการการประสานงานจากผู้ประสานงานกลาง"
              value={atCoordinator.length}
            />
            <Kpi
              icon={<Repeat className="h-4 w-4" />}
              tone="bg-warning/10 text-[oklch(0.45_0.13_60)]"
              label="ถูกส่งต่อระหว่างหน่วยงานหลายครั้ง"
              value={multiTransfer.length}
            />
            <Kpi
              icon={<ShieldAlert className="h-4 w-4" />}
              tone="bg-[oklch(0.95_0.05_295)] text-[oklch(0.4_0.15_295)]"
              label="ต้องเห็นโดยหัวหน้าหน่วยงาน"
              value={atSupervisor.length}
            />
            <Kpi
              icon={<Crown className="h-4 w-4" />}
              tone="bg-brand/15 text-[oklch(0.42_0.13_60)]"
              label="อยู่ใน Dashboard ผู้บริหารเมือง"
              value={atExecutive.length}
            />
          </div>
        </section>

        {/* Backlog */}
        <section>
          <SectionHeader
            title="เคสค้างเกินกำหนด"
            subtitle="แสดงให้เห็นว่าเคสค้างที่ขั้นใด นานเท่าใด ใครต้องทำต่อ และถ้าไม่มีใครทำ ระบบจะส่งต่อไปที่ไหน"
            right={
              <span className="text-xs text-muted-foreground">
                {overdue.length} เคส
              </span>
            }
          />
          {overdue.length === 0 ? (
            <div className="card-elevated p-10 text-center text-xs text-muted-foreground">
              ไม่มีเคสที่ค้างเกินกำหนดในขณะนี้
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {overdue
                .sort((a, b) => a.state.deadlineAt - b.state.deadlineAt)
                .map(({ case: c, state }) => (
                  <BacklogCard
                    key={c.id}
                    caseId={c.id}
                    title={c.title}
                    category={c.category}
                    riskLevel={c.riskLevel}
                    riskScore={c.riskScore}
                    levelLabel={`L${state.level} · ${ESCALATION_LADDER[state.level - 1].label}`}
                    owner={state.currentOwner}
                    overdueLabel={timeRemainingLabel(
                      state.deadlineAt - Date.now(),
                    )}
                    nextAction={nextActionByLevel(state)}
                    autoNext={autoNextIfIgnored(state)}
                    transfers={state.transferCount}
                  />
                ))}
            </div>
          )}
        </section>

        {/* Goal explainer */}
        <div className="card-elevated p-5 sm:p-6 bg-gradient-to-br from-background to-muted/40">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-warning/10 text-[oklch(0.45_0.13_60)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="text-[12.5px] leading-relaxed text-foreground">
              <div className="font-semibold mb-1">เป้าหมายของระบบนี้</div>
              เทคโนโลยีไม่สามารถบังคับให้มนุษย์ลงมือทำได้โดยตรง
              แต่สามารถทำให้การเพิกเฉยไม่หายไปจากระบบ
              และทำให้ผู้บริหารเห็นจุดค้างของกระบวนการได้ชัดเจนขึ้น —
              โดยไม่ใช้ระบบแต้ม ไม่จัดอันดับเจ้าหน้าที่ และไม่เน้นการลงโทษ
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function DemoSimulatorCard({
  running,
  onRun,
  onReset,
}: {
  running: boolean;
  onRun: () => void;
  onReset: () => void;
}) {

  return (
    <div className="card-elevated p-5 sm:p-6 bg-gradient-to-br from-[oklch(0.98_0.03_60)] to-[oklch(0.97_0.04_150)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-[oklch(0.42_0.13_60)]">
            <PlayCircle className="h-3 w-3" /> Demo scenario
          </div>
          <h3 className="mt-1.5 text-lg font-extrabold text-foreground">
            จำลองเคสค้างและการส่งต่ออัตโนมัติ
          </h3>
          <div className="mt-1 text-xs text-muted-foreground font-mono">
            {DEMO_ESCALATION_CASE_ID} ·
            รถจอดกีดขวางทางเข้ารถพยาบาลใกล้โรงพยาบาลจุฬาลงกรณ์
          </div>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-foreground">
            Demo นี้แสดงให้เห็นว่า Road Wizdom ไม่ได้หยุดแค่การแจ้งเตือน
            แต่ทำให้เคสที่ไม่มีผู้รับผิดชอบถูกส่งต่อเป็นลำดับขั้นโดยอัตโนมัติ
            พร้อมบันทึก Audit Trail
            เพื่อให้การค้างงานไม่หายไปจากระบบ โดยไม่ใช้ระบบแต้ม
            ไม่จัดอันดับเจ้าหน้าที่ และไม่เน้นการลงโทษ
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={onRun}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PlayCircle className="h-4 w-4" />
            {running ? "กำลังจำลอง…" : "เริ่มจำลองสถานการณ์"}
          </button>
          <button
            onClick={onReset}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" /> รีเซ็ตเคส
          </button>
          <Link
            to="/officer/case/$id"
            params={{ id: DEMO_ESCALATION_CASE_ID }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline justify-end"
          >
            เปิดมุมเจ้าหน้าที่ <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <DemoStep n={1} label="รอหน่วยงานรับเคส" />
        <DemoStep n={2} label="ค้างเกินกำหนด (6 ชม.)" tone="warning" />
        <DemoStep
          n={3}
          label="ส่งต่อผู้ประสานงานกลางอัตโนมัติ"
          tone="info"
        />
        <DemoStep n={4} label="ต้องเห็นโดยหัวหน้าหน่วยงาน" tone="info" />
        <DemoStep n={5} label="อยู่ใน Dashboard ผู้บริหารเมือง" tone="danger" />
        <DemoStep
          n={6}
          label="เจ้าหน้าที่กด 'รับเคส' ในมุมเจ้าหน้าที่"
          tone="success"
        />
      </div>
    </div>
  );
}

function DemoStep({
  n,
  label,
  tone = "muted",
}: {
  n: number;
  label: string;
  tone?: "muted" | "warning" | "info" | "danger" | "success";
}) {
  const map = {
    muted: "bg-muted text-muted-foreground",
    warning: "bg-warning/15 text-[oklch(0.42_0.13_60)]",
    info: "bg-info/10 text-info",
    danger: "bg-danger/10 text-danger",
    success: "bg-success/10 text-success",
  } as const;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2">
      <span
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
          map[tone],
        )}
      >
        {n}
      </span>
      <span className="text-[12px] text-foreground leading-snug">{label}</span>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <div className="text-sm font-bold text-foreground">{title}</div>
        {subtitle && (
          <div className="text-[11.5px] text-muted-foreground">{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}

function BacklogCard(props: {
  caseId: string;
  title: string;
  category: string;
  riskLevel: "สูงมาก" | "สูง" | "ปานกลาง" | "ต่ำ";
  riskScore: number;
  levelLabel: string;
  owner: string;
  overdueLabel: string;
  nextAction: string;
  autoNext: string;
  transfers: number;
}) {
  return (
    <div
      className={cn(
        "card-elevated p-4 sm:p-5",
        props.riskLevel === "สูงมาก" && "ring-1 ring-danger/30",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-[11px] font-mono text-muted-foreground">
            {props.caseId}
          </div>
          <div className="text-sm font-bold text-foreground line-clamp-2">
            {props.title}
          </div>
        </div>
        <RiskBadge level={props.riskLevel} score={props.riskScore} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="inline-flex items-center rounded-md bg-primary/8 px-1.5 py-0.5 text-[10.5px] font-semibold text-primary">
          #{props.category}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-info/10 px-2 py-0.5 text-[10.5px] font-semibold text-info">
          {props.levelLabel}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-danger/10 px-2 py-0.5 text-[10.5px] font-semibold text-danger">
          <Clock className="h-3 w-3" /> {props.overdueLabel}
        </span>
        {props.transfers > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-2 py-0.5 text-[10.5px] font-semibold text-[oklch(0.42_0.13_60)]">
            <Repeat className="h-3 w-3" /> ส่งต่อแล้ว {props.transfers}x
          </span>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-2 text-[12px]">
        <KV
          icon={<Users className="h-3.5 w-3.5" />}
          k="ผู้รับผิดชอบขั้นถัดไป"
          v={props.owner}
        />
        <KV
          icon={<Info className="h-3.5 w-3.5" />}
          k="ขั้นถัดไปต้องทำ"
          v={props.nextAction}
        />
        <KV
          icon={<Workflow className="h-3.5 w-3.5" />}
          k="ถ้าไม่มีใครทำ"
          v={props.autoNext}
          tone="warning"
        />
      </dl>

      <div className="mt-3 flex justify-end">
        <Link
          to="/officer/case/$id"
          params={{ id: props.caseId }}
          className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-[12px]"
        >
          ดูรายละเอียดและจัดการ <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function KV({
  icon,
  k,
  v,
  tone,
}: {
  icon: React.ReactNode;
  k: string;
  v: string;
  tone?: "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2.5 py-1.5",
        tone === "warning"
          ? "border-warning/30 bg-warning/5"
          : "border-border bg-muted/30",
      )}
    >
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {k}
      </div>
      <div className="mt-0.5 text-[12.5px] text-foreground leading-snug">
        {v}
      </div>
    </div>
  );
}

function Kpi({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode;
  tone: string;
  label: string;
  value: number;
}) {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between">
        <div className={cn("grid h-8 w-8 place-items-center rounded-lg", tone)}>
          {icon}
        </div>
        <div className="text-2xl font-extrabold text-foreground tabular-nums">
          {value}
        </div>
      </div>
      <div className="mt-2 text-[11.5px] font-semibold text-muted-foreground leading-snug">
        {label}
      </div>
    </div>
  );
}
