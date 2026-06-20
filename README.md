# Open Data & Algorithm Documentation

เอกสารนี้อธิบายโครงสร้างข้อมูล พารามิเตอร์ คะแนนความเสี่ยง และ workflow algorithm ของ **Abjust — Bangkok Traffic Risk Triage** สำหรับการเปิดเผยแบบ open source

> หมายเหตุ: เอกสารนี้ใช้สำหรับ prototype และการสาธิตใน hackathon เท่านั้น ข้อมูลทั้งหมดใน repo ควรเป็น mock data หรือข้อมูลจำลอง ไม่ควรมีข้อมูลประชาชนจริง

---

## 1. Purpose

Abjust ถูกออกแบบเป็น **Traffic-Risk Intelligence Layer** สำหรับช่วยจัดการรายงานปัญหาจราจรในกรุงเทพฯ โดยทำหน้าที่เสริมระบบรายงานเดิม ไม่ใช่แทนที่ระบบเดิม

ระบบช่วยเปลี่ยนรายงานของประชาชนให้กลายเป็นเคสที่:

* สรุปได้ชัดเจน
* จัดลำดับความเสี่ยงได้
* รวมรายงานซ้ำได้
* มีหน่วยงานดูเเลเคส
* ติดตามสถานะได้
* ส่งต่อเคสไปยังscaleที่สูงขึ้นเมื่อค้างเกินกำหนด
* ใช้เป็นข้อมูลเชิงพื้นที่สำหรับผู้บริหารเมืองได้

---

## 2. Open Source Data Scope

### 2.1 ข้อมูลที่เปิดเผยได้

Repository นี้สามารถเปิดเผย:

* source code
* mock data
* API schema
* scoring logic
* algorithm workflow
* dashboard template
* documentation
* sample reports
* sample cases
* anonymized aggregate data examples

### 2.2 ข้อมูลที่ไม่ควรเปิดเผย

ห้ามเปิดเผยข้อมูลต่อไปนี้ใน repo:

* ชื่อประชาชนจริง
* เบอร์โทรศัพท์
* เลขบัตรประชาชน
* ภาพที่เห็นใบหน้าหรือป้ายทะเบียนจริง
* พิกัดที่ผูกกับข้อมูลส่วนบุคคลจริง
* officer internal notes ที่เป็นข้อมูลลับ
* API keys
* `.env`
* access tokens
* private government data
* raw database ที่มีข้อมูลจริง

### 2.3 หลักการ Open Data

หากพัฒนาต่อเป็นระบบจริง ข้อมูลที่เปิดเผยต่อสาธารณะควรอยู่ในระดับ:

* aggregate
* anonymized
* district-level หรือ area-level
* no personal identifiers
* no raw evidence images
* no exact private report details

ตัวอย่างข้อมูลที่เปิดเผยได้:

* จำนวนเคสต่อเขต
* จำนวนเคสตามประเภทปัญหา
* ค่าเฉลี่ย Risk Score ต่อพื้นที่
* จำนวนเคสค้างเกิน SLA
* จุด hotspot แบบไม่เปิดเผยผู้แจ้ง
* เวลาเฉลี่ยในการอัปเดตสถานะ
* สัดส่วนเคสที่ปิดแล้ว

---

## 3. Core Data Objects

ระบบใช้ข้อมูลหลัก 4 ประเภท:

1. Report
2. Case
3. Timeline Event
4. Area Insight

---

## 4. Report Schema

`Report` คือรายงานที่ประชาชนส่งเข้ามา 1 ครั้ง

```json
{
  "report_id": "RPT-001",
  "source_system": "prototype",
  "category": "emergency_access_blocked",
  "description": "มีรถจอดกีดขวางทางเข้ารถพยาบาลใกล้โรงพยาบาล",
  "lat": 13.7307,
  "lng": 100.5360,
  "photo_url": null,
  "created_at": "2026-06-20T08:30:00+07:00",
  "reporter_count": 1,
  "privacy_status": "mock_data"
}
```

### Report Parameters

