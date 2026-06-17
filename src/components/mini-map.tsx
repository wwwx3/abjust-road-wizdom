import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export function MiniMap({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative h-44 w-full overflow-hidden rounded-2xl border border-border",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, oklch(0.96 0.02 220), oklch(0.94 0.03 145))",
      }}
    >
      <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 400 200" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="oklch(0.85 0.02 220)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <path d="M 0 120 Q 100 100 200 130 T 400 110" stroke="oklch(0.7 0.05 220)" strokeWidth="6" fill="none" opacity="0.6" />
        <path d="M 60 0 L 80 200" stroke="oklch(0.75 0.04 220)" strokeWidth="4" fill="none" opacity="0.5" />
        <path d="M 280 0 L 260 200" stroke="oklch(0.75 0.04 220)" strokeWidth="4" fill="none" opacity="0.5" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute inset-0 -m-3 animate-ping rounded-full bg-danger/30" />
          <div className="relative grid h-10 w-10 place-items-center rounded-full bg-danger text-white shadow-lg">
            <MapPin className="h-5 w-5" />
          </div>
        </div>
      </div>
      {label && (
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-card/95 px-3 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          📍 {label}
        </div>
      )}
    </div>
  );
}
