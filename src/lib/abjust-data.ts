// Mock data + helpers for Abjust prototype
export type RiskLevel = "สูงมาก" | "สูง" | "ปานกลาง" | "ต่ำ";
export type Status =
  | "รับเรื่องแล้ว"
  | "กำลังตรวจสอบ"
  | "มอบหมายหน่วยงานแล้ว"
  | "กำลังดำเนินการ"
  | "แก้ไขเสร็จสิ้น";

export const CATEGORIES = [
  "จอดรถผิดกฎหมาย",
  "จอดขวางช่องจราจร",
  "จอดบนทางเท้า",
  "ขับย้อนศร",
  "ขับไหล่ทาง",
  "กีดขวางทางรถฉุกเฉิน",
  "สัญญาณไฟจราจรผิดปกติ",
  "ทางเดินเท้าถูกกีดขวาง",
  "น้ำท่วมถนนกระทบการจราจร",
  "ป้ายหรือเส้นจราจรไม่ชัดเจน",
  "สิ่งกีดขวางหรือจุดเสี่ยงบนถนน",
  "อื่น ๆ",
] as const;

export const STATUS_ORDER: Status[] = [
  "รับเรื่องแล้ว",
  "กำลังตรวจสอบ",
  "มอบหมายหน่วยงานแล้ว",
  "กำลังดำเนินการ",
  "แก้ไขเสร็จสิ้น",
];

export const TIMELINE_STEPS = [
  "รับเรื่องแล้ว",
  "AI สรุปเหตุการณ์แล้ว",
  "รวมรายงานซ้ำแล้ว",
  "เจ้าหน้าที่กำลังตรวจสอบ",
  "มอบหมายหน่วยงานที่เกี่ยวข้อง",
  "อยู่ระหว่างดำเนินการ",
  "แก้ไขเสร็จสิ้น",
  "แจ้งผู้รายงานแล้ว",
];

export interface Case {
  id: string;
  category: string;
  title: string;
  summary: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: Status;
  mergedReports: number;
  unit: string;
  district: string;
  location: { lat: number; lng: number; label: string };
  updatedAt: string;
  currentStep: number; // index into TIMELINE_STEPS
}

export function riskLevelOf(score: number): RiskLevel {
  if (score >= 85) return "สูงมาก";
  if (score >= 65) return "สูง";
  if (score >= 40) return "ปานกลาง";
  return "ต่ำ";
}

export const SAMPLE_REPORT = {
  category: "กีดขวางทางรถฉุกเฉิน",
  description:
    "มีรถจอดกีดขวางทางเข้ารถพยาบาลใกล้โรงพยาบาลจุฬาฯ ทำให้รถฉุกเฉินอาจล่าช้า ผู้ป่วยที่ต้องส่งตัวด่วนอาจได้รับผลกระทบ",
  lat: 13.7311,
  lng: 100.5347,
  label: "ใกล้โรงพยาบาลจุฬาลงกรณ์ ถนนพระราม 4",
  note: "พบช่วงเช้าและบ่ายเป็นประจำ",
};

