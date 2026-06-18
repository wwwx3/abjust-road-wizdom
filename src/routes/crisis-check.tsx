import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { Logo } from "@/components/app-shell";
import { AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft, Lock, Waves, Activity, Flame, Wind } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/crisis-check")({
  head: () => ({ meta: [{ title: "ตรวจสอบสถานการณ์ฉุกเฉิน — Abjust" }] }),
  component: CrisisCheckPage,
});

function CrisisCheckPage() {
  const router = useRouter();
  const [showCrisis, setShowCrisis] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Link to="/role" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> เปลี่ยนบทบาท
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 lg:py-16">
        {!showCrisis ? (
          <>
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                ตรวจสอบก่อนเริ่มแจ้งเหตุ
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                ขณะนี้คุณอยู่ในสถานการณ์ฉุกเฉินทางสิ่งแวดล้อมหรือไม่?
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                เช่น น้ำท่วม แผ่นดินไหว ไฟไหม้ พายุ หรือภัยพิบัติอื่น ๆ
                ระบบจะปรับลำดับความสำคัญและช่องทางการตอบสนองให้เหมาะสม
              </p>
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-5">
              <button
                onClick={() => setShowCrisis(true)}
                className="group text-left card-elevated overflow-hidden hover:soft-shadow hover:-translate-y-0.5 transition"
              >
                <div className="bg-gradient-to-br from-destructive/15 to-destructive/5 p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-foreground">ใช่ — มีภัยพิบัติ</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    น้ำท่วม / แผ่นดินไหว / ไฟไหม้ / พายุ หรือเหตุฉุกเฉินอื่น
                  </p>
                </div>
                <div className="p-6 pt-5">
                  <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <Tag icon={<Waves className="h-3.5 w-3.5" />} label="น้ำท่วม" />
                    <Tag icon={<Activity className="h-3.5 w-3.5" />} label="แผ่นดินไหว" />
                    <Tag icon={<Flame className="h-3.5 w-3.5" />} label="ไฟไหม้" />
                    <Tag icon={<Wind className="h-3.5 w-3.5" />} label="พายุ" />
                  </div>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-destructive group-hover:gap-2.5 transition-all">
                    เข้าสู่โหมดภัยพิบัติ <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.navigate({ to: "/report" })}
                className="group text-left card-elevated overflow-hidden hover:soft-shadow hover:-translate-y-0.5 transition"
              >
                <div className="bg-gradient-to-br from-success/15 to-success/5 p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-foreground">ไม่มี — สถานการณ์ปกติ</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    แจ้งปัญหาจราจรหรือปัญหาเมืองตามปกติ
                  </p>
                </div>
                <div className="p-6 pt-5">
                  <ul className="space-y-2 text-sm text-foreground">
                    <li>• ส่งรายงานพร้อม AI Risk Score</li>
                    <li>• ติดตามสถานะของเคส</li>
                  </ul>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-success group-hover:gap-2.5 transition-all">
                    ไปยังหน้าแจ้งปัญหา <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            </div>
          </>
        ) : (
          <CrisisClosed onBack={() => setShowCrisis(false)} />
        )}
      </section>
    </div>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-2">
      <span className="text-destructive">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function CrisisClosed({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card-elevated overflow-hidden">
        <div className="bg-gradient-to-br from-destructive/15 to-warning/10 p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold text-foreground">
            โหมดภัยพิบัติ — ปิดให้บริการชั่วคราว
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            ฟีเจอร์การตอบสนองตามระดับวิกฤต (Crisis Level Response)
            อยู่ระหว่างการพัฒนาเชิงนโยบายร่วมกับหน่วยงานภัยพิบัติ
            ขณะนี้ยังไม่เปิดให้บริการ
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground mb-2">สิ่งที่กำลังพัฒนา</div>
            <ul className="space-y-1.5">
              <li>• การจัดระดับวิกฤต (Crisis Level 1–5) ตามมาตรฐานสากล</li>
              <li>• เส้นทางส่งต่อไปยังศูนย์บัญชาการเหตุการณ์ (ICS)</li>
              <li>• การรวมข้อมูลกับ ปภ. / กรมอุตุฯ / กรุงเทพมหานคร</li>
              <li>• แผนที่ความเสี่ยงและจุดอพยพแบบเรียลไทม์</li>
            </ul>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
            <div className="font-semibold mb-1">หากเป็นเหตุฉุกเฉินเร่งด่วน</div>
            โทร <span className="font-bold">191</span> (ตำรวจ) ·{" "}
            <span className="font-bold">199</span> (ดับเพลิง) ·{" "}
            <span className="font-bold">1669</span> (การแพทย์ฉุกเฉิน) ·{" "}
            <span className="font-bold">1784</span> (ปภ.)
          </div>
          <button
            onClick={onBack}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition"
          >
            <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );
}
