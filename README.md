# CM Inspect — Condition Monitoring & Inspection Checklists

**Lotus Africa Uranium Plant · Engineering Department · Asset Health & Integrity**

Live site: **https://lusaacjean-debug.github.io/cm/**
Current release: **v1.3.1 (2026-10-09)** — see [CHANGELOG](CHANGELOG.md)

CM Inspect is the site's web checklist system for condition monitoring, inspection and prestart checks. Each inspection is recorded against a written acceptance criterion, produces a numbered PDF report (defects first, health score, remaining life, sign-off) and is closed out in Pronto (work request for every NOT OK, PDF attached to the work order).

| | |
|---|---|
| Checklists | 172 in 10 disciplines — full list in [docs/CHECKLIST_REGISTER.md](docs/CHECKLIST_REGISTER.md) |
| Pronto link | 838 PM tasks linked by short link `…/cm/?pm=<PM task>` |
| Works on | Phone, tablet and PC (Chrome / Edge / Safari). No installation, no login. **Works offline** after the first visit. |
| Standards | Report content and records per ISO/IEC 17020, ISO 17359, ISO 18436, ISO 9001 / ISO 55001 §7.5 — see [docs/STANDARDS_COMPLIANCE.md](docs/STANDARDS_COMPLIANCE.md) |
| Data | Drafts stay on the inspector's device; the PDF attached in Pronto is the record. |

---

## 1. Repository structure

```
cm/
├── index.html                      Page shell (markup only) and script load order
├── sw.js, manifest.webmanifest     Offline support / installable web app
├── assets/
│   ├── css/cm-inspect.css          All styles — screen and print (A4)
│   ├── js/app.js                   Application: home, forms, scoring, drafts, print, PDF, deep links
│   ├── img/favicon.svg
│   └── vendor/                     jsPDF and jsQR (served locally)
├── data/
│   ├── document-register.js        Document number + revision per checklist (frozen)
│   └── pm-task-map.js              Pronto PM task → checklist (for ?pm= links)
├── checklists/                     Checklist content, one file per family
│   ├── 00-base-library.js          Building blocks + static, rotating, lubrication
│   ├── 10-genset-hme.js            Gen set fire-risk & standby, heavy mobile equipment
│   ├── 20-site-hyundai-mcr001.js   Site documents: Hyundai HiMSEN PM package, MCR001 routes
│   ├── 30-prestart.js              Prestart LV & HME
│   ├── 40-process-plant.js         Pressure equipment, acid plant, kiln, electrical, safety
│   ├── 50-instrumentation.js       Calibration & loop checks
│   └── 60-routes-standard-pm.js    Area routes & standard PM checklists
├── docs/
│   ├── USER_GUIDE.md               For inspectors and supervisors
│   ├── PRONTO_LINKING.md           How checklists are linked to Pronto
│   ├── RELEASE_PROCESS.md          How to change a checklist and publish a release
│   └── CHECKLIST_REGISTER.md       Controlled list of all checklists
├── .github/                        Pull request template, code owners
├── CHANGELOG.md
├── LICENSE                         Internal use only
└── .nojekyll                       Serve files as-is on GitHub Pages
```

**Load order matters** (`index.html`): `data/` → `checklists/` (in number order) → `assets/js/app.js`.

## 2. Numbering & document control

* **Checklist number** — `CMI-<discipline>-<nnn> Rev <r>` (e.g. `CMI-ROT-025 Rev 0`). Site documents keep their own number (`LAL-CL-HG-…`, `MCR001-R…`). Shown on screen, print and every PDF page.
* **Sections** are numbered 1, 2, 3 … in the order shown; **check points** are numbered *section.item* (e.g. 4.2). The same reference appears on screen, in the print-out and in the PDF defects table, so a defect can be quoted as "CMI-ROT-025 item 4.2".
* **PDF layout** — A4; title band with document number; details grid; result tiles; defects & corrective actions first; detailed results; sign-off; running header from page 2; footer with document number, revision, "Uncontrolled when printed" and *Page x of y*.

## 3. Changing a checklist (summary)

1. Edit the checklist file on GitHub (pencil icon) — never `index.html` for content.
2. Raise the revision in `data/document-register.js` (`"0"` → `"1"`).
3. Bump the version in `assets/js/app.js` (`APP_VERSION`) and in the `?v=` of `index.html`, add a line to `CHANGELOG.md`.
4. Propose the change as a **pull request** — describe what changed and who approved it — then merge.

Full procedure: [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md).

## 4. Ownership

Technical owner: Reliability Condition Monitoring (RCM), Engineering Department.
Content approval: discipline owners (mechanical, electrical, E&I, lubrication, power plant, mobile fleet, crushing, HSE).
Approval for use: Engineering Manager.

© 2026 Lotus Africa — internal use only, not for distribution.
