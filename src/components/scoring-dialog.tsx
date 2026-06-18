import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Info, Sparkles } from "lucide-react";
import type { Case } from "@/lib/abjust-data";
import { CATEGORY_META, riskLevelOf, priorityScore } from "@/lib/ai-pipeline";

// Derive breakdown inputs from a case for display purposes.
function deriveInputs(c: Case) {
  const impactedFromLevel: Record<string, number> = {
    "สูงมาก": 80,
    "สูง": 40,
    "ปานกลาง": 15,
    "ต่ำ": 3,
  };
  const impactedCount = impactedFromLevel[c.riskLevel] ?? 10;
  const reporterCount = c.mergedReports;
  // Parse age very roughly from updatedAt label
  const ageHours = /ชั่วโมง/.test(c.updatedAt)
    ? parseInt(c.updatedAt) || 1
    : /วาน/.test(c.updatedAt)
      ? 24
      : 0.2;
  const imageSeverity = 55;
  return { impactedCount, reporterCount, ageHours, imageSeverity };
}

export function ScoringDialog({ c, trigger }: { c: Case; trigger?: React.ReactNode }) {
  const meta = CATEGORY_META[c.category] ?? CATEGORY_META["อื่น ๆ"];
  const inputs = deriveInputs(c);
  const risk = c.riskScore;
  const impacted = Math.min(inputs.impactedCount, 200) / 2;
  const reporters = Math.min(inputs.reporterCount, 20) * 5;
  const age = Math.min(inputs.ageHours, 48) * (100 / 48);
  const image = inputs.imageSeverity;
  const priority = priorityScore({
    risk,
    impactedCount: inputs.impactedCount,
    reporterCount: inputs.reporterCount,
    ageHours: inputs.ageHours,
    imageSeverity: image,
  });

  const rows = [
    { label: "ความเสี่ยง (Risk)", weight: 0.4, raw: risk, note: `Base severity หมวด "${c.category}" = ${meta.baseSeverity}` },
    { label: "ผู้ได้รับผลกระทบ", weight: 0.25, raw: impacted, note: `ประเมิน ${inputs.impactedCount} คน → normalize 0-100` },
    { label: "จำนวนผู้แจ้ง", weight: 0.15, raw: reporters, note: `${inputs.reporterCount} รายงานในจุดเดียวกัน` },
    { label: "ระยะเวลาค้าง", weight: 0.1, raw: age, note: `ค้างประมาณ ${inputs.ageHours.toFixed(1)} ชม. (เพดาน 48 ชม.)` },
    { label: "ความรุนแรงจากภาพ", weight: 0.1, raw: image, note: "Heuristic จากภาพ/วิดีโอ (จะแทนด้วย vision model)" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label="ดูที่มาของคะแนน AI"
            className="inline-flex items-center gap-1 rounded-md bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold text-info hover:bg-info/20 transition"
          >
            <Info className="h-3 w-3" /> ที่มาของคะแนน
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-info" /> AI คำนวณคะแนนความเสี่ยงอย่างไร
          </DialogTitle>
          <DialogDescription>
            เคส <span className="font-mono">{c.id}</span> · {c.category}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-muted/60 p-3 mb-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Priority Score</div>
              <div className="text-3xl font-extrabold text-foreground">{priority.toFixed(1)}<span className="text-sm font-semibold text-muted-foreground"> / 100</span></div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ระดับ</div>
              <div className="text-lg font-bold text-foreground">{riskLevelOf(priority)}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((r) => {
            const weighted = r.raw * r.weight;
            return (
              <div key={r.label} className="rounded-lg border border-border bg-card p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-semibold text-foreground">{r.label}</div>
                  <div className="text-muted-foreground">
                    น้ำหนัก <span className="font-bold text-foreground">{Math.round(r.weight * 100)}%</span>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(r.raw, 100)}%` }} />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10.5px] text-muted-foreground">
                  <span>{r.note}</span>
                  <span className="font-mono text-foreground">
                    {r.raw.toFixed(1)} × {r.weight} = <span className="font-bold">{weighted.toFixed(1)}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg bg-info/5 border border-info/20 px-3 py-2 text-[11px] text-foreground">
          <span className="font-semibold">สูตร:</span> Priority = Risk×0.4 + Impacted×0.25 + Reporters×0.15 + Age×0.10 + Image×0.10
          <div className="mt-1 text-muted-foreground">
            ตรรกะแบบ rule-based ทำงานออฟไลน์เต็มรูปแบบ — สามารถสลับเป็น LLM หรือ vision model ได้โดยไม่กระทบ UI
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
