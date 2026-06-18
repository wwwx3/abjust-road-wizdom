import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/app-shell";
import { ANALYTICS } from "@/lib/abjust-data";
import { useAllEscalations } from "@/lib/cases-store";
import { ShieldCheck, BarChart3, Clock, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/public")({
  head: () => ({
    meta: [
      { title: "ภาพรวมสาธารณะ — Abjust" },
      { name: "description", content: "ภาพรวมการดำเนินการเคสปัญหาจราจรในกรุงเทพฯ แบบไม่เปิดเผยข้อมูลส่วนบุคคล" },
    ],
  }),
  component: PublicPage,
});

function PublicPage() {
  const items = useAllEscalations();
  const received = items.length + 280; // aggregate with mock baseline
  const inProgress = items.filter((x) => x.case.status === "กำลังดำเนินการ" || x.case.status === "มอบหมายหน่วยงานแล้ว").length + 64;
  const done = items.filter((x) => x.case.status === "แก้ไขเสร็จสิ้น").length + 37;
  const overdue = items.filter((x) => x.state.overdue).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> กลับหน้าแรก
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Public Aggregate Transparency
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            ภาพรวมสาธารณะ
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            ตัวเลขรวมการรับและดำเนินการเคสจราจรในกรุงเทพฯ
            แสดงเป็นภาพรวมเพื่อความโปร่งใส โดยไม่เปิดเผยข้อมูลส่วนบุคคล
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <PubKpi icon={<BarChart3 className="h-5 w-5" />} tone="bg-info/10 text-info" label="รับเรื่องแล้ว" value={received} />
          <PubKpi icon={<Clock className="h-5 w-5" />} tone="bg-brand/15 text-[oklch(0.42_0.13_60)]" label="กำลังดำเนินการ" value={inProgress} />
          <PubKpi icon={<CheckCircle2 className="h-5 w-5" />} tone="bg-success/10 text-success" label="แก้ไขเสร็จสิ้น" value={done} />
          <PubKpi icon={<AlertTriangle className="h-5 w-5" />} tone="bg-danger/10 text-danger" label="เคสค้างเกินกำหนด" value={overdue} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card-elevated p-5 sm:p-6">
            <div className="text-sm font-bold text-foreground mb-3">หมวดปัญหาที่พบบ่อย</div>
            <ul className="space-y-2">
              {ANALYTICS.topCategories.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{c.name}</span>
                  <span className="font-mono text-muted-foreground">{c.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-elevated p-5 sm:p-6">
            <div className="text-sm font-bold text-foreground mb-3">เขตที่มีรายงานสูง</div>
            <ul className="space-y-2">
              {ANALYTICS.topDistricts.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{d.name}</span>
                  <span className="font-mono text-muted-foreground">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-elevated p-5 sm:p-6">
          <div className="text-sm font-bold text-foreground mb-2">เวลาเฉลี่ยในการอัปเดตสถานะ</div>
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <div className="text-3xl font-extrabold text-foreground">~ 4.2 ชม.</div>
              <div className="text-xs text-muted-foreground">ตั้งแต่รับเรื่องจนถึงอัปเดตครั้งแรก</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-foreground">~ 1.6 วัน</div>
              <div className="text-xs text-muted-foreground">เวลาเฉลี่ยถึงการแก้ไขเสร็จสิ้น</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed">
          ข้อมูลสาธารณะควรแสดงเฉพาะภาพรวม
          ไม่เปิดเผยข้อมูลส่วนบุคคลหรือรายละเอียดที่อาจระบุตัวบุคคลได้ —
          จึงไม่มีการแสดงชื่อเจ้าหน้าที่ ชื่อผู้รายงาน เบอร์โทรศัพท์
          ป้ายทะเบียน ใบหน้า หรือรายละเอียดความขัดแย้งภายใน
        </div>
      </main>
    </div>
  );
}

function PubKpi({ icon, tone, label, value }: { icon: React.ReactNode; tone: string; label: string; value: number }) {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>{icon}</div>
        <div className="text-3xl font-extrabold text-foreground tabular-nums">{value.toLocaleString()}</div>
      </div>
      <div className="mt-2 text-xs font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}
