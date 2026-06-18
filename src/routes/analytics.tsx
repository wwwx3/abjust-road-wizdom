import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/badges";
import { ANALYTICS, MOCK_CASES } from "@/lib/abjust-data";
import { useAllEscalations } from "@/lib/cases-store";
import { ESCALATION_LADDER } from "@/lib/escalation";
import { Layers, FileText, FolderKanban, Flame, TrendingUp, MapPin, Building2, Crown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Abjust" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const a = ANALYTICS;
  const maxCat = Math.max(...a.topCategories.map((c) => c.count));
  const totalStatus = a.statusBreakdown.reduce((s, x) => s + x.count, 0);
  const esc = useAllEscalations();
  const execStats = {
    overdue: esc.filter((x) => x.state.overdue).length,
    highRiskUnassigned: esc.filter((x) => x.case.riskLevel === "สูงมาก" && x.case.status === "รับเรื่องแล้ว").length,
    avgAcceptHours: 4.2,
    escalated: esc.filter((x) => x.state.level >= 2).length,
    needExec: esc.filter((x) => x.state.level >= 4).length,
    resolvedPct: Math.round(
      (a.statusBreakdown.find((s) => s.status === "แก้ไขเสร็จสิ้น")!.count / totalStatus) * 100,
    ),
  };


  return (
    <AppShell
      title="ภาพรวมเมือง · Analytics"
      subtitle="ข้อมูลเชิงกลยุทธ์สำหรับผู้บริหารระดับเมือง"
    >
      <div className="space-y-5">
        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon={<FolderKanban className="h-5 w-5" />} tone="bg-primary/10 text-primary" label="จำนวนเคสทั้งหมด" value={a.totalCases.toLocaleString()} delta="+12% สัปดาห์นี้" />
          <Kpi icon={<FileText className="h-5 w-5" />} tone="bg-info/10 text-info" label="จำนวนรายงานทั้งหมด" value={a.totalReports.toLocaleString()} delta="+8% สัปดาห์นี้" />
          <Kpi icon={<Layers className="h-5 w-5" />} tone="bg-success/10 text-success" label="รายงานที่ถูกรวม" value={a.mergedReports.toLocaleString()} delta={`${Math.round((a.mergedReports / a.totalReports) * 100)}% ของทั้งหมด`} />
          <Kpi icon={<Flame className="h-5 w-5" />} tone="bg-danger/10 text-danger" label="เคสความเสี่ยงสูงสุด" value={String(a.topRiskCases.length)} delta="ต้องดำเนินการด่วน" />
        </div>

        {/* Executive Dashboard */}
        <Link
          to="/executive/priority-map"
          className="card-elevated block p-5 sm:p-6 bg-gradient-to-br from-background via-background to-brand/5 hover:ring-2 hover:ring-primary/30 transition"
        >
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/15 text-[oklch(0.42_0.13_60)]">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">ผู้บริหารเมือง</div>
                <div className="text-[11px] text-muted-foreground">เปิดแผนที่จุดเสี่ยงและปัญหาซ้ำของกรุงเทพฯ · Priority Map</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              เปิดแผนที่ผู้บริหารเมือง <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <ExecStat label="เคสค้างเกินกำหนด" value={execStats.overdue} tone="text-danger" />
            <ExecStat label="เคสความเสี่ยงสูงที่ยังไม่ถูกมอบหมาย" value={execStats.highRiskUnassigned} tone="text-danger" />
            <ExecStat label="เวลาเฉลี่ยในการรับเคส" value={`${execStats.avgAcceptHours} ชม.`} tone="text-info" />
            <ExecStat label="จำนวนเคสที่ต้อง Escalate" value={execStats.escalated} tone="text-[oklch(0.45_0.13_60)]" />
            <ExecStat label="เคสที่ต้องการการตัดสินใจจากระดับบริหาร" value={execStats.needExec} tone="text-[oklch(0.4_0.15_295)]" />
            <ExecStat label="สัดส่วนเคสที่แก้ไขแล้ว" value={`${execStats.resolvedPct}%`} tone="text-success" />
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            ระดับการส่งต่อสูงสุดที่ระบบรับรู้: L{Math.max(1, ...esc.map((x) => x.state.level))} · {ESCALATION_LADDER[Math.max(0, ...esc.map((x) => x.state.level - 1))].label}
          </div>
        </Link>



        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* Top categories */}
          <div className="card-elevated p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-sm font-bold text-foreground">หมวดปัญหาที่พบบ่อย</div>
                <div className="text-xs text-muted-foreground">เปรียบเทียบจำนวนเคสตามประเภท · 30 วันย้อนหลัง</div>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {a.topCategories.map((c, i) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="font-mono font-semibold text-muted-foreground">{c.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        i === 0 ? "bg-brand" : i === 1 ? "bg-info" : i === 2 ? "bg-danger" : i === 3 ? "bg-success" : "bg-primary/60",
                      )}
                      style={{ width: `${(c.count / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status donut-ish stack */}
          <div className="card-elevated p-5 sm:p-6">
            <div className="text-sm font-bold text-foreground mb-1">สถานะงานโดยรวม</div>
            <div className="text-xs text-muted-foreground mb-4">รวม {totalStatus.toLocaleString()} เคส</div>
            <div className="flex h-3 w-full overflow-hidden rounded-full mb-4">
              {a.statusBreakdown.map((s, i) => {
                const colors = ["bg-muted-foreground/60", "bg-info", "bg-[oklch(0.55_0.16_295)]", "bg-brand", "bg-success"];
                return <div key={s.status} className={colors[i]} style={{ width: `${(s.count / totalStatus) * 100}%` }} />;
              })}
            </div>
            <div className="space-y-2">
              {a.statusBreakdown.map((s, i) => {
                const colors = ["bg-muted-foreground/60", "bg-info", "bg-[oklch(0.55_0.16_295)]", "bg-brand", "bg-success"];
                return (
                  <div key={s.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn("h-2.5 w-2.5 rounded-sm shrink-0", colors[i])} />
                      <span className="text-foreground truncate">{s.status}</span>
                    </div>
                    <span className="font-mono font-semibold text-muted-foreground shrink-0">
                      {s.count} · {Math.round((s.count / totalStatus) * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Top risk cases */}
          <div className="card-elevated p-5 sm:p-6">
            <div className="text-sm font-bold text-foreground mb-3">เคสความเสี่ยงสูงสุด</div>
            <div className="space-y-2">
              {a.topRiskCases.map((c) => (
                <Link
                  key={c.id}
                  to="/officer/case/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-accent transition"
                >
                  <div className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white text-sm font-extrabold",
                    c.riskLevel === "สูงมาก" ? "bg-danger" : "bg-brand",
                  )}>
                    {c.riskScore}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono text-muted-foreground">{c.id}</div>
                    <div className="text-sm font-semibold text-foreground truncate">{c.title}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <RiskBadge level={c.riskLevel} />
                      <span className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground">
                        <Layers className="h-3 w-3" /> {c.mergedReports} รายงาน
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Hotspots + districts */}
          <div className="space-y-5">
            <div className="card-elevated p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                <MapPin className="h-4 w-4 text-danger" /> จุดปัญหาซ้ำ (Hotspots)
              </div>
              <div className="flex flex-wrap gap-2">
                {a.recurringHotspots.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1.5 rounded-full border border-danger/20 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger">
                    <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <div className="card-elevated p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                <Building2 className="h-4 w-4 text-primary" /> เขตที่มีรายงานสูง
              </div>
              <div className="space-y-2.5">
                {a.topDistricts.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-16 text-xs font-medium text-foreground">{d.name}</div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(d.count / a.topDistricts[0].count) * 100}%` }} />
                    </div>
                    <div className="w-10 text-right text-xs font-mono font-semibold text-muted-foreground">{d.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden">{MOCK_CASES.length}</div>
      </div>
    </AppShell>
  );
}

function Kpi({ icon, tone, label, value, delta }: { icon: React.ReactNode; tone: string; label: string; value: string; delta: string }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between">
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl", tone)}>{icon}</div>
      </div>
      <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{delta}</div>
    </div>
  );
}

function ExecStat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground leading-snug">{label}</div>
      <div className={cn("mt-1 text-2xl font-extrabold tabular-nums", tone)}>{value}</div>
    </div>
  );
}
