import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Sparkles, CheckCircle2, AlertTriangle, Rocket, Calculator, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "เกี่ยวกับ Prototype — Abjust" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell title="เกี่ยวกับ Prototype" subtitle="ขอบเขต ข้อจำกัด และแผนพัฒนาต่อ">
      <div className="mx-auto max-w-4xl space-y-5">
        <Block icon={<Sparkles className="h-5 w-5" />} tone="bg-info/10 text-info" title="โปรเจกต์นี้คืออะไร">
          <p>
            <strong>Abjust</strong> คือ Traffic-Risk Intelligence Layer สำหรับการจัดการรายงานปัญหาจราจรในกรุงเทพฯ
            ที่ช่วยสรุปรายงาน จัดลำดับความเสี่ยง รวมรายงานซ้ำ สนับสนุนเวิร์กโฟลว์ของเจ้าหน้าที่
            และให้ประชาชนติดตามความคืบหน้าได้ชัดเจน
          </p>
        </Block>

        <Block icon={<Sparkles className="h-5 w-5" />} tone="bg-brand/15 text-[oklch(0.42_0.13_60)]" title="Escalation Ladder & Audit Trail">
          <p>
            Abjust ไม่ได้หยุดที่การแจ้งเตือน เพราะการแจ้งเตือนอาจถูกละเลยได้
            ระบบจึงใช้ <strong>Escalation Ladder</strong> และ <strong>Audit Trail</strong>
            เพื่อให้เคสที่ค้างเกินกำหนดถูกส่งต่อเป็นลำดับขั้นโดยอัตโนมัติ
            และทำให้เห็นว่าเคสติดอยู่ที่ขั้นตอนไหน ต้องการการตัดสินใจจากระดับใด
          </p>
          <p>
            ระบบนี้ไม่ได้ใช้แต้มลงโทษเจ้าหน้าที่ แต่ใช้ความโปร่งใสของกระบวนการ
            เพื่อป้องกันไม่ให้เคสหายไปหรือถูกโยนความรับผิดชอบโดยไม่มีผู้รับงานต่อ
          </p>
          <p className="text-muted-foreground text-[13px]">
            เทคโนโลยีไม่สามารถบังคับให้มนุษย์ลงมือทำได้โดยตรง
            แต่สามารถทำให้การเพิกเฉยไม่หายไปจากระบบ
            และทำให้ผู้บริหารเห็นจุดค้างของกระบวนการได้ชัดเจนขึ้น
          </p>
        </Block>

        <Block
          icon={<Calculator className="h-5 w-5" />}
          tone="bg-info/10 text-info"
          title="วิธีคำนวณ: Risk Score, Priority Score และ Impact Level"
        >
          <p>
            ทุกเคสจะถูกประเมินด้วยกฎ (rule-based) แบบ deterministic ที่อ่านได้และตรวจสอบย้อนกลับได้
            ไม่มีการใช้ black-box model ในชั้นนี้ เพื่อให้เจ้าหน้าที่และผู้บริหารเข้าใจที่มาของลำดับความสำคัญทุกเคส
          </p>

          {/* ---------------- Risk Score ---------------- */}
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="font-bold text-foreground">1) Risk Score (0–100) — ความเสี่ยงของเหตุการณ์</h3>
            <p>
              วัดว่า <em>เหตุการณ์นี้อันตรายแค่ไหนโดยธรรมชาติของมัน</em> โดยเริ่มจากค่าความรุนแรงพื้นฐานของหมวดหมู่
              (base severity) แล้วบวกตัวปรับ (modifiers) ตามบริบทเวลาและการเกิดซ้ำ
            </p>
            <pre className="overflow-x-auto rounded bg-background p-3 text-[12.5px] leading-relaxed">
{`risk = baseSeverity[category]
     + (isRushHour ? 10 : 0)              // 07:00–09:00 หรือ 16:00–19:00
     + clamp(impactedCount − 1, 0, 5) × 4 // เพิ่มตามจำนวนผู้กระทบ
     + min(recurrenceCount, 3) × 3        // เพิ่มตามการเกิดซ้ำ ณ จุดเดิม
risk = min(risk, 100)`}
            </pre>
            <div>
              <div className="font-semibold mt-2">ค่าความรุนแรงพื้นฐานของหมวดหมู่ (baseSeverity)</div>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li>กีดขวางทางรถฉุกเฉิน — <strong>95</strong></li>
                <li>ขับย้อนศร — <strong>85</strong></li>
                <li>สัญญาณไฟจราจรผิดปกติ — <strong>80</strong></li>
                <li>น้ำท่วมถนนกระทบการจราจร — <strong>78</strong></li>
                <li>จอดขวางช่องจราจร — <strong>75</strong></li>
                <li>ขับไหล่ทาง / สิ่งกีดขวางบนถนน — <strong>70</strong></li>
                <li>จอดบนทางเท้า — <strong>65</strong></li>
                <li>จอดรถผิดกฎหมาย — <strong>60</strong></li>
                <li>ทางเดินเท้าถูกกีดขวาง — <strong>50</strong></li>
                <li>ป้าย/เส้นจราจรไม่ชัดเจน — <strong>45</strong></li>
                <li>อื่น ๆ — <strong>40</strong></li>
              </ul>
            </div>
            <p className="text-muted-foreground text-[13px]">
              เพดานสูงสุดถูกตัดที่ 100 เพื่อให้ค่าเทียบกันได้ระหว่างหมวดหมู่
              และตัวคูณของ impacted/recurrence ถูก clamp ไว้เพื่อกันค่าผิดปกติ (outlier)
            </p>
          </div>

          {/* ---------------- Priority Score ---------------- */}
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="font-bold text-foreground">2) Priority Score (0–100) — ลำดับความสำคัญในการจัดคิว</h3>
            <p>
              Risk Score บอก “อันตรายแค่ไหน” แต่ Priority Score ตอบว่า{" "}
              <em>“ควรหยิบเคสไหนทำก่อน”</em> โดยรวมความเสี่ยงเข้ากับสัญญาณการดำเนินงาน
              (ผู้กระทบ, จำนวนผู้แจ้ง, เวลาที่เคสค้าง, สัญญาณจากภาพ)
            </p>
            <pre className="overflow-x-auto rounded bg-background p-3 text-[12.5px] leading-relaxed">
{`impactedN  = min(impactedCount, 200) / 2      // normalize เป็น 0–100
reportersN = min(reporterCount, 20) × 5       // normalize เป็น 0–100
ageN       = min(ageHours, 48) × (100 / 48)   // normalize เป็น 0–100
imageN     = imageSeverity ?? 30              // 0–100 (default 30)

priority = risk       × 0.40   // ความเสี่ยงของเหตุการณ์
         + impactedN  × 0.25   // จำนวนผู้ได้รับผลกระทบ
         + reportersN × 0.15   // จำนวนผู้แจ้งซ้ำ (สัญญาณยืนยัน)
         + ageN       × 0.10   // เวลาที่เคสค้างในระบบ
         + imageN     × 0.10   // ความรุนแรงที่อ่านจากภาพ`}
            </pre>
            <ul className="list-disc pl-5 space-y-0.5">
              <li><strong>40% Risk</strong> — น้ำหนักสูงสุด เพราะอันตรายของเหตุการณ์มาก่อน</li>
              <li><strong>25% Impacted</strong> — จำนวนคนที่ได้รับผลกระทบจริงในพื้นที่</li>
              <li><strong>15% Reporters</strong> — จำนวนผู้แจ้งหลายราย = หลักฐานยืนยันว่าเหตุยังเกิดอยู่</li>
              <li><strong>10% Age</strong> — ยิ่งค้างนานยิ่งดันขึ้นคิว (เพดาน 48 ชม. กันการครอบงำ)</li>
              <li><strong>10% Image</strong> — สำรองไว้สำหรับ vision model ในอนาคต (ตอนนี้ default 30)</li>
            </ul>
            <p className="text-muted-foreground text-[13px]">
              ผลรวมน้ำหนัก = 1.00 ดังนั้น Priority Score จะอยู่ในช่วง 0–100 เสมอ และเทียบข้ามเคสได้โดยตรง
            </p>
          </div>

          {/* ---------------- Impact / Risk Level ---------------- */}
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="font-bold text-foreground">3) Impact Level — ระดับความรุนแรงและ SLA</h3>
            <p>
              คะแนน (Risk หรือ Priority) จะถูก map เข้ากับ 4 ระดับ เพื่อกำหนดสี ป้าย และเป้าหมายเวลาในการดำเนินการ (SLA)
            </p>
            <pre className="overflow-x-auto rounded bg-background p-3 text-[12.5px] leading-relaxed">
{`score ≥ 80  → "สูงมาก" (Critical) → ภายใน 24 ชั่วโมง · เสี่ยงต่อชีวิต
score ≥ 60  → "สูง"     (High)     → ภายใน 3 วัน · กระทบคนหมู่มาก
score ≥ 40  → "ปานกลาง" (Medium)   → ภายใน 7 วัน · กระทบการใช้ชีวิต
score <  40 → "ต่ำ"     (Low)      → เพิ่มในคิว · ใช้งานได้แต่ไม่เรียบร้อย`}
            </pre>
            <p className="text-muted-foreground text-[13px]">
              เมื่อเคสค้างเกิน SLA ระบบจะส่งต่อขึ้นชั้นถัดไปอัตโนมัติผ่าน Escalation Ladder
              และทุกการเปลี่ยนสถานะถูกบันทึกใน Audit Trail
            </p>
          </div>

          {/* ---------------- Worked example ---------------- */}
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="font-bold text-foreground">ตัวอย่างการคำนวณจริง</h3>
            <p>
              เหตุ <strong>“จอดขวางช่องจราจร”</strong> เวลา 08:30 (rush hour), ผู้กระทบ 6 คน, เคยเกิดที่จุดนี้ 2 ครั้ง,
              มีผู้แจ้งซ้ำ 4 ราย, ค้างในระบบ 6 ชม., ไม่มีคะแนนจากภาพ
            </p>
            <pre className="overflow-x-auto rounded bg-background p-3 text-[12.5px] leading-relaxed">
{`risk = 75 + 10 + clamp(6−1,0,5)×4 + min(2,3)×3
     = 75 + 10 + 20 + 6 = 111 → clamp ที่ 100 → risk = 100  (สูงมาก)

impactedN  = min(6, 200) / 2          = 3
reportersN = min(4, 20) × 5           = 20
ageN       = min(6, 48) × (100/48)    ≈ 12.5
imageN     = 30 (default)

priority = 100×0.40 + 3×0.25 + 20×0.15 + 12.5×0.10 + 30×0.10
         = 40 + 0.75 + 3 + 1.25 + 3
         ≈ 48.0  →  ระดับ "ปานกลาง"`}
            </pre>
            <p className="text-muted-foreground text-[13px]">
              สังเกตว่า Risk = 100 แต่ Priority ≈ 48 — เพราะมีผู้กระทบจริงเพียง 6 คนและค้างเพียง 6 ชม.
              ระบบจึงยังไม่ดัน “ก่อน” เคสที่กระทบคนหมู่มากหรือค้างนานกว่า — นี่คือเหตุผลที่ต้องแยก
              สองคะแนนนี้ออกจากกัน
            </p>
          </div>
        </Block>



        <Block icon={<CheckCircle2 className="h-5 w-5" />} tone="bg-success/10 text-success" title="สิ่งที่ Prototype นี้ทำได้">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>เลือกบทบาท (ประชาชน / เจ้าหน้าที่รัฐ) แบบไม่ต้องล็อกอินจริง</li>
            <li>แจ้งปัญหาจราจร พร้อมตำแหน่งและหลักฐานจำลอง</li>
            <li>AI-assisted Summary และ Risk Score แบบ rule-based</li>
            <li>รวมรายงานซ้ำเข้าเป็นเคสเดียว พร้อมแสดง “จำนวนรายงานที่ถูกรวม”</li>
            <li>Kanban Dashboard ของเจ้าหน้าที่ จัดลำดับตาม Risk Score</li>
            <li>หน้ารายละเอียดเคส พร้อมเปลี่ยนสถานะและส่งการแจ้งเตือน</li>
            <li>Timeline สำหรับประชาชน + ตัวอย่างการแจ้งเตือนผ่าน LINE</li>
            <li>Analytics ระดับเมือง สำหรับผู้บริหาร</li>
          </ul>
        </Block>

        <Block icon={<AlertTriangle className="h-5 w-5" />} tone="bg-warning/10 text-[oklch(0.4_0.1_60)]" title="ข้อจำกัดของ Prototype">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>เป็น prototype ที่พัฒนาในเวลา 2 วันสำหรับงาน hackathon</li>
            <li>ใช้ข้อมูลจำลอง (mock data) และ rule-based AI fallback เท่านั้น</li>
            <li>ยังไม่ได้เชื่อมต่อกับระบบจริงของ BMA</li>
            <li>ไม่ได้แทนที่ระบบเดิม แต่เป็น intelligence layer เสริม</li>
            <li>ไม่มีระบบยืนยันตัวตน, ไม่มีการประมวลผลภาพจริง, ไม่มีการเบลอใบหน้าอัตโนมัติ</li>
          </ul>
        </Block>

        <Block icon={<Rocket className="h-5 w-5" />} tone="bg-brand/15 text-[oklch(0.42_0.13_60)]" title="แนวทางพัฒนาต่อ">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>ระบบยืนยันตัวตนจริง สำหรับประชาชนและเจ้าหน้าที่</li>
            <li>เชื่อมต่อ LLM สำหรับ AI summary คุณภาพสูง</li>
            <li>Computer vision สำหรับวิเคราะห์รูปภาพและจัดหมวดอัตโนมัติ</li>
            <li>Privacy blur ใบหน้าและป้ายทะเบียนอัตโนมัติ</li>
            <li>เชื่อมต่อ LINE OA สำหรับการแจ้งเตือนถึงประชาชน</li>
            <li>Geospatial clustering สำหรับรวมรายงานซ้ำแบบแม่นยำ</li>
            <li>เชื่อมต่อระบบของเมืองและหน่วยงานที่เกี่ยวข้อง</li>
          </ul>
        </Block>

        <div className="rounded-xl bg-muted/60 p-4 text-xs text-muted-foreground text-center">
          Abjust — Bangkok Hackathon Prototype · 2026
        </div>
      </div>
    </AppShell>
  );
}

function Block({ icon, tone, title, children }: { icon: React.ReactNode; tone: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-foreground space-y-2">{children}</div>
    </div>
  );
}
