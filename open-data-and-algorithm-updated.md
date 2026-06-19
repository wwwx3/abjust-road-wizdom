# Open Data & Algorithm Documentation

เอกสารนี้อธิบายโครงสร้างข้อมูล พารามิเตอร์ คะแนนความเสี่ยง และ workflow algorithm ของ **Abjust — Bangkok Traffic Risk Triage** สำหรับการเปิดเผยแบบ open source

> หมายเหตุ: เอกสารนี้ใช้สำหรับ prototype และการสาธิตใน hackathon เท่านั้น ข้อมูลทั้งหมดใน repo ควรเป็น mock data หรือข้อมูลจำลอง ไม่ควรมีข้อมูลประชาชนจริง

---

## 1. Purpose

Abjust ถูกออกแบบเป็น **Traffic-Risk Intelligence Layer** สำหรับช่วยจัดการรายงานปัญหาจราจรในกรุงเทพฯ โดยทำหน้าที่เสริมระบบรายงานเดิม ไม่ใช่แทนที่ระบบเดิม

ระบบช่วยเปลี่ยนรายงานของประชาชนให้กลายเป็นเคสที่:

- สรุปได้ชัดเจน
- จัดลำดับความเสี่ยงได้
- รวมรายงานซ้ำได้
- มีหน่วยงานดูแลเคส
- ติดตามสถานะได้
- ส่งต่อเคสขึ้นระดับที่สูงขึ้นเมื่อค้างเกินกำหนด
- ใช้เป็นข้อมูลเชิงพื้นที่สำหรับผู้บริหารเมืองได้

---

## 2. Canonical Variable Naming

เอกสารนี้ใช้ **camelCase** เป็นชื่อตัวแปรหลัก เพื่อให้ตรงกับ logic ที่ทีมใช้ใน scoring และ dashboard

> ถ้า backend หรือ database บางส่วนใช้ snake_case เช่น `risk_score` หรือ `reporter_count` สามารถแปลงผ่าน API adapter ได้ แต่ในเอกสาร algorithm นี้ให้ถือว่า camelCase เป็นชื่อหลัก

| Canonical Variable | Meaning |
|---|---|
| `baseSeverity[category]` | ค่าความรุนแรงพื้นฐานของแต่ละประเภทปัญหา |
| `isRushHour` | อยู่ในช่วงเร่งด่วน 07:00–09:00 หรือ 16:00–19:00 |
| `impactedCount` | จำนวนผู้ได้รับผลกระทบโดยประมาณ หรือ proxy ของผลกระทบใน prototype |
| `reporterCount` | จำนวนผู้แจ้งซ้ำ / จำนวนรายงานยืนยันจากหลายแหล่ง |
| `ageHours` | จำนวนชั่วโมงที่เคสค้างอยู่ในระบบ |
| `imageSeverity` | คะแนนความรุนแรงจากภาพหลักฐาน 0–100; prototype ใช้ default = 30 |
| `recurrenceCount` | จำนวนครั้งที่ปัญหาเดิมเกิดซ้ำในพื้นที่เดิม |
| `recencyWeight` | น้ำหนักความใหม่ของเหตุการณ์ซ้ำ |
| `weightedRecurrence` | ค่าเฉลี่ยความรุนแรงของปัญหาซ้ำแบบถ่วงน้ำหนักตามความใหม่ |
| `maxRiskInLast90Days` | Risk Score สูงสุดในพื้นที่นั้นในช่วง 90 วันล่าสุด |
| `mergedReportsInArea` | จำนวนรายงานที่ถูกรวมในพื้นที่ hotspot |
| `avgMergedReports` | ค่าเฉลี่ยจำนวนรายงานที่ถูกรวมต่อเคสในพื้นที่ |
| `closureRate` | สัดส่วนเคสที่เคยปิดแล้วใน pattern เดิม ใช้เป็นสัญญาณว่า reactive closure อาจไม่พอ |
| `avgTimeToClose` | เวลาเฉลี่ยในการปิดเคส |
| `riskScore` | คะแนนความเสี่ยงของเหตุการณ์ 0–100 |
| `priorityScore` | คะแนนลำดับความสำคัญในการจัดคิว 0–100 |
| `impactLevel` | สูงมาก / สูง / ปานกลาง / ต่ำ |
| `riskAreaScore` | คะแนนพื้นที่เสี่ยงจากปัญหาซ้ำและความรุนแรง |
| `policyWatchScore` | คะแนนพื้นที่ควรติดตามเชิงนโยบาย |

### Important Note on `impactedCount`

ใน prototype บางเวอร์ชัน `impactedCount` อาจยังไม่ได้มาจากจำนวน “คนที่ได้รับผลกระทบจริง” แต่เป็น proxy เช่น จำนวนรายงานที่ถูกรวม หรือค่าประมาณจากทีม

ดังนั้นใน UI หรือเอกสาร pitch ควรอธิบายให้ชัดว่า:

- ถ้ามีข้อมูลจริง: `impactedCount` = จำนวนผู้ได้รับผลกระทบโดยประมาณ
- ถ้ายังเป็น prototype/mock data: `impactedCount` = proxy ของผลกระทบ เช่น จำนวนรายงานที่ถูกรวม

หากยังไม่มีข้อมูลผู้ได้รับผลกระทบจริง ไม่ควรกล่าวว่าเป็นจำนวนคนจริงแบบยืนยันแล้ว

---

## 3. Open Source Data Scope

### 3.1 ข้อมูลที่เปิดเผยได้

Repository นี้สามารถเปิดเผย:

