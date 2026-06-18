import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Sparkles, CheckCircle2, AlertTriangle, Rocket, Calculator } from "lucide-react";

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
