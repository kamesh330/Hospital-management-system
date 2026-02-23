import { C, mono, panelStyle } from '../data/theme';
import ClinicalInput from '../components/clinical/ClinicalInput';
import ClinicalFlagBtn from '../components/clinical/ClinicalFlagBtn';

interface DataEntryTabProps {
  patients: any[];
  onAddPatient: () => void;
  onUpdatePatient: (pid: string, field: string, val: number) => void;
  editingPid: string | null;
  onSetEditingPid: (pid: string | null) => void;
}

export default function DataEntryTab({ patients, onAddPatient, onUpdatePatient, editingPid, onSetEditingPid }: DataEntryTabProps) {
  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, fontFamily: mono }}>PATIENT_CLINICAL_DATA — DATA ENTRY</div>
        <button onClick={onAddPatient} style={{
          background: C.accent, color: C.bg, border: 'none', borderRadius: 4,
          padding: '6px 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: mono,
        }}>+ NEW PATIENT</button>
      </div>

      {patients.map(p => {
        const isEd = editingPid === p.patient_id;
        return (
          <div key={p.patient_id} style={{ ...panelStyle, borderColor: isEd ? C.accent + '40' : C.border }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEd ? 14 : 0 }}>
              <div style={{ fontFamily: mono, color: C.accent, fontSize: 12 }}>{p.patient_id}</div>
              <button onClick={() => onSetEditingPid(isEd ? null : p.patient_id)} style={{
                background: isEd ? C.green : 'transparent', border: `1px solid ${isEd ? C.green : C.border}`,
                color: isEd ? C.bg : C.muted, padding: '3px 10px', borderRadius: 3,
                cursor: 'pointer', fontSize: 9, fontFamily: mono,
              }}>
                {isEd ? '✓ DONE' : 'EDIT'}
              </button>
            </div>
            {isEd && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                <ClinicalInput label="Age" value={p.age} onChange={v => onUpdatePatient(p.patient_id, 'age', v)} />
                <ClinicalInput label="Heart Rate (bpm)" value={p.heart_rate_bpm} onChange={v => onUpdatePatient(p.patient_id, 'heart_rate_bpm', v)} />
                <ClinicalInput label="Systolic BP" value={p.systolic_bp_mmHg} onChange={v => onUpdatePatient(p.patient_id, 'systolic_bp_mmHg', v)} />
                <ClinicalInput label="Diastolic BP" value={p.diastolic_bp_mmHg} onChange={v => onUpdatePatient(p.patient_id, 'diastolic_bp_mmHg', v)} />
                <ClinicalInput label="O₂ Saturation %" value={p.oxygen_saturation_percent} onChange={v => onUpdatePatient(p.patient_id, 'oxygen_saturation_percent', v)} min={0} max={100} />
                <ClinicalInput label="Temperature °C" value={p.body_temperature_celsius} onChange={v => onUpdatePatient(p.patient_id, 'body_temperature_celsius', v)} step={0.1} />
                <ClinicalInput label="Respiratory Rate" value={p.respiratory_rate_bpm} onChange={v => onUpdatePatient(p.patient_id, 'respiratory_rate_bpm', v)} />
                <ClinicalInput label="Blood Sugar" value={p.blood_sugar_mg_dl} onChange={v => onUpdatePatient(p.patient_id, 'blood_sugar_mg_dl', v)} />
                <ClinicalInput label="BMI" value={p.bmi} onChange={v => onUpdatePatient(p.patient_id, 'bmi', v)} step={0.1} />
                <ClinicalInput label="Hemoglobin g/dL" value={p.hemoglobin_g_dl} onChange={v => onUpdatePatient(p.patient_id, 'hemoglobin_g_dl', v)} step={0.1} />
                <ClinicalInput label="Hydration %" value={p.hydration_level_percent} onChange={v => onUpdatePatient(p.patient_id, 'hydration_level_percent', v)} min={0} max={100} />
                <div />
                {([['CHRONIC DISEASE', 'chronic_disease_flag', C.yellow],
                  ['EMERGENCY CASE', 'emergency_case_flag', C.red],
                  ['ICU REQUIRED', 'icu_required_flag', C.red],
                ] as [string, string, string][]).map(([label, field, col]) => (
                  <div key={field}>
                    <div style={{ fontSize: 8, color: C.muted, marginBottom: 4, fontFamily: mono }}>{label}</div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <ClinicalFlagBtn label="NO" active={p[field] === 0} color={col} onClick={() => onUpdatePatient(p.patient_id, field, 0)} />
                      <ClinicalFlagBtn label="YES" active={p[field] === 1} color={col} onClick={() => onUpdatePatient(p.patient_id, field, 1)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
