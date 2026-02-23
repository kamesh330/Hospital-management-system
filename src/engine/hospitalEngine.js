// ================================================================
// HOSPITAL RESOURCE ENGINE — Sections 9, 10, 11
// + Surge Mode + Oxygen Crisis extensions
// ================================================================

const clamp = (v) => Math.max(0, Math.min(1, v));

// Stress index weights (Σ = 1.0)
const SW = { a:0.25, b:0.30, c:0.20, d:0.15, e:0.10 };

export const computeHospitalMetrics = (h, processed, surgeMode=false, o2Crisis=false) => {
  const criticalCount = processed.filter(p => p.severity === 'Critical').length;

  // ── 9.1 RATIOS ─────────────────────────────────────────────────
  const bedAvail  = clamp((h.total_beds - h.occupied_beds) / h.total_beds);
  const icuAvail  = clamp((h.icu_beds_total - h.icu_beds_occupied) / h.icu_beds_total);
  const erLoad    = clamp(h.er_occupied / h.er_capacity);
  const opLoad    = clamp(h.ongoing_operations_count / Math.max(1, h.available_doctors));

  // Ventilator Pressure — modified by O2 crisis
  let ventPress = clamp(criticalCount / Math.max(1, h.ventilators_available));
  if (o2Crisis) {
    // If ventilators_available < Critical_Patients → additional pressure
    const shortage = Math.max(0, criticalCount - h.ventilators_available);
    ventPress = clamp((criticalCount + shortage * 0.5) / Math.max(1, h.ventilators_available));
  }

  // ── 9.2 STRESS INDEX ───────────────────────────────────────────
  let stress =
    SW.a * (1 - bedAvail) +
    SW.b * (1 - icuAvail) +
    SW.c * erLoad          +
    SW.d * opLoad          +
    SW.e * ventPress;

  // Surge mode pushes stress up
  if (surgeMode) stress = Math.min(1, stress * 1.20);
  // O2 crisis also elevates stress
  if (o2Crisis)  stress = Math.min(1, stress * 1.15);

  const stressClass =
    stress > 0.85  ? 'Emergency Escalation' :
    stress >= 0.60 ? 'Capacity Warning'     :
                     'Normal';

  // ── ER ADMISSION LOGIC ──────────────────────────────────────────
  const erStatus =
    stress > 0.9    ? 'ER Freeze' :
    erLoad >= 0.85  ? 'Redirect'  :
                      'Admit';

  const admitStatus = bedAvail < 0.1 ? 'Stop Admissions' : 'Accepting Patients';

  // ICU overflow
  const icuOverflow = icuAvail === 0 && criticalCount > h.icu_beds_total;

  // Ventilator shortage for top-K logic (O2 crisis)
  const ventShortage = criticalCount > h.ventilators_available;
  const topKPatients = ventShortage
    ? processed.filter(p => p.severity === 'Critical')
               .sort((a,b) => b.score - a.score)
               .slice(0, h.ventilators_available)
               .map(p => p.patient_id)
    : [];

  // ── ALERTS ─────────────────────────────────────────────────────
  const alerts = [];
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

// ── FEATURE 1: SURGE MODE ENGINE ────────────────────────────────
// Flag 15% of patients as surge cases (lowest-risk first to simulate new arrivals)
export const applySurgeMode = (patients, surgeFactor) => {
  const sorted = [...patients].sort((a,b) => a.score - b.score);
  const surgeCount = Math.max(1, Math.ceil(patients.length * 0.15));
  const surgeIds = new Set(sorted.slice(0, surgeCount).map(p => p.patient_id));
  return patients.map(p => ({ ...p, _surgeFlagged: surgeIds.has(p.patient_id) }));
};

// Generate Surge Alert Report
export const generateSurgeReport = (processed, hospital) => {
  const surgePatients  = processed.filter(p => p._surgeFlagged);
  const needTransfer   = processed.filter(p => p._surgeFlagged && p.severity === 'Critical' && hospital.icu_beds_total - hospital.icu_beds_occupied < 1);
  const newCritical    = processed.filter(p => p._surgeFlagged && p.severity === 'Critical');
  return { surgePatients, needTransfer, newCritical, surgeCount: surgePatients.length };
};

// ── FEATURE 2: OXYGEN CRISIS ENGINE ─────────────────────────────
// Returns whether O2 crisis is active + top-K ventilator list
export const getO2CrisisState = (hospital, processed) => {
  const active = hospital.oxygen_supply_level_percent < 40;
  const critical = processed.filter(p => p.severity === 'Critical' || p.icu_required_flag === 1);
  const shortage = critical.length > hospital.ventilators_available;
  const topK = shortage
    ? critical.sort((a,b) => b.score - a.score).slice(0, hospital.ventilators_available)
    : critical;
  return { active, shortage, topK, criticalCount: critical.length };
};

// ── FEATURE 3: DYNAMIC STAFF ALERTING SYSTEM ───────────────────
export const generateStaffAlerts = (processed, hospital, hm) => {
  const alerts = [];
  const ts = new Date().toLocaleTimeString();

  // Alert per critical patient
  processed.filter(p => p.severity === 'Critical').forEach(p => {
    alerts.push({
      id: `CRIT-${p.patient_id}`,
      level: 'CRITICAL',
      patient: p.patient_id,
      msg: `Patient ${p.patient_id} — CRITICAL (score ${p.score.toFixed(1)}) — Immediate intervention required`,
      action: `Assign senior physician + ICU nurse to ${p.patient_id}`,
      time: ts,
    });
  });

  // O2 saturation alerts
  processed.filter(p => p.oxygen_saturation_percent < 90).forEach(p => {
    alerts.push({
      id: `O2-${p.patient_id}`,
      level: 'URGENT',
      patient: p.patient_id,
      msg: `Patient ${p.patient_id} — O₂ SAT ${p.oxygen_saturation_percent}% — Below safe threshold`,
      action: `Respiratory team to ${p.patient_id} immediately`,
      time: ts,
    });
  });

  // Fever alerts
  processed.filter(p => p.body_temperature_celsius > 39.0).forEach(p => {
    alerts.push({
      id: `FVR-${p.patient_id}`,
      level: 'WARNING',
      patient: p.patient_id,
      msg: `Patient ${p.patient_id} — HIGH FEVER ${p.body_temperature_celsius}°C — Infection risk`,
      action: `Nurse to administer antipyretics, take cultures`,
      time: ts,
    });
  });

  // ICU overflow
  if (hm.icuOverflow) {
    alerts.push({
      id: 'ICU-OVERFLOW',
      level: 'SYSTEM',
      patient: null,
      msg: `ICU OVERFLOW — ${hm.criticalCount} critical patients exceed ICU capacity`,
      action: `Activate overflow protocol — prepare HDU beds`,
      time: ts,
    });
  }

  // ER freeze
  if (hm.erStatus === 'ER Freeze') {
    alerts.push({
      id: 'ER-FREEZE',
      level: 'SYSTEM',
      patient: null,
      msg: `ER FREEZE ACTIVATED — Hospital stress index ${(hm.stress*100).toFixed(1)}%`,
      action: `Divert ambulances to nearest available facility`,
      time: ts,
    });
  }

  // Ventilator shortage
  if (hm.ventShortage) {
    alerts.push({
      id: 'VENT-SHORT',
      level: 'CRITICAL',
      patient: null,
      msg: `VENTILATOR SHORTAGE — ${hm.criticalCount} critical patients, only ${hospital.ventilators_available} ventilators`,
      action: `Emergency procurement — request ventilators from district pool`,
      time: ts,
    });
  }

  // Low hemoglobin
  processed.filter(p => p.hemoglobin_g_dl < 8).forEach(p => {
    alerts.push({
      id: `HGB-${p.patient_id}`,
      level: 'URGENT',
      patient: p.patient_id,
      msg: `Patient ${p.patient_id} — Hgb ${p.hemoglobin_g_dl} g/dL — Severe anemia`,
      action: `Order blood transfusion for ${p.patient_id}`,
      time: ts,
    });
  });

  // Low hydration
  processed.filter(p => p.hydration_level_percent < 45).forEach(p => {
    alerts.push({
      id: `HYD-${p.patient_id}`,
      level: 'WARNING',
      patient: p.patient_id,
      msg: `Patient ${p.patient_id} — Hydration ${p.hydration_level_percent}% — Severe dehydration`,
      action: `Start IV fluid replacement immediately`,
      time: ts,
    });
  });

  return alerts.sort((a,b) => {
    const order = { CRITICAL:0, SYSTEM:1, URGENT:2, WARNING:3 };
    return (order[a.level]||9) - (order[b.level]||9);
  });
};