| Field            | Type        | Description                                               |
| ---------------- | ----------- | --------------------------------------------------------- |
| `report_id`      | string      | ID ของรายงาน                                              |
| `source_system`  | string      | แหล่งที่มาของรายงาน เช่น prototype, Traffy-like API, BMA1555 |
| `category`       | string      | ประเภทปัญหาจราจร                                          |
| `description`    | string      | รายละเอียดจากประชาชน                                      |
| `lat`            | number      | latitude                                                  |
| `lng`            | number      | longitude                                                 |
| `photo_url`      | string/null | URL รูปภาพหลักฐาน ถ้ามี                                   |
| `created_at`     | datetime    | เวลาที่ส่งรายงาน                                          |
| `reporter_count` | number      | จำนวนผู้แจ้งซ้ำหรือจำนวนรายงานจากคนละผู้แจ้ง              |
| `privacy_status` | string      | สถานะข้อมูล เช่น mock_data, anonymized, private           |

---

## 5. Case Schema

`Case` คือเคสที่ระบบสร้างขึ้นจากรายงาน อาจมีรายงานเดียวหรือหลายรายงานที่ถูกรวมกัน

```json
{
  "case_id": "CASE-092",
  "category": "emergency_access_blocked",
  "category_th": "กีดขวางทางรถฉุกเฉิน",
  "ai_summary": "มีรายงานหลายครั้งว่ารถจอดกีดขวางทางเข้ารถพยาบาลบริเวณใกล้โรงพยาบาลจุฬาลงกรณ์",
  "lat": 13.7307,
  "lng": 100.5360,
  "risk_score": 92,
  "priority_score": 88,
  "impact_level": "สูงมาก",
  "status": "reviewing",
  "grouped_report_count": 18,
  "reporter_count": 12,
  "recurrence_count": 3,
  "lead_unit": "หน่วยบังคับใช้กฎหมายจราจร",
  "supporting_units": ["สำนักงานเขต"],
  "current_owner": "หน่วยบังคับใช้กฎหมายจราจร",
  "next_action": "ตรวจสอบพื้นที่และประสานการเคลื่อนย้ายรถที่กีดขวางทางฉุกเฉิน",
  "sla_hours": 6,
  "escalation_level": 1,
  "created_at": "2026-06-20T08:30:00+07:00",
  "updated_at": "2026-06-20T09:10:00+07:00"
}
```

### Case Parameters

| Field                  | Type     | Description                            |
| ---------------------- | -------- | -------------------------------------- |
| `case_id`              | string   | ID ของเคส                              |
| `category`             | string   | ประเภทปัญหาแบบ code                    |
| `category_th`          | string   | ประเภทปัญหาเป็นภาษาไทย                 |
| `ai_summary`           | string   | สรุปเหตุการณ์โดยระบบ                   |
| `lat` / `lng`          | number   | พิกัดหลักของเคส                        |
| `risk_score`           | number   | คะแนนความเสี่ยง 0–100                  |
| `priority_score`       | number   | คะแนนจัดลำดับคิว 0–100                 |
| `impact_level`         | string   | สูงมาก / สูง / ปานกลาง / ต่ำ           |
| `status`               | string   | สถานะ workflow                         |
| `grouped_report_count` | number   | จำนวนรายงานที่ถูกรวมในเคสนี้           |
| `reporter_count`       | number   | จำนวนผู้แจ้งหรือจำนวนรายงานซ้ำ         |
| `recurrence_count`     | number   | จำนวนครั้งที่ปัญหาเดิมเกิดซ้ำในพื้นที่ |
| `lead_unit`            | string   | หน่วยงานหลัก                           |
| `supporting_units`     | array    | หน่วยงานร่วม                           |
| `current_owner`        | string   | เจ้าภาพปัจจุบัน                        |
| `next_action`          | string   | ขั้นตอนถัดไป                           |
| `sla_hours`            | number   | เวลาที่ควรรับเคสหรืออัปเดต             |
| `escalation_level`     | number   | ระดับการส่งต่อ                         |
| `created_at`           | datetime | เวลาสร้างเคส                           |
| `updated_at`           | datetime | เวลาอัปเดตล่าสุด                       |

---

## 6. Category List