- source code
- mock data
- API schema
- scoring logic
- algorithm workflow
- dashboard template
- documentation
- sample reports
- sample cases
- anonymized aggregate data examples

### 3.2 ข้อมูลที่ไม่ควรเปิดเผย

ห้ามเปิดเผยข้อมูลต่อไปนี้ใน repo:

- ชื่อประชาชนจริง
- เบอร์โทรศัพท์
- เลขบัตรประชาชน
- ภาพที่เห็นใบหน้าหรือป้ายทะเบียนจริง
- พิกัดที่ผูกกับข้อมูลส่วนบุคคลจริง
- officer internal notes ที่เป็นข้อมูลลับ
- API keys
- `.env`
- access tokens
- private government data
- raw database ที่มีข้อมูลจริง

### 3.3 หลักการ Open Data

หากพัฒนาต่อเป็นระบบจริง ข้อมูลที่เปิดเผยต่อสาธารณะควรอยู่ในระดับ:

- aggregate
- anonymized
- district-level หรือ area-level
- no personal identifiers
- no raw evidence images
- no exact private report details

ตัวอย่างข้อมูลที่เปิดเผยได้:

- จำนวนเคสต่อเขต
- จำนวนเคสตามประเภทปัญหา
- ค่าเฉลี่ย `riskScore` ต่อพื้นที่
- จำนวนเคสค้างเกิน SLA
- จุด hotspot แบบไม่เปิดเผยผู้แจ้ง
- เวลาเฉลี่ยในการอัปเดตสถานะ
- สัดส่วนเคสที่ปิดแล้ว

---

## 4. Core Data Objects

ระบบใช้ข้อมูลหลัก 4 ประเภท:

1. `Report`
2. `Case`
3. `TimelineEvent`
4. `AreaInsight`

---

## 5. Report Schema

`Report` คือรายงานที่ประชาชนส่งเข้ามา 1 ครั้ง

```json
{
  "reportId": "RPT-001",
  "sourceSystem": "prototype",
  "category": "emergency_access_blocked",
  "description": "มีรถจอดกีดขวางทางเข้ารถพยาบาลใกล้โรงพยาบาล",
  "lat": 13.7307,
  "lng": 100.536,
  "photoUrl": null,
  "createdAt": "2026-06-20T08:30:00+07:00",
  "reporterCount": 1,
  "privacyStatus": "mock_data"
}
```

### Report Parameters

| Field | Type | Description |
|---|---|---|
| `reportId` | string | ID ของรายงาน |
| `sourceSystem` | string | แหล่งที่มาของรายงาน เช่น prototype, Traffy-like API, 1555 |
| `category` | string | ประเภทปัญหาจราจร |
| `description` | string | รายละเอียดจากประชาชน |
| `lat` | number | latitude |
| `lng` | number | longitude |
| `photoUrl` | string/null | URL รูปภาพหลักฐาน ถ้ามี |
| `createdAt` | datetime | เวลาที่ส่งรายงาน |
| `reporterCount` | number | จำนวนผู้แจ้งซ้ำหรือจำนวนรายงานจากคนละผู้แจ้ง |
| `privacyStatus` | string | สถานะข้อมูล เช่น mock_data, anonymized, private |

---

## 6. Case Schema

`Case` คือเคสที่ระบบสร้างขึ้นจากรายงาน อาจมีรายงานเดียวหรือหลายรายงานที่ถูกรวมกัน

```json
{
  "caseId": "CASE-092",
  "category": "emergency_access_blocked",
  "categoryTh": "กีดขวางทางรถฉุกเฉิน",
  "aiSummary": "มีรายงานหลายครั้งว่ารถจอดกีดขวางทางเข้ารถพยาบาลบริเวณใกล้โรงพยาบาลจุฬาลงกรณ์",
  "lat": 13.7307,
  "lng": 100.536,
  "riskScore": 92,
  "priorityScore": 88,
  "impactLevel": "สูงมาก",
  "status": "reviewing",
  "impactedCount": 18,
  "reporterCount": 12,
  "recurrenceCount": 3,
  "leadUnit": "หน่วยบังคับใช้กฎหมายจราจร",
  "supportingUnits": ["สำนักงานเขต"],
  "currentOwner": "หน่วยบังคับใช้กฎหมายจราจร",
  "nextAction": "ตรวจสอบพื้นที่และประสานการเคลื่อนย้ายรถที่กีดขวางทางฉุกเฉิน",
  "slaHours": 6,
  "escalationLevel": 1,
  "createdAt": "2026-06-20T08:30:00+07:00",
  "updatedAt": "2026-06-20T09:10:00+07:00"
}
```

### Case Parameters

| Field | Type | Description |
|---|---|---|
| `caseId` | string | ID ของเคส |
| `category` | string | ประเภทปัญหาแบบ code |
| `categoryTh` | string | ประเภทปัญหาเป็นภาษาไทย |
| `aiSummary` | string | สรุปเหตุการณ์โดยระบบ |
| `lat` / `lng` | number | พิกัดหลักของเคส |
| `riskScore` | number | คะแนนความเสี่ยง 0–100 |
| `priorityScore` | number | คะแนนจัดลำดับคิว 0–100 |
| `impactLevel` | string | สูงมาก / สูง / ปานกลาง / ต่ำ |
| `status` | string | สถานะ workflow |
| `impactedCount` | number | จำนวนผู้ได้รับผลกระทบโดยประมาณ หรือ proxy ของผลกระทบ |
| `reporterCount` | number | จำนวนผู้แจ้งหรือจำนวนรายงานซ้ำ |
| `recurrenceCount` | number | จำนวนครั้งที่ปัญหาเดิมเกิดซ้ำในพื้นที่ |
| `leadUnit` | string | หน่วยงานหลัก |
| `supportingUnits` | array | หน่วยงานร่วม |
| `currentOwner` | string | เจ้าภาพปัจจุบัน |
| `nextAction` | string | ขั้นตอนถัดไป |
| `slaHours` | number | เวลาที่ควรรับเคสหรืออัปเดต |
| `escalationLevel` | number | ระดับการส่งต่อ |
| `createdAt` | datetime | เวลาสร้างเคส |
| `updatedAt` | datetime | เวลาอัปเดตล่าสุด |

