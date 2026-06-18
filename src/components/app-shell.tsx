import { Link, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  BarChart3,
  Info,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useRole } from "@/lib/use-role";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/abjust-logo.jpg";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand/25 via-background to-success/25 ring-1 ring-border/60 shadow-sm overflow-hidden">
        <img src={logoUrl} alt="Abjust" className="h-9 w-9 object-contain" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight bg-gradient-to-r from-brand to-success bg-clip-text text-transparent">Abjust</div>
          <div className="text-[10.5px] font-medium text-muted-foreground -mt-0.5">
            Bangkok Traffic Risk Triage
          </div>
        </div>
      )}
    </Link>
  );
}

const citizenNav = [
  { to: "/report" as const, label: "แจ้งปัญหา", icon: FilePlus2 },
  { to: "/citizen/timeline" as const, label: "ติดตามเรื่องของฉัน", icon: ListChecks },
  { to: "/about" as const, label: "เกี่ยวกับ Prototype", icon: Info },
];

const officerNav = [
  { to: "/officer" as const, label: "Dashboard เคส", icon: LayoutDashboard },
  { to: "/officer/escalation" as const, label: "Escalation & Audit", icon: ShieldAlert },
  { to: "/analytics" as const, label: "ภาพรวม / Analytics", icon: BarChart3 },
  { to: "/about" as const, label: "เกี่ยวกับ Prototype", icon: Info },
];

export function AppShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const [role, setRole] = useRole();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = role === "officer" ? officerNav : citizenNav;
  const roleLabel = role === "officer" ? "เจ้าหน้าที่รัฐ" : role === "citizen" ? "ประชาชน" : "ยังไม่เลือกบทบาท";

  const switchRole = () => {
    setRole(null);
    router.navigate({ to: "/role" });
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] border-r border-sidebar-border bg-gradient-to-b from-[oklch(0.985_0.018_60)] via-sidebar to-[oklch(0.96_0.03_150/0.6)] backdrop-blur transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-sidebar-border">
          <Logo />
          <button className="lg:hidden text-muted-foreground" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 pt-5">
          <div className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            เมนู
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-4 left-3 right-3">
          <div className="rounded-2xl border border-sidebar-border bg-card p-4">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              บทบาทปัจจุบัน
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">{roleLabel}</div>
            <button
              onClick={switchRole}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              เปลี่ยนบทบาท
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          <button className="lg:hidden text-foreground" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            {title && <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>}
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 w-72">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="ค้นหา Case ID, ตำแหน่ง, ประเภท..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Link
            to={role === "officer" ? "/officer" : "/citizen/timeline"}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
            aria-label="การแจ้งเตือน"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand ring-2 ring-background" />
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 pl-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand to-success text-primary-foreground text-sm font-bold">
              {role === "officer" ? "อ" : "ป"}
            </div>
            <div className="text-xs leading-tight">
              <div className="font-semibold text-foreground">{roleLabel}</div>
              <div className="text-muted-foreground">เซสชันสาธิต</div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