| Code                       |                 Thai Label | Base Severity |
| -------------------------- | -------------------------: | ------------: |
| `emergency_access_blocked` |        กีดขวางทางรถฉุกเฉิน |            95 |
| `wrong_way`                |                  ขับย้อนศร |            85 |
| `traffic_light_error`      |       สัญญาณไฟจราจรผิดปกติ |            80 |
| `flood_road_disruption`    |    น้ำท่วมถนนกระทบการจราจร |            78 |
| `lane_blocking`            |           จอดขวางช่องจราจร |            75 |
| `shoulder_driving`         |                 ขับไหล่ทาง |            70 |
| `road_obstruction`         |           สิ่งกีดขวางบนถนน |            70 |
| `sidewalk_parking`         |               จอดบนทางเท้า |            65 |
| `illegal_parking`          |             จอดรถผิดกฎหมาย |            60 |
| `blocked_pedestrian_path`  |      ทางเดินเท้าถูกกีดขวาง |            50 |
| `unclear_sign`             | ป้ายหรือเส้นจราจรไม่ชัดเจน |            45 |
| `other`                    |                     อื่น ๆ |            40 |

---

## 7. Important Naming Note

ใน prototype บางเวอร์ชันอาจใช้ตัวแปรเดิมชื่อ:

```text
impacted_count
```

แต่หากระบบยังไม่ได้วัดจำนวน “คนที่ได้รับผลกระทบจริง” ให้ตีความตัวแปรนี้เป็น:

```text
grouped_report_count
```

หรือ:

```text
จำนวนรายงานที่ถูกรวม
```

ไม่ควรแสดงใน UI ว่า:

```text
จำนวนผู้ได้รับผลกระทบ
```

ยกเว้นในอนาคตมีการคำนวณหรือเชื่อมข้อมูลที่สามารถ estimate จำนวนผู้ได้รับผลกระทบได้จริง

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

* description
* category
* lat/lng
* photo/evidence
* timestamp
* source system

Output:

* normalized report object

---

### Step 2: Data Normalization

ระบบแปลงข้อมูลจากหลายแหล่งให้อยู่ใน format เดียวกัน

```text
source report → common report schema
```

ตัวอย่าง source ในอนาคต:

* citizen form
* Traffy-like complaint system
* 1555 complaint channel
* district office report
* sensor or open data feed

---

### Step 3: Privacy Check

ระบบควรตรวจสอบข้อมูลส่วนบุคคลก่อนนำไปแสดงหรือเผยแพร่

Prototype:

* ใช้ mock data
* ไม่มีข้อมูลจริง

Production future work:

* blur face
* blur license plate
* remove phone number
* remove personal identifiers
* role-based access control

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

| Parameter         |          Value |
| ----------------- | -------------: |
| `duplicateRadius` | 150–200 meters |

### Output

หากพบ duplicate:

```text
merge report into existing case
grouped_report_count += 1
update risk_score / priority_score
add timeline event
```

หากไม่พบ duplicate:

```text
create new case
```

---

## 11. Recurrence Detection

Recurrence Detection ใช้ตรวจว่าปัญหาเดิมเกิดซ้ำในพื้นที่เดิมหรือไม่ แม้เคสเก่าจะปิดไปแล้ว

### Conditions

```text
recurrenceFlag = (
  categoryMatch
  AND haversine(newLat, newLng, closedCaseLat, closedCaseLng) <= 200m
  AND daysSinceClosed <= 90
)
```

### Parameters

| Parameter          |      Value | Reason                                    |
| ------------------ | ---------: | ----------------------------------------- |
| `recurrenceRadius` | 200 meters | ครอบคลุมพื้นที่เดิน 2–3 นาที              |
| `recurrenceWindow` |    90 days | เหมาะกับการดูปัญหาเชิงโครงสร้างระดับเมือง |

### Output

```text
recurrence_count = number of matching closed cases
```

Recurrence จะถูกใช้ใน:

* Risk Score
* Area Risk Score
* Policy Watch Area
* Executive Dashboard

---

## 12. Risk Score Algorithm

### Purpose

Risk Score ใช้วัดว่าเหตุการณ์นี้ “อันตรายแค่ไหน” จากธรรมชาติของเหตุการณ์และบริบท

### Formula

```text
risk = baseSeverity[category]
     + rushHourBonus
     + groupedReportBonus
     + recurrenceBonus

risk = min(risk, 100)
```

### Parameters

| Component            |                                     Formula | Max Contribution |
| -------------------- | ------------------------------------------: | ---------------: |
| `baseSeverity`       |                                 by category |            40–95 |
| `rushHourBonus`      |                       `isRushHour ? 10 : 0` |               10 |
| `groupedReportBonus` | `clamp(grouped_report_count - 1, 0, 5) × 4` |               20 |
| `recurrenceBonus`    |              `min(recurrence_count, 3) × 3` |                9 |
| `risk`               |                           `min(total, 100)` |              100 |

