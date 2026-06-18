// Top recurring case categories per district + prevention suggestions.
// Deterministic seeded selection so the dashboard is stable across reloads.

export type CaseCategory = {
  key: string;
  label: string;
  icon: "traffic" | "flood" | "parking" | "sidewalk" | "light" | "sign" | "trash" | "noise" | "construction";
  prevention: string[];
};

export const CASE_CATEGORIES: CaseCategory[] = [
  {
    key: "traffic-light",
    label: "สัญญาณไฟจราจรผิดปกติ",
    icon: "light",
    prevention: [
      "ตรวจสอบและบำรุงรักษาสัญญาณไฟตามรอบที่กำหนดทุก 30 วัน",
      "ติดตั้งเซ็นเซอร์ตรวจจับความผิดปกติแบบ real-time แจ้งเตือนศูนย์ควบคุม",
      "ประสาน บก.จร. ปรับจังหวะไฟตามปริมาณรถจริงในชั่วโมงเร่งด่วน",
    ],
  },
  {
    key: "parking-block",
    label: "รถจอดกีดขวางทาง",
    icon: "parking",
    prevention: [
      "เพิ่มความถี่การตรวจตราของเทศกิจในช่วงเวลาเร่งด่วน",
      "ติดตั้งกล้อง AI ตรวจจับรถจอดผิดที่ ออกใบสั่งอัตโนมัติ",
      "ปรับปรุงเครื่องหมายจราจรและทาสีขอบทางให้ชัดเจน",
    ],
  },
  {
    key: "flood",
    label: "น้ำท่วมขังกระทบจราจร",
    icon: "flood",
    prevention: [
      "ขุดลอกท่อระบายน้ำก่อนเข้าฤดูฝนทุกปี",
      "ติดตั้งเครื่องสูบน้ำอัตโนมัติในจุดต่ำที่เกิดน้ำท่วมซ้ำ",
      "ประสานสำนักการระบายน้ำตรวจสอบ pump station ที่เกี่ยวข้อง",
    ],
  },
  {
    key: "sidewalk",
    label: "ทางเดินเท้าถูกกีดขวาง",
    icon: "sidewalk",
    prevention: [
      "จัดระเบียบหาบเร่แผงลอยให้อยู่ในจุดที่อนุญาตเท่านั้น",
      "ปรับปรุงผิวทางเท้าและทางลาดให้ได้มาตรฐาน universal design",
      "เพิ่มการมีส่วนร่วมของชุมชนในการเฝ้าระวังและรายงานปัญหา",
    ],
  },
  {
    key: "potholes",
    label: "ผิวถนนชำรุด/หลุมบ่อ",
    icon: "construction",
    prevention: [
      "สำรวจสภาพถนนด้วย mobile mapping ทุก 3 เดือน",
      "จัดทำสัญญาบำรุงรักษาเชิงป้องกัน (preventive maintenance)",
      "ใช้วัสดุยางมะตอยคุณภาพสูงในจุดที่มีปริมาณรถหนาแน่น",
    ],
  },
  {
    key: "sign-unclear",
    label: "ป้ายจราจรไม่ชัด/หาย",
    icon: "sign",
    prevention: [
      "ตรวจสอบและทำความสะอาดป้ายจราจรทุก 6 เดือน",
      "เปลี่ยนป้ายที่ซีดจางหรือเสียหายภายใน 7 วันหลังพบ",
      "ใช้วัสดุสะท้อนแสงมาตรฐานสูงในจุดทางแยกสำคัญ",
    ],
  },
  {
    key: "trash",
    label: "ขยะตกค้าง/ถังขยะล้น",
    icon: "trash",
    prevention: [
      "เพิ่มรอบการจัดเก็บในย่านเศรษฐกิจและแหล่งท่องเที่ยว",
      "ติดตั้งถังขยะ smart bin แจ้งเตือนเมื่อเต็ม",
      "รณรงค์การคัดแยกขยะตั้งแต่ต้นทางในชุมชน",
    ],
  },
  {
    key: "noise",
    label: "เหตุรบกวน/เสียงดัง",
    icon: "noise",
    prevention: [
      "กำหนดเขตเวลาควบคุมเสียงในย่านที่อยู่อาศัย",
      "ตรวจวัดระดับเสียงด้วยอุปกรณ์ที่ได้มาตรฐานก่อนออกคำสั่ง",
      "ทำงานร่วมกับสถานบันเทิงและสมาคมผู้ประกอบการ",
    ],
  },
  {
    key: "construction",
    label: "ก่อสร้างกีดขวางจราจร",
    icon: "construction",
    prevention: [
      "บังคับให้ผู้รับเหมาแจ้งแผนเบี่ยงจราจรล่วงหน้า 14 วัน",
      "ตรวจสอบการติดตั้งป้ายเตือนและไฟสัญญาณในเขตก่อสร้าง",
      "ปรับค่าธรรมเนียมการครอบครองพื้นที่ตามเวลาที่ใช้จริง",
    ],
  },
];

// deterministic hash for stable selection
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

export type DistrictCase = { category: CaseCategory; count: number };

export function topCasesForDistrict(districtName: string, total: number): DistrictCase[] {
  // shuffle categories by district-seeded hash
  const seed = hash(districtName);
  const ranked = CASE_CATEGORIES
    .map((c, i) => ({ c, r: hash(districtName + c.key + i) }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.c);

  // top 3 distribute ~ 45% / 30% / 18% of total (rest = other), with jitter
  const top = ranked.slice(0, 3);
  const jitter = (seed % 7) - 3; // -3..+3
  const w = [0.45, 0.3, 0.18].map((v, i) => Math.max(0.05, v + jitter * 0.01 * (i + 1)));
  return top.map((c, i) => ({
    category: c,
    count: Math.max(1, Math.round(total * w[i])),
  }));
}
