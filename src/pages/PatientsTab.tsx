import { useState } from 'react';
import { C, mono, severityColor, panelStyle, heatColor } from '../data/theme';
import { DIET_ICONS } from '../data/dietMenu';
import ClinicalBadge from '../components/clinical/ClinicalBadge';
import FoodMenuCard from '../components/FoodMenuCard';

interface PatientsTabProps {
  processed: any[];
  selectedPid: string | null;
  onSelectPid: (pid: string | null) => void;
  onAddPatient: () => void;
}

export default function PatientsTab({ processed, selectedPid, onSelectPid, onAddPatient }: PatientsTabProps) {
  const [showLog, setShowLog] = useState<Record<string, boolean>>({});

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, fontFamily: mono }}>PATIENT ANALYSIS ENGINE — {processed.length} PATIENTS</div>
        <button onClick={onAddPatient} style={{
          background: C.accent, color: C.bg, border: 'none', borderRadius: 4,
          padding: '6px 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: mono, letterSpacing: 1,
        }}>+ ADD PATIENT</button>
      </div>

      {processed.map(p => {
        const isSel = selectedPid === p.patient_id;
        const logO = showLog[p.patient_id];
        const sc = severityColor(p.severity);
        const heat = heatColor(p.score);
        return (
          <div key={p.patient_id} style={{
            ...panelStyle,
            borderColor: isSel ? sc + '60' : p._surgeFlagged ? C.purple + '30' : C.border,
            background: p._surgeFlagged ? C.purple + '04' : C.panel,
            transition: 'border-color .2s',
          }}>
            <div onClick={() => onSelectPid(isSel ? null : p.patient_id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', border: `2px solid ${heat}`,
                background: heat + '10', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: mono, fontWeight: 700, color: heat, fontSize: 12, flexShrink: 0,
              }}>
                {p.score.toFixed(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: mono, fontSize: 13, color: C.text }}>
                  {p.patient_id}
                  {p._surgeFlagged && <span style={{ color: C.purple, marginLeft: 6, fontSize: 10 }}>⚡ SURGE</span>}
                  <span style={{ fontSize: 9, color: C.muted, marginLeft: 10 }}>
                    Age {p.age} · {p.gender} · {p.admission_type} · {p.diagnosis_category}
                  </span>
                </div>
                <div style={{ marginTop: 4, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <ClinicalBadge label={p.severity} color={sc} />
                  <ClinicalBadge label={p.bed} color={p.bed === 'ICU' ? C.red : p.bed === 'General Bed' ? C.yellow : C.green} />
                  <span style={{ fontSize: 9, color: C.text }}>{DIET_ICONS[p.diet]} {p.diet}</span>
                  {p.chronic_disease_flag === 1 && <ClinicalBadge label="CHRONIC" color={C.yellow} small />}
                  {p.emergency_case_flag === 1 && <ClinicalBadge label="EMERGENCY" color={C.red} small />}
                  {p.icu_required_flag === 1 && <ClinicalBadge label="ICU REQ" color={C.red} small />}
                </div>
              </div>
              <div style={{ fontSize: 8, color: C.muted, fontFamily: mono }}>VDI: {(p.vdi * 100).toFixed(0)}%</div>
              <span style={{ fontSize: 9, color: C.muted }}>{isSel ? '▲' : '▼'}</span>
            </div>

            {isSel && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ background: C.bgDeep, borderRadius: 6, padding: 12 }}>
                    <div style={{ fontSize: 8, color: C.muted, letterSpacing: 1.2, marginBottom: 8, fontFamily: mono }}>DEVIATION INDICES</div>
                    {([['HR_dev', p.deviations.HR], ['BP_dev', p.deviations.BP],
                      ['O2_drop', p.deviations.O2], ['Fever', p.deviations.Fever],
                      ['Resp_dev', p.deviations.Resp], ['Sugar', p.deviations.Sugar],
                      ['Age_risk', p.deviations.Age], ['BMI_risk', p.deviations.BMI],
                      ['Anemia', p.deviations.Hgb], ['Hyd_def', p.deviations.Hyd],
                    ] as [string, number][]).map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, padding: '2px 0' }}>
                        <span style={{ color: C.muted }}>{label}</span>
                        <span style={{ fontFamily: mono, color: C.text }}>{typeof val === 'number' ? val.toFixed(3) : val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: C.bgDeep, borderRadius: 6, padding: 12 }}>
                    <div style={{ fontSize: 8, color: C.muted, letterSpacing: 1.2, marginBottom: 8, fontFamily: mono }}>RECOMMENDATIONS</div>
                    {([['DIET', `${DIET_ICONS[p.diet]} ${p.diet}`, C.accent],
                      ['ROOM TEMP', p.roomTemp, C.mutedHi],
                      ['BED ALLOCATION', p.bed, sc],
                    ] as [string, string, string][]).map(([lbl, val, col]) => (
                      <div key={lbl} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 8, color: C.muted, marginBottom: 3 }}>{lbl}</div>
                        <ClinicalBadge label={val} color={col} />
                      </div>
                    ))}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 8, color: C.muted, marginBottom: 3 }}>RISK SCORE</div>
                      <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: sc }}>{p.score.toFixed(2)}</span>
                      <span style={{ fontSize: 9, color: C.muted }}> / 100</span>
                    </div>
                  </div>
                  <div style={{ background: C.bgDeep, borderRadius: 6, padding: 12 }}>
                    <div style={{ fontSize: 8, color: C.muted, letterSpacing: 1.2, marginBottom: 8, fontFamily: mono }}>VITAL PARAMETERS</div>
                    {([['HR', `${p.heart_rate_bpm} bpm`], ['SBP/DBP', `${p.systolic_bp_mmHg}/${p.diastolic_bp_mmHg} mmHg`],
                      ['O₂ Sat', `${p.oxygen_saturation_percent}%`], ['Temp', `${p.body_temperature_celsius}°C`],
                      ['Resp Rate', `${p.respiratory_rate_bpm} bpm`], ['Blood Sugar', `${p.blood_sugar_mg_dl} mg/dL`],
                      ['BMI', p.bmi.toFixed(1)], ['Hemoglobin', `${p.hemoglobin_g_dl} g/dL`], ['Hydration', `${p.hydration_level_percent}%`],
                    ] as [string, string][]).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '2px 0' }}>
                        <span style={{ color: C.muted }}>{k}</span>
                        <span style={{ fontFamily: mono, color: C.text }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <FoodMenuCard diet={p.diet} />
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => setShowLog({ ...showLog, [p.patient_id]: !logO })}
                    style={{
                      background: 'transparent', border: `1px solid ${C.border}`, color: C.muted,
                      padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 8, fontFamily: mono, letterSpacing: 1,
                    }}>
                    {logO ? '▲ HIDE' : '▼ SHOW'} EXPLANATION LOG
                  </button>
                  {logO && (
                    <div style={{
                      marginTop: 6, background: C.bgDeep, borderRadius: 6, padding: 12,
                      fontFamily: mono, fontSize: 9, border: `1px solid ${C.border}`, lineHeight: 1.8,
                    }}>
                      {p.log.map((line: string, i: number) => (
                        <div key={i} style={{ color: i === p.log.length - 1 ? C.green : C.text }}>&gt; {line}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