### Rush Hour Definition

```text
07:00–09:00
16:00–19:00
```

### Example

Case:

* category = `lane_blocking`
* base severity = 75
* time = 08:30
* grouped report count = 6
* recurrence count = 2

```text
risk = 75 + 10 + clamp(6-1,0,5)×4 + min(2,3)×3
     = 75 + 10 + 20 + 6
     = 111
     = 100 after clamp
```

Final:

```text
Risk Score = 100
Impact Level = สูงมาก
```

---

## 13. Priority Score Algorithm

### Purpose

Risk Score บอกว่า “อันตรายแค่ไหน”

Priority Score บอกว่า “ควรหยิบเคสไหนทำก่อน”

Priority Score รวม:

* ความเสี่ยงของเหตุการณ์
* จำนวนรายงานที่ถูกรวม
* จำนวนผู้แจ้งซ้ำ
* อายุของเคส
* สัญญาณจากภาพหรือหลักฐาน

### Formula

```text
groupedReportN = min(grouped_report_count, 20) × 5
reportersN     = min(reporter_count, 20) × 5
ageN           = min(age_hours, 48) × (100 / 48)
imageN         = image_severity ?? 30

priority = risk × 0.40
         + groupedReportN × 0.25
         + reportersN × 0.15
         + ageN × 0.10
         + imageN × 0.10
```

### Weight Explanation

| Component       | Weight | Meaning                    |
| --------------- | -----: | -------------------------- |
| Risk Score      |    40% | เหตุการณ์อันตรายแค่ไหน     |
| Grouped Reports |    25% | มีรายงานซ้ำมากแค่ไหน       |
| Reporters       |    15% | มีหลายคนยืนยันปัญหาหรือไม่ |
| Case Age        |    10% | ค้างในระบบนานแค่ไหน        |
| Image Severity  |    10% | ความรุนแรงจากหลักฐานภาพ    |

### Notes

* `image_severity` เป็น future work สำหรับ computer vision
* ใน prototype ใช้ default value = 30
* คะแนนทั้งหมด normalize ให้อยู่ในช่วง 0–100

### Example

Input:

* risk = 100
* grouped_report_count = 6
* reporter_count = 4
* age_hours = 6
* image_severity = null, default 30

```text
groupedReportN = min(6,20)×5 = 30
reportersN     = min(4,20)×5 = 20
ageN           = min(6,48)×(100/48) ≈ 12.5
imageN         = 30

priority = 100×0.40 + 30×0.25 + 20×0.15 + 12.5×0.10 + 30×0.10
         = 40 + 7.5 + 3 + 1.25 + 3
         = 54.75
```

Final:

```text
Priority Score ≈ 55
```

---

## 14. Impact Level Mapping

ระบบ map คะแนนเข้าสู่ 4 ระดับ เพื่อใช้เป็น badge, color, SLA และ dashboard priority

|   Score | Thai Level | English Level | SLA Target                                |
| ------: | ---------- | ------------- | ----------------------------------------- |
| `>= 80` | สูงมาก     | Critical      | ภายใน 24 ชั่วโมง หรือเร็วกว่าในเคสฉุกเฉิน |
| `>= 60` | สูง        | High          | ภายใน 3 วัน                               |
| `>= 40` | ปานกลาง    | Medium        | ภายใน 7 วัน                               |
|  `< 40` | ต่ำ        | Low           | เพิ่มในคิวและติดตามตามรอบ                 |

### Note

สำหรับเคสประเภทฉุกเฉิน เช่น `emergency_access_blocked` อาจกำหนด SLA สั้นกว่า 24 ชั่วโมงใน production เช่น 3–6 ชั่วโมง ขึ้นอยู่กับนโยบายของหน่วยงาน

---

## 15. Suggested Lead Unit Mapping

ระบบสามารถแนะนำหน่วยงานหลักและหน่วยงานร่วมตาม category

