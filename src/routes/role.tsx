import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Logo } from "@/components/app-shell";
import { useRole } from "@/lib/use-role";
import { User, Building2, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/role")({
  head: () => ({ meta: [{ title: "เลือกบทบาท — Abjust" }] }),
  component: RolePage,
});

function RolePage() {
  const [, setRole] = useRole();
  const router = useRouter();

  const choose = (role: "citizen" | "officer") => {
    setRole(role);
    router.navigate({ to: role === "citizen" ? "/crisis-check" : "/officer" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Logo />
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            เริ่มต้นใช้งาน
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            คุณเข้าใช้งานในบทบาทใด?
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            เลือกบทบาทเพื่อเข้าสู่ส่วนการใช้งานที่เหมาะสม สามารถเปลี่ยนบทบาทได้ทุกเมื่อจากแถบด้านข้าง
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <RoleCard
            onClick={() => choose("citizen")}
            icon={<User className="h-6 w-6" />}
            iconTone="bg-success/10 text-success"
            title="ประชาชน"
            desc="แจ้งปัญหาจราจร และติดตามความคืบหน้าของเรื่องร้องเรียน"
            bullets={[
              "ส่งรายงานปัญหาแบบมีลำดับขั้นชัดเจน",
              "ดูสรุปและ Risk Score จาก AI",
              "ติดตามสถานะของเคสได้ตลอด",
            ]}
            accent="from-success/15 to-success/5"
          />
          <RoleCard
            onClick={() => choose("officer")}
            icon={<Building2 className="h-6 w-6" />}
            iconTone="bg-primary/10 text-primary"
            title="เจ้าหน้าที่รัฐ / หน่วยงาน"
            desc="ตรวจสอบเคส จัดลำดับความสำคัญ อัปเดตสถานะ และดูภาพรวมข้อมูล"
            bullets={[
              "Dashboard แบบ Kanban เห็นภาพรวมทันที",
              "จัดการเคสที่รวมจากรายงานซ้ำ",
              "Analytics ระดับเมือง สำหรับผู้บริหาร",
            ]}
            accent="from-brand/15 to-brand/5"
          />
        </div>
      </section>
    </div>
  );
}

function RoleCard({
  onClick,
  icon,
  iconTone,
  title,
  desc,
  bullets,
  accent,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  iconTone: string;
  title: string;
  desc: string;
  bullets: string[];
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left card-elevated overflow-hidden hover:soft-shadow hover:-translate-y-0.5 transition"
    >
      <div className={`bg-gradient-to-br ${accent} p-6`}>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${iconTone}`}>{icon}</div>
        <h2 className="mt-5 text-2xl font-bold text-foreground">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="p-6 pt-5">
        <ul className="space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                <Check className="h-3 w-3" />
              </span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
          เข้าสู่ระบบในฐานะ{title} <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}