---

## 7. Category List

| Code | Thai Label | Base Severity |
|---|---:|---:|
| `emergency_access_blocked` | กีดขวางทางรถฉุกเฉิน | 95 |
| `wrong_way` | ขับย้อนศร | 85 |
| `traffic_light_error` | สัญญาณไฟจราจรผิดปกติ | 80 |
| `flood_road_disruption` | น้ำท่วมถนนกระทบการจราจร | 78 |
| `lane_blocking` | จอดขวางช่องจราจร | 75 |
| `shoulder_driving` | ขับไหล่ทาง | 70 |
| `road_obstruction` | สิ่งกีดขวางบนถนน | 70 |
| `sidewalk_parking` | จอดบนทางเท้า | 65 |
| `illegal_parking` | จอดรถผิดกฎหมาย | 60 |
| `blocked_pedestrian_path` | ทางเดินเท้าถูกกีดขวาง | 50 |
| `unclear_sign` | ป้ายหรือเส้นจราจรไม่ชัดเจน | 45 |
| `other` | อื่น ๆ | 40 |

---

## 8. Algorithm Workflow Overview

```text
Citizen Report
→ Data Normalization
→ Privacy Check
→ AI-assisted Summary
→ Category Mapping
→ Duplicate Detection
→ Case Creation / Case Merge
→ Risk Score Calculation
→ Priority Score Calculation
→ Impact Level Mapping
→ Suggested Lead Unit
→ Case Ownership Workflow
→ SLA Tracking
→ Auto-Escalation
→ Audit Trail
→ Citizen Timeline
→ Executive Dashboard
→ Open Aggregate Data
```

---

## 9. Step-by-Step Algorithm

### Step 1: Report Ingestion

ระบบรับรายงานจากประชาชนหรือ source อื่น

Input:

- `description`
- `category`
- `lat`
- `lng`
- `photoUrl`
- `createdAt`
- `sourceSystem`

Output:

- normalized `Report`

---

### Step 2: Data Normalization

ระบบแปลงข้อมูลจากหลายแหล่งให้อยู่ใน format เดียวกัน

```text
source report → common Report schema
```

ตัวอย่าง source ในอนาคต:

- citizen form
- Traffy-like complaint system
- 1555 complaint channel
- district office report
- sensor or open data feed

---

### Step 3: Privacy Check

ระบบควรตรวจสอบข้อมูลส่วนบุคคลก่อนนำไปแสดงหรือเผยแพร่

Prototype:

- ใช้ mock data
- ไม่มีข้อมูลจริง

Production future work:

- blur face
- blur license plate
- remove phone number
- remove personal identifiers
- role-based access control

---

### Step 4: AI-assisted Summary

ระบบสร้าง summary เพื่อให้เจ้าหน้าที่อ่านง่ายขึ้น

Prototype version:

```text
rule-based template summary
```

Future version:

```text
LLM-based summary + human review
```

Example:

Input:

```text
มีรถจอดกีดขวางทางเข้ารถพยาบาลใกล้โรงพยาบาล ทำให้รถฉุกเฉินอาจล่าช้า
```

Output:

```text
มีรายงานว่ารถจอดกีดขวางทางเข้ารถพยาบาลบริเวณใกล้โรงพยาบาล อาจส่งผลให้รถฉุกเฉินเข้าถึงพื้นที่ล่าช้าและเพิ่มความเสี่ยงต่อความปลอดภัยของประชาชน
```

---

## 10. Duplicate Detection

Duplicate Detection ใช้รวมรายงานที่เป็นปัญหาเดียวกัน เพื่อลดงานซ้ำของเจ้าหน้าที่

### Prototype Conditions

รายงานใหม่จะถือว่าเป็น duplicate ของเคสเดิมเมื่อ:

1. หมวดหมู่เดียวกัน
2. เป็นเคสที่ยังเปิดอยู่
3. อยู่ในรัศมีที่กำหนดจากเคสเดิม

```text
duplicateFlag = (
  categoryMatch
  AND openCase
  AND haversine(newLat, newLng, caseLat, caseLng) <= duplicateRadius
)
```

### Suggested Parameter

| Parameter | Value |
|---|---:|
| `duplicateRadius` | 150–200 meters |

### Output

หากพบ duplicate:

```text
merge report into existing case
impactedCount = update impact proxy or estimated affected count
reporterCount += 1
update riskScore / priorityScore
add timeline event
```

หากไม่พบ duplicate:

```text
create new case
```

> ถ้า prototype ใช้จำนวนรายงานที่ถูกรวมเป็น proxy ของผลกระทบ สามารถอัปเดต `impactedCount` จากจำนวนรายงานที่ถูกรวมได้ แต่ควรระบุว่าเป็น proxy ไม่ใช่จำนวนคนจริง

---

## 11. Recurrence Detection

Recurrence Detection ใช้ตรวจว่าปัญหาเดิมเกิดซ้ำในพื้นที่เดิมหรือไม่ แม้เคสเก่าจะปิดไปแล้ว

### Conditions