| Category                   | Suggested Lead Unit                   | Supporting Unit            |
| -------------------------- | ------------------------------------- | -------------------------- |
| `emergency_access_blocked` | หน่วยบังคับใช้กฎหมายจราจร             | สำนักงานเขต / ศูนย์ฉุกเฉิน |
| `illegal_parking`          | เทศกิจ / หน่วยบังคับใช้กฎหมายจราจร    | สำนักงานเขต                |
| `lane_blocking`            | หน่วยบังคับใช้กฎหมายจราจร             | สำนักงานเขต                |
| `wrong_way`                | ตำรวจจราจร                            | สำนักการจราจรและขนส่ง      |
| `traffic_light_error`      | หน่วยสัญญาณไฟจราจร                    | สำนักการจราจรและขนส่ง      |
| `flood_road_disruption`    | หน่วยรับมือน้ำท่วม / สำนักการระบายน้ำ | สำนักงานเขต / หน่วยจราจร   |
| `blocked_pedestrian_path`  | สำนักงานเขต / เทศกิจ                  | หน่วยงานทางเท้า            |
| `unclear_sign`             | หน่วยบำรุงรักษาถนน                    | สำนักการจราจรและขนส่ง      |
| `road_obstruction`         | หน่วยบำรุงรักษาถนน                    | สำนักงานเขต                |
| `other`                    | ผู้ประสานงานกลาง                      | หน่วยงานที่เกี่ยวข้อง      |

---

## 16. Case Ownership Workflow

### Purpose

Case Ownership Workflow ทำให้ทุกเคสต้องมีเจ้าภาพปัจจุบันและขั้นตอนถัดไปที่ชัดเจน

ระบบไม่ใช้คะแนนลงโทษเจ้าหน้าที่ และไม่จัดอันดับเจ้าหน้าที่

### Required Ownership Fields

| Field              | Description                  |
| ------------------ | ---------------------------- |
| `lead_unit`        | หน่วยงานหลัก                 |
| `supporting_units` | หน่วยงานร่วม                 |
| `current_owner`    | ผู้รับผิดชอบปัจจุบัน         |
| `next_action`      | ขั้นตอนถัดไป                 |
| `ownership_status` | สถานะการรับงาน               |
| `handoff_history`  | ประวัติการส่งต่อ             |
| `sla_hours`        | กำหนดเวลาการรับงานหรืออัปเดต |
| `escalation_level` | ระดับการส่งต่อ               |

### Ownership Status

| Status Code          | Thai Label             |
| -------------------- | ---------------------- |
| `unassigned`         | ยังไม่มีเจ้าภาพ        |
| `waiting_acceptance` | รอหน่วยงานรับเคส       |
| `accepted`           | รับเคสแล้ว             |
| `needs_support`      | ต้องการหน่วยงานร่วม    |
| `transfer_requested` | ขอส่งต่อ               |
| `escalated`          | ส่งต่อผู้ประสานงานแล้ว |
| `resolved`           | ปิดเคสแล้ว             |

---

## 17. Handoff Rule

เคสไม่สามารถถูกส่งต่ออย่างเงียบ ๆ ได้

หากต้องส่งต่อ ต้องมีเหตุผล

### Transfer Reason Options

* พื้นที่ไม่อยู่ในเขตรับผิดชอบ
* ต้องใช้หน่วยงานอื่นเป็นเจ้าภาพหลัก
* ต้องมีหน่วยงานร่วมก่อนดำเนินการ
* ข้อมูลไม่เพียงพอ ต้องขอข้อมูลเพิ่มเติม
* ต้องตรวจสอบภาคสนามก่อน
* เกี่ยวข้องกับโครงสร้างถนนหรือสัญญาณไฟ
* เกี่ยวข้องกับการบังคับใช้กฎหมายจราจร
* อื่น ๆ

### Rule

```text
Transfer is not completed until receiving unit accepts the case.
```

ระหว่างรอรับงาน เคสยังคงอยู่ในระบบและสามารถถูก escalate ได้หากค้างเกินกำหนด

---

## 18. Escalation Ladder

Escalation Ladder ใช้ป้องกันไม่ให้เคสค้างเงียบเมื่อไม่มีใครรับผิดชอบหรือไม่มีการอัปเดต

### Escalation Levels

