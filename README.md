# CarePulse++ v3.0 — Clinical Command Center

## Quick Start
```bash
npm install
npm start
```
Opens at **http://localhost:3000**

## Login
| Hospital ID | Password     |
|-------------|--------------|
| H001        | CAREH0012026 |
| H002        | CAREH0022026 |

Formula: `password = "CARE" + hospital_id + "2026"`

## Features

### Existing Features
- **Dashboard** — Patient priority queue, KPIs, hospital metrics, food menu toggles
- **Patients** — Full patient detail with deviation indices, recommendations, explanation log
- **Hospital** — Stress index, ratios, ER/admission logic, edit mode
- **Data Entry** — Add/edit patients, live recomputation

### New Features (v3)

#### 1. Risk Heatmap (Clinical Command Center)
- **Ward Heatmap** — colour-coded grid per patient (blue→red by score)
- **Vital Deviation Index Matrix** — full 10-index table per patient
- Colour cells: red=high deviation, yellow=moderate, green=low

#### 2. Surge Mode (Tab: Surge Mode)
- Flags 15% of patients as emergency surge cases
- Formula: `Rnew = Rbase × (1 + SurgeFactor)`
- Adjustable surge factor (10%–100%)
- Updates: ICU overflow, Ventilator Pressure, Stress Index, ER freeze
- Generates: Surge Alert Report, Transfer List, New Critical count

#### 3. Oxygen Crisis Simulation (Tab: O₂ Crisis)
- Triggers when O₂ supply < 40%
- `CriticalRisk = CriticalRisk × 1.25` for Critical + ICU patients
- Top-K ventilator allocation by risk score when shortage detected
- Bed prioritization reorder under crisis

#### 4. Dynamic Staff Alerting System (Tab: Staff Alerts)
- Auto-generated from patient vitals + hospital metrics
- Alert levels: CRITICAL → SYSTEM → URGENT → WARNING
- Per-patient alerts: O₂ drop, high fever, severe anemia, dehydration
- System alerts: ICU overflow, ER freeze, ventilator shortage
- Dismissible alerts with action directives
- Badge count on nav tab

## Protocol Formulas (from specification images)
| Index | Formula |
|-------|---------|
| HR_dev | `\|HR − 80\|` |
| BP_dev | `\|systolic − 120\| + \|diastolic − 80\|` |
| O2_drop | `max(0, 0.95 − SpO2)` |
| Fever | `max(0, T − 37.5) × 10` |
| Resp_dev | `\|RR − 16\|` |
| Sugar | `0 if 70≤S≤140, else \|S−100\|` |
| Age_risk | `5 if age>60, else 0` (binary) |
| BMI_risk | `5 if BMI<18.5 or >30, else 0` (binary) |
| Anemia_risk | `5 if Hgb<10, else 0` (binary) |
| Hyd_deficit | `max(0, 60 − hydration)` |

Weights Σ = 1.00: O₂(0.20) HR(0.15) BP(0.15) Fever(0.10) Resp(0.10) Sugar(0.08) Age(0.07) BMI(0.05) Hgb(0.05) Hyd(0.05)