```text
recurrenceFlag = (
  categoryMatch
  AND haversine(newLat, newLng, closedLat, closedLng) <= 200m
  AND daysSinceClosed <= 90
)
```

### Parameters

| Parameter | Value | Reason |
|---|---:|---|
| `recurrenceRadius` | 200 meters | ครอบคลุมพื้นที่เดิน 2–3 นาที |
| `recurrenceWindowDays` | 90 days | เหมาะกับการดูปัญหาเชิงโครงสร้างระดับเมือง |

### Output

```text
recurrenceCount = Σ(recurrenceFlag_i)
```

Recurrence จะถูกใช้ใน:

- Risk Score
- Area Risk Score
- Policy Watch Area
- Executive Dashboard

---

## 12. Risk Score Algorithm

### Purpose

Risk Score ใช้วัดว่าเหตุการณ์นี้ “อันตรายแค่ไหน” จากธรรมชาติของเหตุการณ์และบริบท

### Formula

```text
risk = baseSeverity[category]
     + (isRushHour ? 10 : 0)
     + clamp(impactedCount - 1, 0, 5) × 4
     + min(recurrenceCount, 3) × 3

risk = min(risk, 100)
```

ใน implementation สามารถเก็บผลลัพธ์เป็น:

```text
riskScore = risk
```

### Parameters

| Component | Formula | Max Contribution |
|---|---:|---:|
| `baseSeverity` | by category | 40–95 |
| Rush Hour Modifier | `isRushHour ? 10 : 0` | 10 |
| Impact Modifier | `clamp(impactedCount - 1, 0, 5) × 4` | 20 |
| Recurrence Modifier | `min(recurrenceCount, 3) × 3` | 9 |
| `riskScore` | `min(total, 100)` | 100 |

### Rush Hour Definition

```text
07:00–09:00
16:00–19:00
```

### Example

Case:

- category = `lane_blocking`
- base severity = 75
- time = 08:30
- `isRushHour = true`
- `impactedCount = 6`
- `recurrenceCount = 2`

```text
risk = 75 + 10 + clamp(6-1,0,5)×4 + min(2,3)×3
     = 75 + 10 + 20 + 6
     = 111
     = 100 after clamp
```

Final:

```text
riskScore = 100
impactLevel = สูงมาก
```

---

## 13. Priority Score Algorithm

### Purpose

Risk Score บอกว่า:

```text
เหตุการณ์นี้อันตรายแค่ไหน
```

Priority Score บอกว่า:

```text
ควรหยิบเคสไหนทำก่อน
```

Priority Score รวม:

- ความเสี่ยงของเหตุการณ์
- จำนวนผู้ได้รับผลกระทบหรือ proxy ของผลกระทบ
- จำนวนผู้แจ้งซ้ำ
- อายุของเคส
- สัญญาณจากภาพหรือหลักฐาน

### Formula

```text
impactedN  = min(impactedCount, 200) / 2
reportersN = min(reporterCount, 20) × 5
ageN       = min(ageHours, 48) × (100 / 48)
imageN     = imageSeverity ?? 30

priority = risk × 0.40
         + impactedN × 0.25
         + reportersN × 0.15
         + ageN × 0.10
         + imageN × 0.10
```

ใน implementation สามารถเก็บผลลัพธ์เป็น:

```text
priorityScore = priority
```

### Weight Explanation

| Component | Weight | Meaning |
|---|---:|---|
| Risk | 40% | ความอันตรายของเหตุการณ์มาก่อน |
| Impacted | 25% | จำนวนผู้ได้รับผลกระทบหรือ proxy ของผลกระทบในพื้นที่ |
| Reporters | 15% | จำนวนผู้แจ้งซ้ำเป็นสัญญาณยืนยันว่าปัญหายังเกิดอยู่ |
| Age | 10% | เคสที่ค้างนานควรถูกดันขึ้นคิว แต่จำกัดเพดาน 48 ชั่วโมง |
| Image | 10% | รองรับ computer vision ในอนาคต; prototype ใช้ default = 30 |

### Notes

- `imageSeverity` เป็น future work สำหรับ computer vision
- ใน prototype ใช้ default value = 30
- คะแนนทั้งหมด normalize ให้อยู่ในช่วง 0–100
- ผลรวมน้ำหนัก = 1.00

### Example

Input:

- `risk = 100`
- `impactedCount = 6`
- `reporterCount = 4`
- `ageHours = 6`
- `imageSeverity = null`, default 30

```text
impactedN  = min(6, 200) / 2        = 3
reportersN = min(4, 20) × 5         = 20
ageN       = min(6, 48) × (100/48)  ≈ 12.5
imageN     = 30

priority = 100×0.40 + 3×0.25 + 20×0.15 + 12.5×0.10 + 30×0.10
         = 40 + 0.75 + 3 + 1.25 + 3
         ≈ 48.0
```

Final:

```text
priorityScore ≈ 48
priorityLevel = ปานกลาง
```

### Why separate Risk and Priority?

ตัวอย่างนี้แสดงว่า `riskScore = 100` แต่ `priorityScore ≈ 48`

เหตุผลคือเคสมีความเสี่ยงโดยธรรมชาติสูง แต่ข้อมูล operational signal เช่นจำนวนผู้กระทบและเวลาที่ค้างยังไม่สูงมาก ระบบจึงแยก:

- `riskScore` = ความอันตรายของเหตุการณ์
- `priorityScore` = ลำดับคิวดำเนินงาน

สำหรับ SLA สามารถใช้:

```text
slaScore = max(riskScore, priorityScore)
```

เพื่อไม่ให้เคสที่อันตรายมากถูกลดความสำคัญเกินไปเพียงเพราะมีข้อมูลผู้กระทบยังน้อย