| Level | Thai Label                 | Description                                |
| ----: | -------------------------- | ------------------------------------------ |
|     1 | หน่วยงานเจ้าของเคส         | หน่วยงานหลักที่ควรดำเนินการ                |
|     2 | ผู้ประสานงานกลาง           | ช่วยประสานเมื่อหน่วยงานยังไม่รับหรือส่งต่อ |
|     3 | หัวหน้าหน่วยงาน            | เห็นเคสที่ค้างเกินกำหนด                    |
|     4 | Dashboard ผู้บริหารเมือง   | เห็น bottleneck ระดับเมือง                 |
|     5 | ภาพรวมสาธารณะแบบ aggregate | แสดงเฉพาะภาพรวม ไม่เปิดเผยข้อมูลส่วนบุคคล  |

### Auto-Escalation Conditions

เคสควรถูก escalate เมื่อ:

* ไม่มี lead owner
* ไม่มีการรับเคสในเวลาที่กำหนด
* ไม่มีการอัปเดตตาม SLA
* transfer request ไม่ถูก accept
* เคสเสี่ยงสูงยังไม่มีเจ้าภาพ
* เคสถูกส่งต่อหลายครั้งผิดปกติ

### Prototype Rule

```text
if current_time > last_update_time + sla_hours:
    escalation_level += 1
    add audit trail event
    show case in overdue backlog
```

---

## 19. Audit Trail Schema

Audit Trail คือบันทึกเส้นทางความรับผิดชอบของเคส

```json
{
  "event_id": "AUD-001",
  "case_id": "CASE-092",
  "timestamp": "2026-06-20T14:30:00+07:00",
  "actor_type": "system",
  "actor_unit": "Abjust Auto-Escalation",
  "action": "auto_escalated",
  "reason": "ไม่มีการรับเคสภายใน 6 ชั่วโมง",
  "previous_status": "waiting_acceptance",
  "new_status": "escalated",
  "previous_escalation_level": 1,
  "new_escalation_level": 2
}
```

### Audit Trail Fields

| Field                       | Description                           |
| --------------------------- | ------------------------------------- |
| `event_id`                  | ID ของ event                          |
| `case_id`                   | ID ของเคส                             |
| `timestamp`                 | เวลาเกิด event                        |
| `actor_type`                | system / unit / coordinator / citizen |
| `actor_unit`                | หน่วยงานหรือระบบที่ทำ action          |
| `action`                    | action ที่เกิดขึ้น                    |
| `reason`                    | เหตุผล                                |
| `previous_status`           | สถานะก่อนหน้า                         |
| `new_status`                | สถานะใหม่                             |
| `previous_escalation_level` | ระดับก่อนหน้า                         |
| `new_escalation_level`      | ระดับใหม่                             |

---

## 20. Citizen Timeline vs Officer Timeline

### Citizen Timeline

แสดงข้อมูลแบบเข้าใจง่าย ไม่เปิดเผยรายละเอียด internal conflict

Example:

* รับเรื่องแล้ว
* ระบบสรุปเหตุการณ์แล้ว
* มอบหมายหน่วยงานที่เกี่ยวข้อง
* อยู่ระหว่างการประสานงานเพิ่มเติม
* กำลังดำเนินการ
* แก้ไขเสร็จสิ้น

### Officer Timeline / Audit Trail

แสดงรายละเอียด workflow ภายใน

Example:

* ระบบแนะนำหน่วยงานหลัก
* หน่วยงานรับเคสแล้ว
* ส่งต่อเคสพร้อมเหตุผล
* ไม่มีการรับเคสภายใน SLA
* ระบบส่งต่อผู้ประสานงานกลาง
* หัวหน้าหน่วยงานเห็นเคส
* อัปเดตขั้นตอนถัดไป
* ปิดเคสแล้ว

---

## 21. Area Insight Schema

Area Insight ใช้สำหรับ Dashboard ผู้บริหารเมือง เช่น map, heatmap, hotspot, policy watch

```json
{
  "area_id": "AREA-001",
  "area_name": "เขตปทุมวัน",
  "center_lat": 13.7449,
  "center_lng": 100.5330,
  "total_cases": 42,
  "recurring_cases": 12,
  "average_risk_score": 76,
  "max_risk_score": 95,
  "merged_reports_in_area": 68,
  "overdue_cases": 6,
  "escalated_cases": 4,
  "top_category": "emergency_access_blocked",
  "risk_area_score": 82,
  "policy_watch_score": 61,
  "area_level": "พื้นที่เสี่ยงสูงมาก",
  "recommended_action": "ควรตรวจสอบเชิงโครงสร้างและจัดลำดับความสำคัญเร่งด่วน"
}
```

