import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/app-shell";
import {
  Sparkles,
  Gauge,
  Layers,
  History,
  ArrowRight,
  ShieldCheck,
  MapPin,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Abjust — Bangkok Traffic Risk Triage" },
      { name: "description", content: "Traffic-Risk Intelligence Layer สำหรับจัดลำดับ สรุป และติดตามรายงานปัญหาจราจรในกรุงเทพฯ" },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Sparkles,
    title: "AI-assisted Summary",
    desc: "สรุปรายงานหลายฉบับให้เหลือใจความสำคัญ เจ้าหน้าที่ตัดสินใจได้เร็วขึ้น",
    tone: "bg-info/10 text-info",
  },
  {
    icon: Gauge,
    title: "Risk Scoring",
    desc: "ประเมินความเสี่ยงแบบ rule-based ให้แต่ละเคสมี Risk Score 0–100",
    tone: "bg-brand/15 text-[oklch(0.42_0.13_60)]",
  },
  {
    icon: Layers,
    title: "Duplicate Grouping",
    desc: "รวมรายงานซ้ำในจุดเดียวกันให้เป็นเคสเดียว ลดงานซ้ำของหน่วยงาน",
    tone: "bg-success/10 text-success",
  },
  {
    icon: History,
    title: "Timeline Tracking",
    desc: "ประชาชนติดตามได้ว่าเรื่องของตนอยู่ในขั้นตอนไหน โปร่งใส ไม่หายไป",
    tone: "bg-[oklch(0.95_0.06_295)] text-[oklch(0.4_0.15_295)]",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition">เกี่ยวกับ</Link>
            <Link to="/officer" className="hover:text-foreground transition">ตัวอย่าง Dashboard</Link>
            <Link to="/analytics" className="hover:text-foreground transition">Analytics</Link>
            <Link to="/public" className="hover:text-foreground transition">ภาพรวมสาธารณะ</Link>
          </nav>
          <Link
            to="/role"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            เลือกบทบาท <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
          <div className="absolute top-40 right-0 h-[420px] w-[600px] rounded-full bg-success/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Civic-tech prototype · Bangkok Hackathon
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-foreground leading-[1.1]">
                จากรายงานของประชาชน
                <br />
                <span className="bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">สู่การจัดการปัญหาจราจร</span>
                <br />
                ที่ไม่หายไปจากระบบ
              </h1>
              <p className="mt-5 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                Abjust คือ <span className="font-semibold text-foreground">Traffic-Risk Intelligence Layer</span> ที่ช่วยสรุป จัดลำดับความเสี่ยง รวมรายงานซ้ำ และติดตามความคืบหน้าของปัญหาจราจรในกรุงเทพฯ
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/report" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition">
                  เริ่มแจ้งปัญหา <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/role" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent transition">
                  เลือกบทบาท
                </Link>
                <Link to="/officer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent transition">
                  ดู Dashboard ตัวอย่าง
                </Link>
              </div>

              <div className="mt-6 inline-flex items-start gap-2 rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Prototype นี้ใช้ข้อมูลจำลองและ rule-based AI fallback สำหรับการสาธิต</span>
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Abjust</span> คือ Risk Intelligence Layer สำหรับรายงานปัญหาจราจรในกรุงเทพฯ
              </div>
            </div>

            {/* Mock dashboard preview */}
            <div className="relative">
              <div className="card-elevated p-5 sm:p-6 rotate-[0.5deg]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">เคสด่วนวันนี้</div>
                    <div className="text-2xl font-bold text-foreground">18 เคส</div>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-danger/10 text-danger">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { id: "ABJ-2410-0871", title: "รถจอดขวางทางเข้ารถพยาบาล รพ.จุฬาฯ", level: "สูงมาก", score: 92, tone: "bg-danger" },
                    { id: "ABJ-2410-0865", title: "ไฟแดงค้าง แยกอโศก-สุขุมวิท", level: "สูงมาก", score: 88, tone: "bg-danger" },
                    { id: "ABJ-2410-0859", title: "น้ำท่วมขังถนนสุขุมวิท 71", level: "สูง", score: 81, tone: "bg-brand" },
                  ].map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${c.tone} text-white text-sm font-bold`}>
                        {c.score}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-mono text-muted-foreground">{c.id}</div>
                        <div className="truncate text-sm font-semibold text-foreground">{c.title}</div>
                      </div>
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-success/10 px-4 py-3">
                  <div className="text-sm">
                    <div className="font-semibold text-success">รวมรายงานซ้ำแล้ว 1,175 ฉบับ</div>
                    <div className="text-xs text-success/80">ลดงานซ้ำของเจ้าหน้าที่ ~79%</div>
                  </div>
                  <Sparkles className="h-5 w-5 text-success" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden sm:block card-elevated px-4 py-3 rotate-[-2deg]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="font-medium text-foreground">AI กำลังประมวลผลรายงานใหม่ 3 ฉบับ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card-elevated p-5">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${f.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© 2026 Abjust · Bangkok Hackathon Prototype</div>
          <div>Abjust = Risk Intelligence Layer สำหรับรายงานปัญหาจราจรในกรุงเทพฯ</div>
        </div>
      </footer>
    </div>
  );
}