---

## 14. Impact Level Mapping

ระบบ map คะแนนเข้าสู่ 4 ระดับ เพื่อใช้เป็น badge, color, SLA และ dashboard priority

```text
impactLevel = level(score)
```

โดย `score` อาจเป็น `riskScore`, `priorityScore`, หรือ `slaScore` ตามบริบทของหน้า dashboard

| Score | Thai Level | English Level | SLA Target |
|---:|---|---|---|
| `>= 80` | สูงมาก | Critical | ภายใน 24 ชั่วโมง หรือเร็วกว่าในเคสฉุกเฉิน |
| `>= 60` | สูง | High | ภายใน 3 วัน |
| `>= 40` | ปานกลาง | Medium | ภายใน 7 วัน |
| `< 40` | ต่ำ | Low | เพิ่มในคิวและติดตามตามรอบ |

### Note

สำหรับเคสประเภทฉุกเฉิน เช่น `emergency_access_blocked` อาจกำหนด SLA สั้นกว่า 24 ชั่วโมงใน production เช่น 3–6 ชั่วโมง ขึ้นอยู่กับนโยบายของหน่วยงาน

---

## 15. Suggested Lead Unit Mapping

ระบบสามารถแนะนำหน่วยงานหลักและหน่วยงานร่วมตาม category

| Category | Suggested Lead Unit | Supporting Unit |
|---|---|---|
| `emergency_access_blocked` | หน่วยบังคับใช้กฎหมายจราจร | สำนักงานเขต / ศูนย์ฉุกเฉิน |
| `illegal_parking` | เทศกิจ / หน่วยบังคับใช้กฎหมายจราจร | สำนักงานเขต |
| `lane_blocking` | หน่วยบังคับใช้กฎหมายจราจร | สำนักงานเขต |
| `wrong_way` | ตำรวจจราจร | สำนักการจราจรและขนส่ง |
| `traffic_light_error` | หน่วยสัญญาณไฟจราจร | สำนักการจราจรและขนส่ง |
| `flood_road_disruption` | หน่วยรับมือน้ำท่วม / สำนักการระบายน้ำ | สำนักงานเขต / หน่วยจราจร |
| `blocked_pedestrian_path` | สำนักงานเขต / เทศกิจ | หน่วยงานทางเท้า |
| `unclear_sign` | หน่วยบำรุงรักษาถนน | สำนักการจราจรและขนส่ง |
| `road_obstruction` | หน่วยบำรุงรักษาถนน | สำนักงานเขต |
| `other` | ผู้ประสานงานกลาง | หน่วยงานที่เกี่ยวข้อง |

---

## 16. Case Ownership Workflow

### Purpose

Case Ownership Workflow ทำให้ทุกเคสต้องมีเจ้าภาพปัจจุบันและขั้นตอนถัดไปที่ชัดเจน

ระบบไม่ใช้คะแนนลงโทษเจ้าหน้าที่ และไม่จัดอันดับเจ้าหน้าที่

### Required Ownership Fields

| Field | Description |
|---|---|
| `leadUnit` | หน่วยงานหลัก |
| `supportingUnits` | หน่วยงานร่วม |
| `currentOwner` | ผู้รับผิดชอบปัจจุบัน |
| `nextAction` | ขั้นตอนถัดไป |
| `ownershipStatus` | สถานะการรับงาน |
| `handoffHistory` | ประวัติการส่งต่อ |
| `slaHours` | กำหนดเวลาการรับงานหรืออัปเดต |
| `escalationLevel` | ระดับการส่งต่อ |

### Ownership Status

| Status Code | Thai Label |
|---|---|
| `unassigned` | ยังไม่มีเจ้าภาพ |
| `waitingAcceptance` | รอหน่วยงานรับเคส |
| `accepted` | รับเคสแล้ว |
| `needsSupport` | ต้องการหน่วยงานร่วม |
| `transferRequested` | ขอส่งต่อ |
| `escalated` | ส่งต่อผู้ประสานงานแล้ว |
| `resolved` | ปิดเคสแล้ว |

---

## 17. Handoff Rule

เคสไม่สามารถถูกส่งต่ออย่างเงียบ ๆ ได้

หากต้องส่งต่อ ต้องมีเหตุผล

### Transfer Reason Options

- พื้นที่ไม่อยู่ในเขตรับผิดชอบ
- ต้องใช้หน่วยงานอื่นเป็นเจ้าภาพหลัก
- ต้องมีหน่วยงานร่วมก่อนดำเนินการ
- ข้อมูลไม่เพียงพอ ต้องขอข้อมูลเพิ่มเติม
- ต้องตรวจสอบภาคสนามก่อน
- เกี่ยวข้องกับโครงสร้างถนนหรือสัญญาณไฟ
- เกี่ยวข้องกับการบังคับใช้กฎหมายจราจร
- อื่น ๆ

### Rule

```text
Transfer is not completed until receiving unit accepts the case.
```

ระหว่างรอรับงาน เคสยังคงอยู่ในระบบและสามารถถูก escalate ได้หากค้างเกินกำหนด

---

## 18. Escalation Ladder

Escalation Ladder ใช้ป้องกันไม่ให้เคสค้างเงียบเมื่อไม่มีใครรับผิดชอบหรือไม่มีการอัปเดต

### Escalation Levels

