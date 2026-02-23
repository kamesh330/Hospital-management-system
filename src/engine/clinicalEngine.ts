import type { Patient } from '../data/sampleData';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const HR_dev = (hr: number) => Math.abs(hr - 80);
export const BP_dev = (sys: number, dia: number) => Math.abs(sys - 120) + Math.abs(dia - 80);
export const O2_drop = (spo2_pct: number) => Math.max(0, 0.95 - spo2_pct / 100);
export const Fever_idx = (temp: number) => Math.max(0, temp - 37.5) * 10;
export const Resp_dev = (rr: number) => Math.abs(rr - 16);
export const Sugar_risk = (s: number) => (s >= 70 && s <= 140) ? 0 : Math.abs(s - 100);
export const Age_risk = (age: number) => age > 60 ? 5 : 0;
export const BMI_risk = (bmi: number) => (bmi < 18.5 || bmi > 30) ? 5 : 0;
export const Anemia_risk = (hgb: number) => hgb < 10 ? 5 : 0;
export const Hyd_deficit = (hyd: number) => Math.max(0, 60 - hyd);

export const computeDeviations = (p: Patient) => ({
  HR: HR_dev(p.heart_rate_bpm),
  BP: BP_dev(p.systolic_bp_mmHg, p.diastolic_bp_mmHg),
  O2: O2_drop(p.oxygen_saturation_percent),
  Fever: Fever_idx(p.body_temperature_celsius),
  Resp: Resp_dev(p.respiratory_rate_bpm),
  Sugar: Sugar_risk(p.blood_sugar_mg_dl),
  Age: Age_risk(p.age),
  BMI: BMI_risk(p.bmi),
  Hgb: Anemia_risk(p.hemoglobin_g_dl),
  Hyd: Hyd_deficit(p.hydration_level_percent),
});

export const WEIGHTS = {
  w_HR: 0.15, w_BP: 0.15, w_O2: 0.20, w_Fever: 0.10,
  w_Resp: 0.10, w_Sugar: 0.08, w_Age: 0.07, w_BMI: 0.05,
  w_Hgb: 0.05, w_Hyd: 0.05,
};

const NORM: Record<string, number> = { HR:80, BP:180, O2:0.95, Fever:25, Resp:24, Sugar:300, Age:5, BMI:5, Hgb:5, Hyd:60 };
const norm = (raw: number, key: string) => clamp01(raw / NORM[key]);

