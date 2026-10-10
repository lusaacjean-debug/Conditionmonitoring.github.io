# Methodology — CM Belt Life v1.0.0

## 1. Principle

A belt is retired by whichever failure mechanism reaches its limit first. Each
mechanism is assessed as a separate **life clock**. The governing clock (shortest
time-based life) sets the remaining life, which is then adjusted for observed
condition. Any critical finding makes the belt critical regardless of the
calculated life.

## 2. Top cover wear

- Thinnest point of each survey: `t_min = min(L edge, L mid, Centre, R mid, R edge)`.
- Wear rate `r` (mm/day) = negative slope of a least-squares line through
  `t_min` against date. With fewer than 3 surveys, the installation date and
  original cover thickness are used as a baseline point.
- Remaining life (days) = `(t_min − t_allow) / r − days since last survey`.
- Normalised rates are reported: mm per 1000 running hours and mm per Mt conveyed.
- Diagnostics:
  - **Centre loading wear:** centre wear more than 1.5 × mean edge wear.
  - **Asymmetry:** left vs right wear differs by 1 mm or more.

## 3. Carcass strength and safety factor

- `T1` (kN) is entered directly, or estimated from the drive:
  `Te = P × η × load factor / v`, `T1 = Te × (1 + 1 / (e^(μθ) − 1))` (Euler–Eytelwein).
- Rated strength (kN) = rating (kN/m) × width (m).
- Residual SF = rated strength × (1 − loss %) / T1.
- Allowable loss % = `1 − SF_min × T1 / rated strength`.
- Strength loss is assumed linear since installation, giving the remaining life.
- Default `SF_min`: 8.0 fabric (EP), 6.7 steel cord (ST). Override per belt.

## 4. Take-up travel

- Used fraction = current position / total travel.
- Rate = change between the last two readings. This excludes the initial
  constructional stretch of a new belt.
- Limit is 90 % of travel. Watch from 75 %.

## 5. Splices

Condition rating 1 (good) to 5 (critical) for each splice, plus:

- Steel cord length change: watch from 5 mm, critical from 10 mm.
- IR temperature above belt body: watch from 10 °C, critical from 20 °C.

A critical splice sets remaining life to zero (act now). Splices are not
time-forecast.

## 6. Condition and ageing factor

Severity score `S` (0–1) is the mean of the normalised indicators: ratings
`(r − 1) / 4`, hardness rise `/20`, repaired length `% / 20` and damage count.
`S` is never less than 70 % of the worst single indicator, so one severe defect
is not averaged away.

| S | Life factor |
|---|---|
| < 0.30 | 1.00 |
| 0.30 – 0.55 | 0.85 |
| ≥ 0.55 | 0.70 |

## 7. Verdict and health index

- **Critical:** any critical clock, bottom cover at minimum, or life ≤ 90 days.
- **Plan replacement:** any watch item, condition S ≥ 0.55, or life ≤ 365 days.
- **Serviceable:** otherwise.
- Health index = `100 × (1 − Σ weight × consumed)`, where consumed is the fraction
  of each clock's allowance used. Weights: wear 0.35, strength 0.25, splices 0.15,
  take-up 0.10, condition 0.15.

## 8. Inspection procedure (data quality)

1. Mark Splice 1 as the reference. Measure all points at fixed distances from it.
2. Measure thickness at the same 5 positions across the width every survey.
   Use at least 3 locations along the belt and record the thinnest.
3. Calibrate the ultrasonic gauge on a rubber block of known thickness.
4. Record take-up position with the belt stopped and at the same load state.
5. Scan splices with the IR camera while running at normal load.
6. Survey interval: 6 months (serviceable), 3 months (watch), monthly (critical).

## 9. References

DIN 22101 (belt conveyor design), ISO 14890 (fabric belts), ISO 15236 (steel cord
belts), CEMA *Belt Conveyors for Bulk Materials*. Manufacturer data overrides
these default limits.