| Level | Thai Label | Description |
|---:|---|---|
| 1 | หน่วยงานเจ้าของเคส | หน่วยงานหลักที่ควรดำเนินการ |
| 2 | ผู้ประสานงานกลาง | ช่วยประสานเมื่อหน่วยงานยังไม่รับหรือส่งต่อ |
| 3 | หัวหน้าหน่วยงาน | เห็นเคสที่ค้างเกินกำหนด |
| 4 | Dashboard ผู้บริหารเมือง | เห็น bottleneck ระดับเมือง |
| 5 | ภาพรวมสาธารณะแบบ aggregate | แสดงเฉพาะภาพรวม ไม่เปิดเผยข้อมูลส่วนบุคคล |

### Auto-Escalation Conditions

เคสควรถูก escalate เมื่อ:

- ไม่มี `leadUnit`
- ไม่มีการรับเคสในเวลาที่กำหนด
- ไม่มีการอัปเดตตาม SLA
- transfer request ไม่ถูก accept
- เคสเสี่ยงสูงยังไม่มีเจ้าภาพ
- เคสถูกส่งต่อหลายครั้งผิดปกติ

### Prototype Rule

```text
if currentTime > lastUpdateTime + slaHours:
    escalationLevel += 1
    add audit trail event
    show case in overdue backlog
```

---

## 19. Audit Trail Schema

Audit Trail คือบันทึกเส้นทางความรับผิดชอบของเคส

```json
{
  "eventId": "AUD-001",
  "caseId": "CASE-092",
  "timestamp": "2026-06-20T14:30:00+07:00",
  "actorType": "system",
  "actorUnit": "Abjust Auto-Escalation",
  "action": "autoEscalated",
  "reason": "ไม่มีการรับเคสภายใน 6 ชั่วโมง",
  "previousStatus": "waitingAcceptance",
  "newStatus": "escalated",
  "previousEscalationLevel": 1,
  "newEscalationLevel": 2
}
```

### Audit Trail Fields

| Field | Description |
|---|---|
| `eventId` | ID ของ event |
| `caseId` | ID ของเคส |
| `timestamp` | เวลาเกิด event |
| `actorType` | system / unit / coordinator / citizen |
| `actorUnit` | หน่วยงานหรือระบบที่ทำ action |
| `action` | action ที่เกิดขึ้น |
| `reason` | เหตุผล |
| `previousStatus` | สถานะก่อนหน้า |
| `newStatus` | สถานะใหม่ |
| `previousEscalationLevel` | ระดับก่อนหน้า |
| `newEscalationLevel` | ระดับใหม่ |

---

## 20. Citizen Timeline vs Officer Timeline

### Citizen Timeline

แสดงข้อมูลแบบเข้าใจง่าย ไม่เปิดเผยรายละเอียด internal conflict

Example:

- รับเรื่องแล้ว
- ระบบสรุปเหตุการณ์แล้ว
- มอบหมายหน่วยงานที่เกี่ยวข้อง
- อยู่ระหว่างการประสานงานเพิ่มเติม
- กำลังดำเนินการ
- แก้ไขเสร็จสิ้น

### Officer Timeline / Audit Trail

แสดงรายละเอียด workflow ภายใน

Example:

- ระบบแนะนำหน่วยงานหลัก
- หน่วยงานรับเคสแล้ว
- ส่งต่อเคสพร้อมเหตุผล
- ไม่มีการรับเคสภายใน SLA
- ระบบส่งต่อผู้ประสานงานกลาง
- หัวหน้าหน่วยงานเห็นเคส
- อัปเดตขั้นตอนถัดไป
- ปิดเคสแล้ว

---

## 21. Area Insight Schema

Area Insight ใช้สำหรับ Dashboard ผู้บริหารเมือง เช่น map, heatmap, hotspot, policy watch

```json
{
  "areaId": "AREA-001",
  "areaName": "เขตปทุมวัน",
  "centerLat": 13.7449,
  "centerLng": 100.533,
  "totalCases": 42,
  "recurringCases": 12,
  "averageRiskScore": 76,
  "maxRiskScore": 95,
  "maxRiskInLast90Days": 95,
  "mergedReportsInArea": 68,
  "avgMergedReports": 4,
  "closureRate": 0.8,
  "avgTimeToClose": 18,
  "overdueCases": 6,
  "escalatedCases": 4,
  "topCategory": "emergency_access_blocked",
  "riskAreaScore": 82,
  "policyWatchScore": 61,
  "areaLevel": "พื้นที่เสี่ยงสูงมาก",
  "recommendedAction": "ควรตรวจสอบเชิงโครงสร้างและจัดลำดับความสำคัญเร่งด่วน"
}
```

---

## 22. Recency Weight and Weighted Recurrence

ระบบให้น้ำหนักกับเหตุการณ์ที่เกิดใกล้ปัจจุบันมากกว่า เพราะสะท้อนสภาพปัจจุบันของพื้นที่ได้ดีกว่า

ถ้าต้องการ half-life ประมาณ 30 วัน ใช้:

```text
recencyWeight_i = exp(-ln(2) × daysAgo_i / 30)
```

Meaning:

```text
daysAgo = 0    → weight = 1.00
daysAgo = 30   → weight ≈ 0.50
daysAgo = 60   → weight ≈ 0.25
daysAgo = 90   → weight ≈ 0.125
```

แล้วคำนวณความรุนแรงเฉลี่ยแบบถ่วงน้ำหนัก:

```text
weightedRecurrence =
  Σ(recencyWeight_i × severity_i) / Σ(recencyWeight_i)
```

---

## 23. Risk Area Score

Risk Area Score ใช้ประเมินพื้นที่ที่มีปัญหาซ้ำและรุนแรง

### Formula