export const MOCK_CASES: Case[] = [
  {
    id: "ABJ-2410-0871",
    category: "กีดขวางทางรถฉุกเฉิน",
    title: "รถจอดขวางทางเข้ารถพยาบาล รพ.จุฬาฯ",
    summary:
      "ระบบตรวจพบรายงานหลายฉบับเกี่ยวกับรถจอดกีดขวางทางเข้ารถพยาบาลใกล้ รพ.จุฬาฯ ส่งผลให้รถฉุกเฉินเข้า–ออกได้ช้า เสี่ยงต่อความปลอดภัยของผู้ป่วยวิกฤต",
    riskScore: 92,
    riskLevel: "สูงมาก",
    status: "กำลังตรวจสอบ",
    mergedReports: 18,
    unit: "Traffic Enforcement Unit",
    district: "ปทุมวัน",
    location: { lat: 13.7311, lng: 100.5347, label: "ถ.พระราม 4 ใกล้ รพ.จุฬาฯ" },
    updatedAt: "5 นาทีที่แล้ว",
    currentStep: 3,
  },
  {
    id: "ABJ-2410-0865",
    category: "สัญญาณไฟจราจรผิดปกติ",
    title: "ไฟแดงค้าง แยกอโศก-สุขุมวิท",
    summary:
      "สัญญาณไฟค้างที่แยกอโศก-สุขุมวิท ทำให้รถติดสะสมหลายกิโลเมตร มีรายงานจากผู้ใช้รถจำนวนมากในเวลาใกล้เคียงกัน",
    riskScore: 88,
    riskLevel: "สูงมาก",
    status: "มอบหมายหน่วยงานแล้ว",
    mergedReports: 24,
    unit: "สำนักการจราจรและขนส่ง",
    district: "วัฒนา",
    location: { lat: 13.7376, lng: 100.5602, label: "แยกอโศก-สุขุมวิท" },
    updatedAt: "12 นาทีที่แล้ว",
    currentStep: 4,
  },
  {
    id: "ABJ-2410-0859",
    category: "น้ำท่วมถนนกระทบการจราจร",
    title: "น้ำท่วมขังถนนสุขุมวิท 71",
    summary:
      "ระดับน้ำสูงประมาณ 30 ซม. รถเล็กผ่านไม่ได้ ทำให้การจราจรช่วงสุขุมวิท 71 ติดขัดอย่างหนัก",
    riskScore: 81,
    riskLevel: "สูง",
    status: "กำลังดำเนินการ",
    mergedReports: 11,
    unit: "สำนักการระบายน้ำ",
    district: "วัฒนา",
    location: { lat: 13.7281, lng: 100.5912, label: "สุขุมวิท 71" },
    updatedAt: "28 นาทีที่แล้ว",
    currentStep: 5,
  },
  {
    id: "ABJ-2410-0851",
    category: "จอดบนทางเท้า",
    title: "รถจักรยานยนต์จอดบนทางเท้า สีลม",
    summary:
      "พบมอเตอร์ไซค์รับจ้างจอดบนทางเท้าเป็นจำนวนมาก ทำให้คนเดินเท้าต้องเดินลงถนน",
    riskScore: 67,
    riskLevel: "สูง",
    status: "รับเรื่องแล้ว",
    mergedReports: 9,
    unit: "เทศกิจ เขตบางรัก",
    district: "บางรัก",
    location: { lat: 13.7253, lng: 100.5337, label: "ถ.สีลม ใกล้ BTS ศาลาแดง" },
    updatedAt: "1 ชั่วโมงที่แล้ว",
    currentStep: 0,
  },
  {
    id: "ABJ-2410-0848",
    category: "ขับย้อนศร",
    title: "ขับย้อนศรซอยทองหล่อ 10",
    summary: "รถยนต์ขับย้อนศรในซอยแคบ มีความเสี่ยงต่ออุบัติเหตุ",
    riskScore: 72,
    riskLevel: "สูง",
    status: "กำลังตรวจสอบ",
    mergedReports: 6,
    unit: "Traffic Enforcement Unit",
    district: "วัฒนา",
    location: { lat: 13.7404, lng: 100.583, label: "ซอยทองหล่อ 10" },
    updatedAt: "2 ชั่วโมงที่แล้ว",
    currentStep: 3,
  },
  {
    id: "ABJ-2410-0840",
    category: "สิ่งกีดขวางหรือจุดเสี่ยงบนถนน",
    title: "ฝาท่อชำรุด ถ.รัชดาภิเษก",
    summary: "ฝาท่อระบายน้ำชำรุดบนถนนรัชดาฯ เสี่ยงต่อรถยนต์และจักรยานยนต์",
    riskScore: 58,
    riskLevel: "ปานกลาง",
    status: "มอบหมายหน่วยงานแล้ว",
    mergedReports: 4,
    unit: "สำนักการโยธา",
    district: "ห้วยขวาง",
    location: { lat: 13.7669, lng: 100.5736, label: "ถ.รัชดาภิเษก" },
    updatedAt: "3 ชั่วโมงที่แล้ว",
    currentStep: 4,
  },
  {
    id: "ABJ-2410-0832",
    category: "ทางเดินเท้าถูกกีดขวาง",
    title: "ร้านค้าตั้งของรุกล้ำทางเท้า",
    summary: "ผู้ค้าตั้งร้านบนทางเท้าทำให้คนเดินผ่านได้ลำบาก",
    riskScore: 45,
    riskLevel: "ปานกลาง",
    status: "กำลังดำเนินการ",
    mergedReports: 3,
    unit: "เทศกิจ เขตปทุมวัน",
    district: "ปทุมวัน",
    location: { lat: 13.7466, lng: 100.5347, label: "สยามสแควร์" },
    updatedAt: "5 ชั่วโมงที่แล้ว",
    currentStep: 5,
  },
  {
    id: "ABJ-2410-0820",
    category: "ป้ายหรือเส้นจราจรไม่ชัดเจน",
    title: "เส้นทางม้าลายจางหน้าโรงเรียน",
    summary: "เส้นทางม้าลายหน้าโรงเรียนเริ่มเลือน เด็กข้ามถนนเสี่ยงอันตราย",
    riskScore: 62,
    riskLevel: "ปานกลาง",
    status: "แก้ไขเสร็จสิ้น",
    mergedReports: 2,
    unit: "สำนักการจราจรและขนส่ง",
    district: "บางกะปิ",
    location: { lat: 13.765, lng: 100.6431, label: "หน้า ร.ร.บางกะปิ" },
    updatedAt: "เมื่อวาน",
    currentStep: 7,
  },
  {
    id: "ABJ-2410-0815",
    category: "จอดขวางช่องจราจร",
    title: "รถบรรทุกจอดขวางเลน ถ.พระราม 9",
    summary: "รถบรรทุกจอดส่งของขวางเลนซ้ายในชั่วโมงเร่งด่วน",
    riskScore: 70,
    riskLevel: "สูง",
    status: "แก้ไขเสร็จสิ้น",
    mergedReports: 7,
    unit: "Traffic Enforcement Unit",
    district: "ห้วยขวาง",
    location: { lat: 13.7563, lng: 100.5651, label: "ถ.พระราม 9" },
    updatedAt: "เมื่อวาน",
    currentStep: 7,
  },
];