---

## 22. Risk Area Score

Risk Area Score ใช้ประเมินพื้นที่ที่มีปัญหาซ้ำและรุนแรง

### Formula

```text
riskAreaScore =
  min(recurrence_count, 8) × 8
  + weightedRecurrence × 0.25
  + maxRiskInLast90Days × 0.15
  + (mergedReportsInArea / 5) × 2

riskAreaScore = min(riskAreaScore, 100)
```

### Components

| Component             | Meaning                                      |
| --------------------- | -------------------------------------------- |
| `recurrence_count`    | จำนวนครั้งที่ปัญหาเกิดซ้ำ                    |
| `weightedRecurrence`  | ค่าเฉลี่ยความรุนแรงแบบถ่วงน้ำหนักตามความใหม่ |
| `maxRiskInLast90Days` | risk score สูงสุดใน 90 วัน                   |
| `mergedReportsInArea` | จำนวนรายงานที่ถูกรวมในพื้นที่                |

### Risk Area Level

|   Score | Level                | Recommended Action                |
| ------: | -------------------- | --------------------------------- |
| `>= 75` | พื้นที่เสี่ยงสูงมาก  | ตรวจสอบเชิงโครงสร้าง / นโยบายด่วน |
| `>= 55` | พื้นที่เสี่ยงสูง     | มาตรการป้องกันเฉพาะจุด            |
| `>= 35` | พื้นที่เสี่ยงปานกลาง | ติดตามและเพิ่มการลาดตระเวน        |
|  `< 35` | พื้นที่เสี่ยงต่ำ     | บันทึกไว้และติดตามตามรอบ          |

---

## 23. Policy Watch Area

Policy Watch Area ใช้จับพื้นที่ที่อาจไม่ได้เสี่ยงมากในแต่ละครั้ง แต่มีรูปแบบซ้ำซากจนควรติดตามเชิงนโยบาย

### Formula

```text
policyWatchScore =
  min(recurrence_count, 10) × 5
  + avgMergedReports × 3
  + closureRate × 20

policyWatchScore = min(policyWatchScore, 100)
```

### Classification

```text
isPolicyWatch = (
  recurrence_count >= 3
  AND policyWatchScore >= 40
  AND riskAreaScore < 55
  AND avgTimeToClose > 14 days
)
```

### Policy Watch Level

|   Score | Level                      | Meaning                          |
| ------: | -------------------------- | -------------------------------- |
| `>= 70` | ติดตามด่วน                 | ควรตรวจสอบกฎระเบียบหรือโครงสร้าง |
| `>= 50` | ติดตาม                     | ควรประเมินนโยบายปัจจุบัน         |
| `>= 35` | เฝ้าระวัง                  | รอข้อมูลเพิ่มเติม                |
|  `< 35` | ไม่ต้องดำเนินการเชิงนโยบาย | เป็นปัญหาเฉพาะกรณี               |

---

## 24. Executive Dashboard Metrics

Dashboard ผู้บริหารเมืองควรแสดงข้อมูลระดับ aggregate เช่น:

| Metric               | Description                |
| -------------------- | -------------------------- |
| `total_cases`        | จำนวนเคสทั้งหมด            |
| `high_risk_cases`    | จำนวนเคสความเสี่ยงสูง      |
| `recurring_hotspots` | จำนวนจุดปัญหาซ้ำ           |
| `overdue_cases`      | จำนวนเคสค้างเกิน SLA       |
| `escalated_cases`    | จำนวนเคสที่ถูก escalate    |
| `avg_time_to_accept` | เวลาเฉลี่ยในการรับเคส      |
| `avg_time_to_update` | เวลาเฉลี่ยในการอัปเดต      |
| `avg_time_to_close`  | เวลาเฉลี่ยในการปิดเคส      |
| `top_categories`     | หมวดปัญหาที่พบบ่อย         |
| `top_risk_areas`     | พื้นที่เสี่ยงสูงสุด        |
| `policy_watch_areas` | พื้นที่ควรติดตามเชิงนโยบาย |

---