```text
riskAreaScore =
  min(recurrenceCount, 8) × 8
  + weightedRecurrence × 0.25
  + maxRiskInLast90Days × 0.15
  + (mergedReportsInArea / 5) × 2

riskAreaScore = min(riskAreaScore, 100)
```

### Components

| Component | Meaning |
|---|---|
| `recurrenceCount` | จำนวนครั้งที่ปัญหาเกิดซ้ำ |
| `weightedRecurrence` | ค่าเฉลี่ยความรุนแรงแบบถ่วงน้ำหนักตามความใหม่ |
| `maxRiskInLast90Days` | risk score สูงสุดใน 90 วันล่าสุด |
| `mergedReportsInArea` | จำนวนรายงานที่ถูกรวมในพื้นที่ |

### Risk Area Level

| Score | Level | Recommended Action |
|---:|---|---|
| `>= 75` | พื้นที่เสี่ยงสูงมาก | ตรวจสอบเชิงโครงสร้าง / นโยบายด่วน |
| `>= 55` | พื้นที่เสี่ยงสูง | มาตรการป้องกันเฉพาะจุด |
| `>= 35` | พื้นที่เสี่ยงปานกลาง | ติดตามและเพิ่มการลาดตระเวน |
| `< 35` | พื้นที่เสี่ยงต่ำ | บันทึกไว้และติดตามตามรอบ |

---

## 24. Policy Watch Area

Policy Watch Area ใช้จับพื้นที่ที่อาจไม่ได้เสี่ยงมากในแต่ละครั้ง แต่มีรูปแบบซ้ำซากจนควรติดตามเชิงนโยบาย

### Formula

```text
policyWatchScore =
  min(recurrenceCount, 10) × 5
  + avgMergedReports × 3
  + closureRate × 20

policyWatchScore = min(policyWatchScore, 100)
```

### Important Note on `closureRate`

ในสูตรนี้ `closureRate` ไม่ได้หมายถึงการให้รางวัลกับการปิดเคสเร็ว แต่ใช้เป็นสัญญาณว่า:

```text
เคสถูกปิดแล้ว แต่ปัญหายังกลับมาเกิดซ้ำ
```

ดังนั้นในบริบทนี้ `closureRate` ควรถูกตีความเป็น **closed-but-recurring signal** หรือสัญญาณว่า reactive closure อาจยังไม่แก้ที่ต้นตอ

### Classification

```text
isPolicyWatch = (
  recurrenceCount >= 3
  AND policyWatchScore >= 40
  AND riskAreaScore < 55
  AND avgTimeToClose > 14
)
```

### Policy Watch Level

| Score | Level | Meaning |
|---:|---|---|
| `>= 70` | ติดตามด่วน | ควรตรวจสอบกฎระเบียบหรือโครงสร้าง |
| `>= 50` | ติดตาม | ควรประเมินนโยบายปัจจุบัน |
| `>= 35` | เฝ้าระวัง | รอข้อมูลเพิ่มเติม |
| `< 35` | ไม่ต้องดำเนินการเชิงนโยบาย | เป็นปัญหาเฉพาะกรณี |

---

## 25. Area Example

จุด A: “จอดรถผิดกฎหมายหน้าตลาด”

- เกิดซ้ำ 5 ครั้งใน 90 วัน
- risk เฉลี่ย ≈ 55
- รายงานถูกรวมเฉลี่ย 4 ครั้งต่อเคส
- ปิดเคสใช้เวลาเฉลี่ย 18 วัน
- `closureRate = 0.8`

```text
recurrenceCount = 5
weightedRecurrence ≈ 55
maxRiskInLast90Days = 55
mergedReportsInArea = 5 × 4 = 20
avgMergedReports = 4
avgTimeToClose = 18
```

### Risk Area Score

```text
riskAreaScore =
  min(5,8)×8
  + 55×0.25
  + 55×0.15
  + (20/5)×2

riskAreaScore =
  40 + 13.75 + 8.25 + 8
  = 70.0
```

Result:

```text
พื้นที่เสี่ยงสูง
```

### Policy Watch Score

```text
policyWatchScore =
  min(5,10)×5
  + 4×3
  + 0.8×20

policyWatchScore =
  25 + 12 + 16
  = 53.0
```

Result:

```text
ติดตามเชิงนโยบาย
```

### Interpretation

จุดนี้เป็นทั้ง:

```text
พื้นที่เสี่ยงสูง
พื้นที่ติดตามเชิงนโยบาย
```

Recommended action:

```text
เพิ่มการตรวจตราหรือบังคับใช้กฎหมายในระยะสั้น
+
ศึกษาการจัดที่จอดรถ ป้ายกำกับ หรือเวลาห้ามจอดในระยะยาว
```

Avoid wording such as “ลงโทษ” because Abjust is designed as a non-punitive workflow transparency system.

---

## 26. Executive Dashboard Metrics

Dashboard ผู้บริหารเมืองควรแสดงข้อมูลระดับ aggregate เช่น:

| Metric | Description |
|---|---|
| `totalCases` | จำนวนเคสทั้งหมด |
| `highRiskCases` | จำนวนเคสความเสี่ยงสูง |
| `recurringHotspots` | จำนวนจุดปัญหาซ้ำ |
| `overdueCases` | จำนวนเคสค้างเกิน SLA |
| `escalatedCases` | จำนวนเคสที่ถูก escalate |
| `avgTimeToAccept` | เวลาเฉลี่ยในการรับเคส |
| `avgTimeToUpdate` | เวลาเฉลี่ยในการอัปเดต |
| `avgTimeToClose` | เวลาเฉลี่ยในการปิดเคส |
| `topCategories` | หมวดปัญหาที่พบบ่อย |
| `topRiskAreas` | พื้นที่เสี่ยงสูงสุด |
| `policyWatchAreas` | พื้นที่ควรติดตามเชิงนโยบาย |

