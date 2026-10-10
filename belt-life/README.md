# CM Belt Life

Conveyor belt remaining-life assessment for condition monitoring teams.
Part of the CM toolset alongside **CM Inspect**.

CM Belt Life turns routine belt inspection data into a remaining-life estimate,
a health index, a replacement date and a prioritised action list for each belt
in the plant register.

## What it calculates

Remaining life is the **shortest** of independent life clocks:

| Life clock | Input data | Limit |
|---|---|---|
| Top cover wear | Ultrasonic thickness at 5 points across the width | Minimum allowable cover |
| Carcass strength | Belt rating, width, operating tension, strength loss | Minimum safety factor (EP 8.0 / ST 6.7) |
| Take-up travel | Take-up position trend | 90 % of travel |
| Splices | Condition rating, length change, IR ΔT | Condition-based |

A condition and ageing factor (hardness rise, cracking, chemical attack, edge
damage, tracking, cleaners, repairs) reduces the governing life by 0 %, 15 % or
30 %. Full method: [docs/METHODOLOGY.md](docs/METHODOLOGY.md).

## Using it

1. Open the app (GitHub Pages link below, or `index.html` from a local web server).
2. **Add belt** and enter the design data from the belt specification.
3. Enter each thickness survey, take-up reading, splice and condition rating.
4. Read the assessment on the right; **Print report** for the signed record.
5. **Export data** after every session and store the JSON file on the site share.
   Data lives only in the browser it was entered on.

The demo belt (CV-03) loads on first use. Delete it once real belts are entered.

## Deployment

The app is static HTML, CSS and JavaScript, with no server, database or build step.

- **GitHub Pages:** copy this folder into the `cm` repository as `belt-life/`.
  It will be live at `https://<user>.github.io/cm/belt-life/`.
- **Company server:** copy the folder to any web server directory. Nothing else
  is required. Fonts fall back to system fonts if Google Fonts is blocked.

## Repository layout

```
belt-life/
├── index.html              App shell
├── css/style.css           Styles, including print layout
├── js/engine.js            Calculation engine (no UI, unit-tested)
├── js/app.js               User interface, storage, import/export
├── sample-data/            Demo belt in the import/export format
├── tests/engine.test.js    Engine unit tests
├── docs/METHODOLOGY.md     Method, formulas, limits, inspection procedure
└── .github/workflows/      Runs the tests on every push
```

## Development

```
node tests/engine.test.js      # run unit tests (Node 18+)
python3 -m http.server 8000    # serve locally, open http://localhost:8000
```

Change calculation logic only in `js/engine.js`, add a test for it, and record
the change in `CHANGELOG.md`. Bump `VERSION` in the engine for any change that
alters results, because the version is printed on every report.

## Disclaimer

Results are an engineering estimate to support maintenance planning. Verify limits
against the belt manufacturer's data and site standards before acting on them.
