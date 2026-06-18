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

        <Block
          icon={<RefreshCw className="h-5 w-5" />}
          tone="bg-warning/10 text-[oklch(0.4_0.1_60)]"
          title="การติดตามปัญหาซ้ำ: พื้นที่เสี่ยง &amp; พื้นที่ควรติดตามเชิงนโยบาย"
        >
          <p>
            เมื่อเคสปิดไปแล้ว ระบบไม่ได้ลืมมัน แต่เก็บข้อมูลไว้เพื่อตรวจสอบว่า{" "}
            <em>ปัญหาเดิมกลับมาอีกหรือไม่</em>{" "}
            การเกิดซ้ำที่จุดเดิมเป็นสัญญาณสำคัญว่าแก้ไขยังไม่ถึงต้นตอ หรือมีช่องโหว่ในนโยบาย
            ระบบจึงแบ่งพื้นที่ออกเป็น 2 ประเภทตามลักษณะการเกิดซ้ำ
          </p>

          {/* Recurrence detection */}
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="font-bold text-foreground">1) วิธีตรวจจับการเกิดซ้ำ (Recurrence Detection)</h3>
            <p>
              ระบบเปรียบเทียบรายงานใหม่กับเคสที่ <strong>ปิดแล้ว</strong> (status = แก้ไขเสร็จสิ้น)
              หากพบความสอดคล้องทั้ง 3 เงื่อนไขนี้ จะถือว่าเป็นการเกิดซ้ำ
            </p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>หมวดหมู่เดียวกัน (category)</li>
              <li>ระยะห่างทางภูมิศาสตร์ ≤ 200 เมตร</li>
              <li>เวลาห่างจากเคสก่อน ≤ 90 วัน</li>
            </ul>
            <pre className="overflow-x-auto rounded bg-background p-3 text-[12.5px] leading-relaxed">
{`recurrenceFlag = (
  categoryMatch
  AND haversine(newLat, newLng, closedLat, closedLng) ≤ 200 m
  AND daysSinceClosed ≤ 90
)`}
            </pre>
            <p className="text-muted-foreground text-[13px]">
              ค่า 200 เมตร คิดจากรัศมีที่เดินได้ใน 2–3 นาที ซึ่งครอบคลุม "จุดเดิม" แต่ไม่กว้างจนรวมปัญหาคนละเรื่อง
              ส่วน 90 วันคือ window ที่เหมาะสมกับ SLA การแก้ไขระดับ structural ในเมือง
            </p>
          </div>

          {/* Recurrence Count & Recency Weight */}
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="font-bold text-foreground">2) Recurrence Count และ Recency Weight</h3>
            <p>
              นับจำนวนครั้งที่เกิดซ้ำในจุดเดียวกัน และให้น้ำหนักกับเหตุที่เกิด <em>ใกล้ปัจจุบันมากกว่า</em>
              เพราะปัญหาใหม่สะท้อนสภาพปัจจุบันได้ดีกว่า
            </p>
            <pre className="overflow-x-auto rounded bg-background p-3 text-[12.5px] leading-relaxed">
{`recurrenceCount = Σ (recurrenceFlag_i)   // นับเฉพาะเคสที่ปิดแล้วในจุดนั้น

recencyWeight_i = exp( −daysAgo_i / 30 )   // exponential decay ครึ่งชีวิต ≈ 30 วัน

weightedRecurrence = Σ (recencyWeight_i × severity_i) / Σ (recencyWeight_i)
                     // ค่าเฉลี่ยถ่วงน้ำหนักของความรุนแรง ณ จุดนั้น`}
            </pre>
            <ul className="list-disc pl-5 space-y-0.5">
              <li><strong>recurrenceCount</strong> — จำนวนครั้งที่เกิดซ้ำ (ตั้งแต่ 0 ขึ้นไป)</li>
              <li><strong>recencyWeight</strong> — น้ำหนักลดลงแบบเอกซ์โพเนนเชียล 30 วันหลังสุดนับเต็ม 60 วันหลังสุดนับครึ่ง</li>
              <li><strong>weightedRecurrence</strong> — ความรุนแรงเฉลี่ยของปัญหาซ้ำ ณ จุดนั้น (ช่วง 0–100)</li>
            </ul>
          </div>

          {/* พื้นที่เสี่ยง */}
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="font-bold text-foreground">3) พื้นที่เสี่ยง (Risk Area) — คะแนน 0–100</h3>
            <p>
              พื้นที่เสี่ยงคือจุดที่ <em>เกิดปัญหาซ้ำบ่อย + แต่ละครั้งรุนแรง</em>
              คะแนนรวมความถี่ ความรุนแรง และความใหม่ของเหตุการณ์ล่าสุด
            </p>
            <pre className="overflow-x-auto rounded bg-background p-3 text-[12.5px] leading-relaxed">
{`riskAreaScore = (
  min(recurrenceCount, 8)       × 8     // ความถี่ (เพดาน 8 ครั้ง = 64 คะแนน)
  + weightedRecurrence           × 0.25  // ความรุนแรงเฉลี่ยถ่วงน้ำหนัก
  + maxRiskInLast90Days          × 0.15  // risk สูงสุดในช่วง 90 วันล่าสุด
  + (mergedReportsInArea / 5)    × 2     // รายงานที่ถูกรวมในพื้นที่ (สัญญาณยืนยัน)
)
riskAreaScore = min(riskAreaScore, 100)`}
            </pre>
            <div>
              <div className="font-semibold mt-2">เกณฑ์ระดับพื้นที่เสี่ยง</div>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li>≥ 75 → <strong>พื้นที่เสี่ยงสูงมาก</strong> — ต้องตรวจสอบโครงสร้าง / นโยบายด่วน</li>
                <li>≥ 55 → <strong>พื้นที่เสี่ยงสูง</strong> — ต้องมีมาตรการป้องกันเฉพาะจุด</li>
                <li>≥ 35 → <strong>พื้นที่เสี่ยงปานกลาง</strong> — ติดตามและเพิ่มการลาดตระเวน</li>
                <li>&lt; 35 → <strong>พื้นที่เสี่ยงต่ำ</strong> — บันทึกไว้ ไม่ต้องดำเนินการพิเศษ</li>
              </ul>
            </div>
            <p className="text-muted-foreground text-[13px]">
              เพดาน recurrenceCount = 8 เพื่อป้องกัน outlier ที่เกิดซ้ำมากผิดปกติครอบงำคะแนน
              ส่วน mergedReportsInArea แปลงเป็น 1 คะแนนต่อ 5 รายงานที่ถูกรวม เพื่อสะท้อนความเชื่อมั่นว่าปัญหามีจริง
            </p>
          </div>

          {/* พื้นที่ควรติดตามเชิงนโยบาย */}
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="font-bold text-foreground">4) พื้นที่ควรติดตามเชิงนโยบาย (Policy Watch Area)</h3>
            <p>
              บางพื้นที่อาจมี <em>ปัญหาซ้ำบ่อยแต่แต่ละครั้งไม่รุนแรง</em> เช่น จอดรถผิดกฎหมายซ้ำ ๆ ที่เดิม
              ซึ่ง Risk Area Score อาจไม่สูง แต่หมายถึง <strong>นโยบายหรือโครงสร้างพื้นฐานมีช่องโหว่</strong>
              ระบบจึงแยกประเภทนี้ออกมาเป็น "พื้นที่ควรติดตามเชิงนโยบาย"
            </p>
            <pre className="overflow-x-auto rounded bg-background p-3 text-[12.5px] leading-relaxed">
{`policyWatchScore = (
  min(recurrenceCount, 10)      × 5      // น้ำหนักความถี่สูงกว่า (เพดาน 50)
  + (avgMergedReports × 3)                // รายงานซ้ำเฉลี่ยต่อเคส — ยิ่งสูง = ยิ่งมีปัญหาโครงสร้าง
  + (closureRate × 20)                    // อัตราปิดเคส (0–1) × 20
)
policyWatchScore = min(policyWatchScore, 100)

// เงื่อนไขการจัดประเภท
isPolicyWatch = (
  recurrenceCount ≥ 3
  AND policyWatchScore ≥ 40
  AND riskAreaScore < 55          // ไม่ใช่พื้นที่เสี่ยงสูง (ไม่เช่นนั้นจะเป็น Risk Area ไปแล้ว)
  AND avgTimeToClose > 14         // แก้ไปแล้วแต่กลับมาอีก หรือใช้เวลาปิดนาน
)`}
            </pre>
            <div>
              <div className="font-semibold mt-2">เกณฑ์ระดับการติดตามเชิงนโยบาย</div>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li>≥ 70 → <strong>ติดตามด่วน</strong> — ตรวจสอบกฎระเบียบ/โครงสร้าง เช่น ขาดที่จอดรถ ขาดป้ายกำกับ</li>
                <li>≥ 50 → <strong>ติดตาม</strong> — ประเมินนโยบายปัจจุบัน เช่น เวลาห้ามจอด จำนวนพนักงานจราจร</li>
                <li>≥ 35 → <strong>เฝ้าระวัง</strong> — บันทึกไว้ รอข้อมูลเพิ่มเติมก่อนสรุป</li>
                <li>&lt; 35 → <strong>ไม่ต้องดำเนินการเชิงนโยบาย</strong> — เป็นปัญหาเฉพาะกรณี</li>
              </ul>
            </div>
            <p className="text-muted-foreground text-[13px]">
              ความแตกต่างสำคัญ: พื้นที่เสี่ยงเน้นความรุนแรงของแต่ละเหตุ (เช่น น้ำท่วมถนน/กีดขวางฉุกเฉิน)
              ส่วนพื้นที่ควรติดตามเชิงนโยบายเน้นความถี่และรูปแบบที่ซ้ำซาก (เช่น จอดผิดกฎซ้ำ ๆ)
              ซึ่งบ่งชี้ว่าการแก้ไขแบบ reactive ไม่พอ ต้องมีการวางนโยบายเชิงรุก
            </p>
          </div>

          {/* Worked example */}
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="font-bold text-foreground">ตัวอย่างการคำนวณจริง</h3>
            <p>
              จุด A: <strong>“จอดรถผิดกฎหมายหน้าตลาด”</strong> — เกิดซ้ำ 5 ครั้งใน 90 วัน
              แต่ละครั้ง risk ประมาณ 55, รายงานถูกรวมเฉลี่ย 4 ครั้ง/เคส, ปิดเคสใช้เวลา 18 วัน
            </p>
            <pre className="overflow-x-auto rounded bg-background p-3 text-[12.5px] leading-relaxed">
{`recurrenceCount = 5
weightedRecurrence ≈ 55 (ทุกครั้งคล้ายกัน)
maxRiskInLast90Days = 55
mergedReportsInArea = 5 × 4 = 20

riskAreaScore = min(5,8)×8 + 55×0.25 + 55×0.15 + (20/5)×2
              = 40 + 13.75 + 8.25 + 8
              = 70.0  →  พื้นที่เสี่ยงสูง

policyWatchScore = min(5,10)×5 + 4×3 + (0.8×20)
                 = 25 + 12 + 16
                 = 53.0  →  ติดตาม (เชิงนโยบาย)

// สรุป: จุดนี้ได้ทั้ง "พื้นที่เสี่ยงสูง" และ "พื้นที่ติดตามเชิงนโยบาย"
// แนะนำ: ลงโทษ/เพิ่มการลาดตระเวนระยะสั้น + ศึกษาการจัดที่จอดรถ/เวลาห้ามจอดระยะยาว`}
            </pre>
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