export function getCase(id: string): Case | undefined {
  return MOCK_CASES.find((c) => c.id === id);
}

export const ANALYTICS = {
  totalCases: 312,
  totalReports: 1487,
  mergedReports: 1175,
  topRiskCases: MOCK_CASES.slice(0, 4),
  topCategories: [
    { name: "จอดบนทางเท้า", count: 284 },
    { name: "สัญญาณไฟจราจรผิดปกติ", count: 197 },
    { name: "กีดขวางทางรถฉุกเฉิน", count: 142 },
    { name: "น้ำท่วมถนนกระทบการจราจร", count: 118 },
    { name: "ขับย้อนศร", count: 96 },
  ],
  statusBreakdown: [
    { status: "รับเรื่องแล้ว", count: 58 },
    { status: "กำลังตรวจสอบ", count: 71 },
    { status: "มอบหมายหน่วยงานแล้ว", count: 64 },
    { status: "กำลังดำเนินการ", count: 82 },
    { status: "แก้ไขเสร็จสิ้น", count: 37 },
  ],
  topDistricts: [
    { name: "วัฒนา", count: 78 },
    { name: "ปทุมวัน", count: 61 },
    { name: "ห้วยขวาง", count: 54 },
    { name: "บางรัก", count: 47 },
    { name: "จตุจักร", count: 39 },
  ],
  recurringHotspots: [
    "แยกอโศก-สุขุมวิท",
    "ถ.พระราม 4 ใกล้ รพ.จุฬาฯ",
    "ถ.สุขุมวิท 71",
    "ถ.รัชดาภิเษก ใกล้ MRT ห้วยขวาง",
  ],
};