## 25. API Design

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
  "lng": 100.5360,
  "photo_url": null
}
```

Response:

```json
{
  "case_id": "CASE-092",
  "merged": true,
  "ai_summary": "มีรายงานหลายครั้งว่ารถจอดกีดขวางทางเข้ารถพยาบาล",
  "risk_score": 92,
  "priority_score": 88,
  "impact_level": "สูงมาก",
  "grouped_report_count": 18,
  "status": "waiting_acceptance",
  "suggested_lead_unit": "หน่วยบังคับใช้กฎหมายจราจร"
}
```

### `GET /api/cases`

Returns case list for dashboard.

### `GET /api/cases/{case_id}`

Returns full case detail.

### `POST /api/cases/{case_id}/status`

Updates case status.

### `POST /api/cases/{case_id}/ownership`

Updates ownership fields.

### `POST /api/cases/{case_id}/escalate`

Triggers or simulates escalation.

### `GET /api/analytics`

Returns city-level analytics.

### `GET /api/areas`

Returns map area insights.

---

## 26. Demo Case

### Emergency Access Blocked

```json
{
  "case_id": "RW-EMG-092",
  "title": "รถจอดกีดขวางทางเข้ารถพยาบาลใกล้โรงพยาบาลจุฬาลงกรณ์",
  "category": "emergency_access_blocked",
  "category_th": "กีดขวางทางรถฉุกเฉิน",
  "location": "ถนนพระราม 4 ใกล้โรงพยาบาลจุฬาลงกรณ์",
  "risk_score": 92,
  "priority_score": 88,
  "impact_level": "สูงมาก",
  "grouped_report_count": 18,
  "recurrence_count": 3,
  "suggested_lead_unit": "หน่วยบังคับใช้กฎหมายจราจร",
  "supporting_units": ["สำนักงานเขต"],
  "ownership_status": "รอหน่วยงานรับเคส",
  "sla_hours": 6,
  "escalation_level": 1,
  "next_action": "ตรวจสอบพื้นที่และประสานการเคลื่อนย้ายรถที่กีดขวางทางฉุกเฉิน"
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

## 27. Governance and Ethics

### AI Use

* AI/rule-based system is decision support only
* Human officers remain final decision-makers
* Scoring must be explainable
* Avoid black-box decision-making for public services

### Officer Accountability

This system does not:

* rank officers
* punish officers with points
* publicly shame departments
* assign blame automatically

This system does:

* show workflow bottlenecks
* keep audit trail
* prevent silent abandonment
* clarify current owner
* show next action
* escalate delayed cases

### Citizen Privacy

Public dashboards should not expose:

* citizen identity
* personal phone numbers
* exact private evidence
* raw photos
* license plates
* faces

---

## 28. Future Work

* Real authentication
* Role-based access control
* Real API integration with city systems
* LLM summary generation
* Computer vision for photo classification
* Face/license plate blur
* LINE OA notification
* Geospatial clustering
* Real-time dashboard
* Open data export
* Pilot district testing
* Evaluation with real officers

---

## 29. Glossary

| Term                            | Meaning                                          |
| ------------------------------- | ------------------------------------------------ |
| Traffic-Risk Intelligence Layer | ชั้นวิเคราะห์และจัดการความเสี่ยงบนระบบรายงานเดิม |
| Report                          | รายงานจากประชาชน 1 ครั้ง                         |
| Case                            | เคสที่รวมรายงานที่เกี่ยวข้อง                     |
| Risk Score                      | คะแนนความเสี่ยงของเหตุการณ์                      |
| Priority Score                  | คะแนนจัดลำดับคิวดำเนินงาน                        |
| Grouped Report Count            | จำนวนรายงานที่ถูกรวม                             |
| Recurrence                      | การเกิดซ้ำของปัญหาเดิมในพื้นที่                  |
| Case Ownership                  | การกำหนดเจ้าภาพเคส                               |
| Escalation Ladder               | การส่งต่อเป็นลำดับขั้นเมื่อเคสค้าง               |
| Audit Trail                     | บันทึกเส้นทางความรับผิดชอบ                       |
| Risk Area                       | พื้นที่เสี่ยงจากปัญหาซ้ำและรุนแรง                |
| Policy Watch Area               | พื้นที่ที่ควรติดตามเชิงนโยบาย                    |

---

## 30. License and Data Notice

This repository is released for civic-tech learning and hackathon demonstration.

All datasets included in this repository must be mock, synthetic, anonymized, or aggregate.

Do not commit real personal data.
Do not commit API keys.
Do not commit private government data.

Recommended license:

```text
MIT License
```
