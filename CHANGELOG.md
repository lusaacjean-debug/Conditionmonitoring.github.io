# Changelog

All notable changes to CM Inspect. Versions follow *major.minor.patch*: major = structure or numbering change, minor = new checklists or features, patch = content corrections.

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
