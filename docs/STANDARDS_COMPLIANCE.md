# Standards compliance matrix — CM Inspect v1.3.0

How CM Inspect meets the requirements that apply to a digital inspection and condition-monitoring checklist. Use this page for audits (internal, ISO 9001 / ISO 55001 certification, statutory inspections).

## 1. Inspection report content — ISO/IEC 17020:2012 §7.4 (inspection reports)

| Requirement | How CM Inspect meets it |
|---|---|
| Unique identification of the report | **Report no.** `WO<work order>-<tag>-<yyyymmdd>` on page 1 and in every page footer |
| Identification of the inspection body / issuer | Title band: Lotus Africa Uranium Plant · Engineering Department · discipline |
| Identification of the item inspected | Equipment tag (Pronto plant item), checklist title, document number |
| Date (and time) of inspection | Inspection date and **time window** (first–last recorded answer) |
| Inspection method / procedure | Controlled checklist **CMI-xxx-nnn Rev r**, standards cited under the title, methods (visual, vibration, thermography, ultrasound) |
| Equipment used | **Test instrument & serial number, calibration due date**; expired calibration is flagged before issue |
| Results, deviations, conformity statement | Result line, summary tiles, defects table first, detailed results with acceptance criteria |
| Statement that results relate only to the item inspected | Closing statement on the last page |
| Name / signature of authorised persons | Inspected by (with qualification) and Reviewed by — signature and date boxes |
| Pages identified as part of the report | Running header from page 2; footer *Page x of y* on every page (PDF and browser print) |

## 2. Condition monitoring practice — ISO 17359, ISO 20816, ISO 18436

| Requirement | How CM Inspect meets it |
|---|---|
| Record operating conditions with measurements (ISO 17359) | **Operating condition** and **load / speed** fields; flagged before issue if empty |
| Measurement against defined acceptance limits | Each check point carries its acceptance criterion and frequency; readings show their target |
| Evidence for measured parameters | Pre-issue review flags items marked OK when the section readings are empty |
| Personnel competence (ISO 18436-2 vibration, ISO 18436-7 thermography, ISO 18436-4 lubrication) | **Inspector qualification** recorded on the report and in the sign-off |
| Trending | Readings and thickness CMLs with corrosion rate and remaining life |

## 3. Records & data integrity — ISO 9001 §7.5, ISO 55001 §7.5/7.6, ALCOA+

| Principle | How CM Inspect meets it |
|---|---|
| **Attributable** | Inspector, qualification, reviewer and instrument on every report |
| **Legible / enduring** | PDF A4 report, attached to the Pronto work order (system of record) |
| **Contemporaneous** | Each answer is time-stamped; the report shows the inspection time window |
| **Original** | **Record fingerprint (SHA-256)** printed on every page: any change to the recorded results produces a different value |
| **Accurate / complete** | Pre-issue review: missing tag / WO / inspector / reviewer, independent review, expired calibration, empty readings, all-N/A sections without reason, NOT OK without finding / action / priority |
| **Controlled documents** | Frozen document numbers, revisions, pull-request approval trail, CHANGELOG, "Uncontrolled when printed" |

## 4. Defect management — ISO 55001 §10, ISO 31000

| Requirement | How CM Inspect meets it |
|---|---|
| Every nonconformity recorded with action | Finding, corrective action / WR number and **priority** on every NOT OK (all check points) |
| Risk-based priority | P1 Immediate · P2 ≤ 7 days · P3 ≤ 30 days · P4 Next shutdown — defects table sorted by priority |
| Closure in the CMMS | WR number recorded; PDF attached to the Pronto WO; "no PDF = WO not complete" |
| Go / no-go for mobile plant | Prestarts calculate GO / NO-GO / INCOMPLETE from critical items |

## 5. Availability in the field

* Works **offline** after the first visit (service worker caches the application); drafts are kept on the device.
* PDF and QR libraries served from the repository — no dependency on external sites.

## 6. Known limits (roadmap)

| Limit | Mitigation now | Next step |
|---|---|---|
| Drafts stored on one device only | PDF attached to Pronto is the record | Central results store (company server / SharePoint) |
| Signatures are wet-ink on the printed / PDF report | Reviewer and sign-off boxes | Electronic approval (company identity provider) |
| Failure codes not structured | Finding text + priority | ISO 14224 failure mode / cause codes per defect |