export const computeRiskScore = (p: Patient, surgeMode = false, surgeFactor = 0, o2Crisis = false) => {
  const d = computeDeviations(p);
  const log: string[] = [];

  log.push(`① HR_dev    = |${p.heart_rate_bpm}−80| = ${d.HR}`);
  log.push(`② BP_dev    = |${p.systolic_bp_mmHg}−120|+|${p.diastolic_bp_mmHg}−80| = ${d.BP}`);
  log.push(`③ O2_drop   = max(0, 0.95−${(p.oxygen_saturation_percent/100).toFixed(2)}) = ${d.O2.toFixed(4)}`);
  log.push(`④ Fever     = max(0,${p.body_temperature_celsius}−37.5)×10 = ${d.Fever.toFixed(2)}`);
  log.push(`⑤ Resp_dev  = |${p.respiratory_rate_bpm}−16| = ${d.Resp}`);
  log.push(`⑥ Sugar     = ${p.blood_sugar_mg_dl>=70&&p.blood_sugar_mg_dl<=140?'0 (normal)':'|'+p.blood_sugar_mg_dl+'−100|='+d.Sugar}`);
  log.push(`⑦ Age_risk  = ${d.Age} (age ${p.age}${p.age>60?' >60→5':' ≤60→0'})`);
  log.push(`⑧ BMI_risk  = ${d.BMI} (BMI ${p.bmi}${(p.bmi<18.5||p.bmi>30)?' out of range→5':' normal→0'})`);
  log.push(`⑨ Anemia    = ${d.Hgb} (Hgb ${p.hemoglobin_g_dl}${p.hemoglobin_g_dl<10?' <10→5':' ≥10→0'})`);
  log.push(`⑩ Hyd_def   = max(0,60−${p.hydration_level_percent}) = ${d.Hyd}`);

  const n = {
    HR: norm(d.HR,'HR'), BP: norm(d.BP,'BP'), O2: norm(d.O2,'O2'),
    Fever: norm(d.Fever,'Fever'), Resp: norm(d.Resp,'Resp'), Sugar: norm(d.Sugar,'Sugar'),
    Age: norm(d.Age,'Age'), BMI: norm(d.BMI,'BMI'), Hgb: norm(d.Hgb,'Hgb'), Hyd: norm(d.Hyd,'Hyd'),
  };

  const weighted =
    WEIGHTS.w_HR*n.HR + WEIGHTS.w_BP*n.BP + WEIGHTS.w_O2*n.O2 +
    WEIGHTS.w_Fever*n.Fever + WEIGHTS.w_Resp*n.Resp + WEIGHTS.w_Sugar*n.Sugar +
    WEIGHTS.w_Age*n.Age + WEIGHTS.w_BMI*n.BMI + WEIGHTS.w_Hgb*n.Hgb + WEIGHTS.w_Hyd*n.Hyd;

  log.push(`Weighted sum = ${weighted.toFixed(4)}  [Σweights=1.00]`);

  let score = Math.min(100, weighted * 100);

  if (p.chronic_disease_flag === 1) { score = Math.min(100, score * 1.15); log.push(`Chronic ×1.15 → ${score.toFixed(2)}`); }
  if (p.emergency_case_flag === 1)  { score = Math.min(100, score + 10);   log.push(`Emergency +10 → ${score.toFixed(2)}`); }
  if (p.icu_required_flag === 1 && score < 85) { score = 85; log.push(`ICU flag → forced ≥85`); }

  const baseScore = score;

  if (surgeMode && p._surgeFlagged) {
    score = Math.min(100, score * (1 + surgeFactor));
    log.push(`🚨 SURGE: Rnew = ${baseScore.toFixed(2)} × (1+${surgeFactor}) = ${score.toFixed(2)}`);
  }

  if (o2Crisis && (score >= 70 || p.icu_required_flag === 1)) {
    score = Math.min(100, score * 1.25);
    log.push(`🫁 O2 CRISIS ×1.25 → ${score.toFixed(2)}`);
  }

  score = Math.min(100, score);
  log.push(`✓ FINAL = ${score.toFixed(2)} / 100`);

  return { score, baseScore, deviations: d, normalised: n, log };
};

export const getSeverity = (score: number) => {
  if (score >= 70) return 'Critical';
  if (score >= 40) return 'Moderate';
  return 'Stable';
};

export const getDiet = (p: Patient) => {
  if (p.hemoglobin_g_dl < 10)            return 'Iron-Rich Diet';
  if (p.hydration_level_percent < 50)    return 'Electrolyte-Enriched Diet';
  if (p.blood_sugar_mg_dl > 200)         return 'Low-Carbohydrate Diet';
  if (p.systolic_bp_mmHg > 150)          return 'Low-Sodium Diet';
  if (p.body_temperature_celsius > 38.5) return 'High-Fluid Diet';
  return 'Balanced Diet';
};

export const getRoomTemp = (severity: string, bodyTemp: number) => {
  const base: Record<string, number[]> = { Critical:[22,24], Moderate:[24,26], Stable:[26,28] };
  let [lo, hi] = base[severity];
  if (bodyTemp > 39) { lo -= 2; hi -= 2; }
  return `${lo}–${hi}°C`;
};

export const getBedAllocation = (severity: string) => {
  if (severity === 'Critical') return 'ICU';
  if (severity === 'Moderate') return 'General Bed';
  return 'Observation';
};

export const vitalDeviationIndex = (normalised: Record<string, number>) => {
  const n = normalised;
  return Math.min(1,
    (n.HR + n.BP + n.O2 + n.Fever + n.Resp + n.Sugar + n.Age + n.BMI + n.Hgb + n.Hyd) / 10
  );
};

export const processPatients = (patients: Patient[], surgeMode = false, surgeFactor = 0, o2Crisis = false) =>
  patients
    .map((p) => {
      const { score, baseScore, deviations, normalised, log } = computeRiskScore(p, surgeMode, surgeFactor, o2Crisis);
      const severity = getSeverity(score);
      const diet = getDiet(p);
      const roomTemp = getRoomTemp(severity, p.body_temperature_celsius);
      const bed = getBedAllocation(severity);
      const vdi = vitalDeviationIndex(normalised);
      return { ...p, score, baseScore, severity, diet, roomTemp, bed, deviations, normalised, vdi, log };
    })
    .sort((a, b) => b.score - a.score);
