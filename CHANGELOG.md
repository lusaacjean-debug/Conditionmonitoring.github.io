# Changelog

All notable changes to CM Inspect. Versions follow *major.minor.patch*: major = structure or numbering change, minor = new checklists or features, patch = content corrections.

## [1.3.1] — 2026-10-09 — record integrity
### Changed
- Pre-issue review is now a styled panel; each point has **Go to** (jumps to the field or check point). Critical points: unanswered check points, missing tag / inspector / date, self-review, expired calibration.
- A PDF issued with critical points open is marked **DRAFT — NOT A VALID RECORD** (watermark, status box, footer, *Report status* tile).
- Recording-speed check: when checks are answered faster than 5 s each, a note is printed for the reviewer.
- Unanswered check points are reported first; the health score shows as *provisional* until 100 % complete.
- Report tiles: *Completion* and *Report status* replace empty Health / Remaining-life tiles.
- New inspection method: **Oil sampling**.
- CMI-LUB-002 Lube Oil Sampling **Rev 0 → Rev 1**: sample data recorded (sample ID, compartment, lubricant, hour meter, hours on oil, top-up, flush volume, oil temperature, laboratory) and printed in a *Sample data* box on page 1.

## [1.3.0] — 2026-10-08
### Added — inspection standards (ISO/IEC 17020, ISO 17359, ISO 18436, ALCOA+)
- Inspection conditions & traceability: operating condition, load / speed, inspector qualification, test instrument & serial, calibration due date (name, qualification and instrument remembered per device).
- Methods: thermography and ultrasound / UT added to visual and vibration.
- Every answer time-stamped; report shows the inspection time window.
- Unique report number and SHA-256 record fingerprint on every page; closing statement "results relate only to the item inspected".
- Finding, corrective action / WR and priority (P1–P4) on every NOT OK — simple check points included; defects table sorted by priority.
- Pre-issue review before the PDF: traceability, independent reviewer, operating condition, instrument & calibration, readings evidence, all-N/A sections, open defects.
- Works offline after the first visit (service worker, web app manifest).
- docs/STANDARDS_COMPLIANCE.md — compliance matrix for audits.

## [1.2.0] — 2026-10-08
### Changed
- Every checklist now cites its standards (33 rotating checklists previously showed only a department name); a foreign company name removed from the Yard Conveyor checklist.
- Checklist cards show the document number and revision; search finds a checklist by its number (e.g. CMI-ROT-001).
- Browser print: A4 page footer on every page — document number, revision, title, "Uncontrolled when printed", Page x of y.
- Dates in reports and print-outs use one format (YYYY-MM-DD HH:MM).
- PDF and QR libraries served from the repository (assets/vendor) — no dependency on an external CDN; works behind the company firewall.
- Pinch-zoom allowed on phones (accessibility).

## [1.1.1] — 2026-10-05
### Fixed
- Prestart go / no-go: decision calculated from the CRITICAL check points (GO / NO-GO / INCOMPLETE) — shown in the header pill, the PDF result line and the summary tiles (Critical NOT OK, Decision).
- Warning before the PDF when tag / inspector / date are empty, or when the "Critical items OK" declaration contradicts the recorded result.
- PDF section summary now counts N/A; reading notes labelled Target / Reference consistently; result line wraps instead of being cut.

## [1.1.0] — 2026-10-04
### Changed
- Repository restructured: page shell, stylesheet, application, data and checklist families in separate files.
- One numbering scheme everywhere: sections 1…n, check points *section.item* (screen, print, PDF).
- Section titles normalised (no "Section 3 —" / "A. MOTOR" duplicates, consistent capitalisation).
- PDF report: document number & revision in the title band, running header from page 2, controlled footer (doc no., rev., uncontrolled-copy notice, page x of y), defects table referenced by item number.
### Added
- Document register (`data/document-register.js`, `docs/CHECKLIST_REGISTER.md`) — 172 numbered checklists.
- Short Pronto links `?pm=<PM task>&t=<plant item>&w=<work order>` (fit Pronto Task Text).
- 21 standard checklists for Pronto PM tasks (area routes, electric motor, earthing, PFC, lighting, LRS, portable tools, IR survey, HVAC, diesel service, LV service, GET, MEWP, fall protection, bunds, greasing route, trommel).
- Instrument calibration & loop check (transmitters, switches, analysers, flowmeters & weighing).
- Process plant checklists (pressure vessels, PSVs, sulphur furnace & WHB, converter & acid towers, dust collectors, valves, belt filter, filter press, kiln, cooling tower, transformer, switchgear, UPS, gas detection & SIS, cranes, safety showers, fire protection).
- Prestart LV & HME, Hyundai HiMSEN PM package, MCR001 routes, heavy mobile equipment fleet.
- Professional home page with search, drafts in progress, print stylesheet and redesigned PDF.

## [1.0.0] — 2026 (initial)
- Static, rotating and lubrication checklists; drafts, health score, remaining life, PDF export.
