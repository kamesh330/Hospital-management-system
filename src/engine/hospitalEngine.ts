import type { Patient, Hospital } from '../data/sampleData';

const clamp = (v: number) => Math.max(0, Math.min(1, v));

const SW = { a:0.25, b:0.30, c:0.20, d:0.15, e:0.10 };

export interface HospitalMetrics {
  bedAvail: number;
  icuAvail: number;
  erLoad: number;
  opLoad: number;
  ventPress: number;
  stress: number;
  stressClass: string;
  erStatus: string;
  admitStatus: string;
  criticalCount: number;
  icuOverflow: boolean;
  ventShortage: boolean;
  topKPatients: string[];
  alerts: { type: string; msg: string }[];
}

export const computeHospitalMetrics = (h: Hospital, processed: any[], surgeMode = false, o2Crisis = false): HospitalMetrics => {
  const criticalCount = processed.filter((p: any) => p.severity === 'Critical').length;

  const bedAvail  = clamp((h.total_beds - h.occupied_beds) / h.total_beds);
  const icuAvail  = clamp((h.icu_beds_total - h.icu_beds_occupied) / h.icu_beds_total);
  const erLoad    = clamp(h.er_occupied / h.er_capacity);
  const opLoad    = clamp(h.ongoing_operations_count / Math.max(1, h.available_doctors));

  let ventPress = clamp(criticalCount / Math.max(1, h.ventilators_available));
  if (o2Crisis) {
    const shortage = Math.max(0, criticalCount - h.ventilators_available);
    ventPress = clamp((criticalCount + shortage * 0.5) / Math.max(1, h.ventilators_available));
  }

  let stress =
    SW.a * (1 - bedAvail) +
    SW.b * (1 - icuAvail) +
    SW.c * erLoad +
    SW.d * opLoad +
    SW.e * ventPress;

  if (surgeMode) stress = Math.min(1, stress * 1.20);
  if (o2Crisis)  stress = Math.min(1, stress * 1.15);

  const stressClass =
    stress > 0.85  ? 'Emergency Escalation' :
    stress >= 0.60 ? 'Capacity Warning' :
                     'Normal';

  const erStatus =
    stress > 0.9   ? 'ER Freeze' :
    erLoad >= 0.85 ? 'Redirect' :
                     'Admit';

  const admitStatus = bedAvail < 0.1 ? 'Stop Admissions' : 'Accepting Patients';
  const icuOverflow = icuAvail === 0 && criticalCount > h.icu_beds_total;
  const ventShortage = criticalCount > h.ventilators_available;
  const topKPatients = ventShortage
    ? processed.filter((p: any) => p.severity === 'Critical')
               .sort((a: any, b: any) => b.score - a.score)
               .slice(0, h.ventilators_available)
               .map((p: any) => p.patient_id)
    : [];

  const alerts: { type: string; msg: string }[] = [];
  if (icuAvail === 0)                  alerts.push({ type:'critical', msg:'⚠ ICU UNAVAILABLE — Escalation Alert Triggered' });
  if (icuOverflow)                     alerts.push({ type:'critical', msg:'🚨 ICU OVERFLOW — '+criticalCount+' critical patients, '+h.icu_beds_total+' ICU beds' });
  if (bedAvail < 0.1)                  alerts.push({ type:'critical', msg:'⚠ BED CAPACITY < 10% — New Admissions Stopped' });
  if (stress > 0.85)                   alerts.push({ type:'critical', msg:'🚨 EMERGENCY ESCALATION — Hospital at Crisis Level' });
  if (erLoad >= 0.85 && stress <= 0.9) alerts.push({ type:'warning',  msg:'⚠ ER OVERLOADED — Redirecting to Nearby Hospital' });
  if (surgeMode)                       alerts.push({ type:'surge',    msg:'🚨 SURGE MODE ACTIVE — Mass Casualty Protocol Engaged' });
  if (o2Crisis)                        alerts.push({ type:'o2',       msg:'🫁 OXYGEN CRISIS — Supply Below 40% — Ventilator Protocol Active' });
  if (ventShortage && o2Crisis)        alerts.push({ type:'o2',       msg:`🫁 VENTILATOR SHORTAGE — Only top-${h.ventilators_available} critical patients allocated` });

  return {
    bedAvail, icuAvail, erLoad, opLoad, ventPress,
    stress, stressClass, erStatus, admitStatus,
    criticalCount, icuOverflow, ventShortage, topKPatients, alerts,
  };
};