---

## 27. API Design

### `GET /api/categories`

Returns all report categories and base severity.

### `POST /api/reports`

Creates a report, detects duplicate case, calculates scores, and returns case result.

Request:

```json
{
  "category": "emergency_access_blocked",
  "description": "มีรถจอดกีดขวางทางเข้ารถพยาบาล",
  "lat": 13.7307,
  "lng": 100.536,
  "photoUrl": null
}
```

Response:

```json
{
  "caseId": "CASE-092",
  "merged": true,
  "aiSummary": "มีรายงานหลายครั้งว่ารถจอดกีดขวางทางเข้ารถพยาบาล",
  "riskScore": 92,
  "priorityScore": 88,
  "impactLevel": "สูงมาก",
  "impactedCount": 18,
  "status": "waitingAcceptance",
  "suggestedLeadUnit": "หน่วยบังคับใช้กฎหมายจราจร"
}
```

### Endpoint List

| Endpoint | Purpose |
|---|---|
| `GET /api/cases` | Returns case list for dashboard |
| `GET /api/cases/{caseId}` | Returns full case detail |
| `POST /api/cases/{caseId}/status` | Updates case status |
| `POST /api/cases/{caseId}/ownership` | Updates ownership fields |
| `POST /api/cases/{caseId}/escalate` | Triggers or simulates escalation |
| `GET /api/analytics` | Returns city-level analytics |
| `GET /api/areas` | Returns map area insights |

---

## 28. Demo Case

### Emergency Access Blocked

```json
{
  "caseId": "RW-EMG-092",
  "title": "รถจอดกีดขวางทางเข้ารถพยาบาลใกล้โรงพยาบาลจุฬาลงกรณ์",
  "category": "emergency_access_blocked",
  "categoryTh": "กีดขวางทางรถฉุกเฉิน",
  "location": "ถนนพระราม 4 ใกล้โรงพยาบาลจุฬาลงกรณ์",
  "riskScore": 92,
  "priorityScore": 88,
  "impactLevel": "สูงมาก",
  "impactedCount": 18,
  "recurrenceCount": 3,
  "suggestedLeadUnit": "หน่วยบังคับใช้กฎหมายจราจร",
  "supportingUnits": ["สำนักงานเขต"],
  "ownershipStatus": "รอหน่วยงานรับเคส",
  "slaHours": 6,
  "escalationLevel": 1,
  "nextAction": "ตรวจสอบพื้นที่และประสานการเคลื่อนย้ายรถที่กีดขวางทางฉุกเฉิน"
}
```

### Demo Flow

```text
1. Citizen submits emergency access blocked report
2. System generates AI-assisted summary
3. System detects duplicate reports nearby
4. System calculates Risk Score and Priority Score
5. System suggests Lead Unit
6. Case waits for ownership acceptance
7. If no unit accepts within SLA, system auto-escalates
8. Audit Trail records every step
9. Citizen sees simple timeline
10. Executive dashboard sees hotspot if issue recurs
```

---

## 29. Governance and Ethics

### AI Use

- AI/rule-based system is decision support only
- Human officers remain final decision-makers
- Scoring must be explainable
- Avoid black-box decision-making for public services

### Officer Accountability

This system does not:

- rank officers
- punish officers with points
- publicly shame departments
- assign blame automatically

This system does:

- show workflow bottlenecks
- keep audit trail
- prevent silent abandonment
- clarify current owner
- show next action
- escalate delayed cases

### Citizen Privacy

Public dashboards should not expose:

- citizen identity
- personal phone numbers
- exact private evidence
- raw photos
- license plates
- faces

---

## 30. Future Work

- Real authentication
- Role-based access control
- Real API integration with city systems
- LLM summary generation
- Computer vision for photo classification
- Face/license plate blur
- LINE OA notification
- Geospatial clustering
- Real-time dashboard
- Open data export
- Pilot district testing
- Evaluation with real officers

---

## 31. Glossary

| Term | Meaning |
|---|---|
| Traffic-Risk Intelligence Layer | ชั้นวิเคราะห์และจัดการความเสี่ยงบนระบบรายงานเดิม |
| Report | รายงานจากประชาชน 1 ครั้ง |
| Case | เคสที่รวมรายงานที่เกี่ยวข้อง |
| Risk Score | คะแนนความเสี่ยงของเหตุการณ์ |
| Priority Score | คะแนนจัดลำดับคิวดำเนินงาน |
| Impacted Count | จำนวนผู้ได้รับผลกระทบโดยประมาณ หรือ proxy ของผลกระทบ |
| Reporter Count | จำนวนผู้แจ้งซ้ำหรือรายงานยืนยัน |
| Recurrence | การเกิดซ้ำของปัญหาเดิมในพื้นที่ |
| Case Ownership | การกำหนดเจ้าภาพเคส |
| Escalation Ladder | การส่งต่อเป็นลำดับขั้นเมื่อเคสค้าง |
| Audit Trail | บันทึกเส้นทางความรับผิดชอบ |
| Risk Area | พื้นที่เสี่ยงจากปัญหาซ้ำและรุนแรง |
| Policy Watch Area | พื้นที่ที่ควรติดตามเชิงนโยบาย |

---

## 32. License and Data Notice

This repository is released for civic-tech learning and hackathon demonstration.

All datasets included in this repository must be mock, synthetic, anonymized, or aggregate.

Do not commit real personal data.
Do not commit API keys.
Do not commit private government data.

Recommended license:

```text
MIT License
```