export const applySurgeMode = (patients: Patient[], _surgeFactor: number) => {
  const sorted = [...patients].sort((a: any, b: any) => (a.score || 0) - (b.score || 0));
  const surgeCount = Math.max(1, Math.ceil(patients.length * 0.15));
  const surgeIds = new Set(sorted.slice(0, surgeCount).map(p => p.patient_id));
  return patients.map(p => ({ ...p, _surgeFlagged: surgeIds.has(p.patient_id) }));
};

export const generateSurgeReport = (processed: any[], hospital: Hospital) => {
  const surgePatients = processed.filter((p: any) => p._surgeFlagged);
  const needTransfer = processed.filter((p: any) => p._surgeFlagged && p.severity === 'Critical' && hospital.icu_beds_total - hospital.icu_beds_occupied < 1);
  const newCritical = processed.filter((p: any) => p._surgeFlagged && p.severity === 'Critical');
  return { surgePatients, needTransfer, newCritical, surgeCount: surgePatients.length };
};

export interface StaffAlert {
  id: string;
  level: string;
  patient: string | null;
  msg: string;
  action: string;
  time: string;
}

export const generateStaffAlerts = (processed: any[], hospital: Hospital, hm: HospitalMetrics): StaffAlert[] => {
  const alerts: StaffAlert[] = [];
  const ts = new Date().toLocaleTimeString();

  processed.filter((p: any) => p.severity === 'Critical').forEach((p: any) => {
    alerts.push({
      id: `CRIT-${p.patient_id}`, level: 'CRITICAL', patient: p.patient_id,
      msg: `Patient ${p.patient_id} — CRITICAL (score ${p.score.toFixed(1)}) — Immediate intervention required`,
      action: `Assign senior physician + ICU nurse to ${p.patient_id}`, time: ts,
    });
  });

  processed.filter((p: any) => p.oxygen_saturation_percent < 90).forEach((p: any) => {
    alerts.push({
      id: `O2-${p.patient_id}`, level: 'URGENT', patient: p.patient_id,
      msg: `Patient ${p.patient_id} — O₂ SAT ${p.oxygen_saturation_percent}% — Below safe threshold`,
      action: `Respiratory team to ${p.patient_id} immediately`, time: ts,
    });
  });

  processed.filter((p: any) => p.body_temperature_celsius > 39.0).forEach((p: any) => {
    alerts.push({
      id: `FVR-${p.patient_id}`, level: 'WARNING', patient: p.patient_id,
      msg: `Patient ${p.patient_id} — HIGH FEVER ${p.body_temperature_celsius}°C — Infection risk`,
      action: `Nurse to administer antipyretics, take cultures`, time: ts,
    });
  });

  if (hm.icuOverflow) {
    alerts.push({
      id: 'ICU-OVERFLOW', level: 'SYSTEM', patient: null,
      msg: `ICU OVERFLOW — ${hm.criticalCount} critical patients exceed ICU capacity`,
      action: `Activate overflow protocol — prepare HDU beds`, time: ts,
    });
  }

  if (hm.erStatus === 'ER Freeze') {
    alerts.push({
      id: 'ER-FREEZE', level: 'SYSTEM', patient: null,
      msg: `ER FREEZE ACTIVATED — Hospital stress index ${(hm.stress*100).toFixed(1)}%`,
      action: `Divert ambulances to nearest available facility`, time: ts,
    });
  }

  if (hm.ventShortage) {
    alerts.push({
      id: 'VENT-SHORT', level: 'CRITICAL', patient: null,
      msg: `VENTILATOR SHORTAGE — ${hm.criticalCount} critical patients, only ${hospital.ventilators_available} ventilators`,
      action: `Emergency procurement — request ventilators from district pool`, time: ts,
    });
  }

  processed.filter((p: any) => p.hemoglobin_g_dl < 8).forEach((p: any) => {
    alerts.push({
      id: `HGB-${p.patient_id}`, level: 'URGENT', patient: p.patient_id,
      msg: `Patient ${p.patient_id} — Hgb ${p.hemoglobin_g_dl} g/dL — Severe anemia`,
      action: `Order blood transfusion for ${p.patient_id}`, time: ts,
    });
  });

  processed.filter((p: any) => p.hydration_level_percent < 45).forEach((p: any) => {
    alerts.push({
      id: `HYD-${p.patient_id}`, level: 'WARNING', patient: p.patient_id,
      msg: `Patient ${p.patient_id} — Hydration ${p.hydration_level_percent}% — Severe dehydration`,
      action: `Start IV fluid replacement immediately`, time: ts,
    });
  });

  return alerts.sort((a, b) => {
    const order: Record<string, number> = { CRITICAL:0, SYSTEM:1, URGENT:2, WARNING:3 };
    return (order[a.level]||9) - (order[b.level]||9);
  });
};
