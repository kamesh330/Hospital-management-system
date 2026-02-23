import { useState } from 'react';
import { C, mono, stressColor, panelStyle } from '../data/theme';
import ClinicalBadge from '../components/clinical/ClinicalBadge';
import ClinicalBar from '../components/clinical/ClinicalBar';
import ClinicalInput from '../components/clinical/ClinicalInput';

interface HospitalTabProps {
  hm: any;
  hospital: any;
  onUpdateHospital: (field: string, val: number) => void;
}

export default function HospitalTab({ hm, hospital, onUpdateHospital }: HospitalTabProps) {
  const [edit, setEdit] = useState(false);
  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, fontFamily: mono }}>HOSPITAL RESOURCE ENGINE — SECTIONS 9 & 10</div>
        <button onClick={() => setEdit(!edit)} style={{
          background: C.accent, color: C.bg, border: 'none', borderRadius: 4,
          padding: '6px 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: mono,
        }}>
          {edit ? '✓ DONE' : 'EDIT HOSPITAL DATA'}
        </button>
      </div>

      {edit && (
        <div style={{ ...panelStyle, borderColor: C.borderHi }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 12, fontFamily: mono }}>HOSPITAL_RESOURCE_STATUS — EDIT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {([['total_beds', 'Total Beds'], ['occupied_beds', 'Occupied Beds'], ['icu_beds_total', 'ICU Total'],
              ['icu_beds_occupied', 'ICU Occupied'], ['er_capacity', 'ER Capacity'], ['er_occupied', 'ER Occupied'],
              ['ongoing_operations_count', 'Ongoing Ops'], ['available_doctors', 'Doctors'],
              ['ventilators_available', 'Ventilators'], ['oxygen_supply_level_percent', 'O₂ Supply %'],
            ] as [string, string][]).map(([field, label]) => (
              <ClinicalInput key={field} label={label} value={hospital[field]} onChange={v => onUpdateHospital(field, v)} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={panelStyle}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 12, fontFamily: mono }}>SECTION 9.1 — RATIOS</div>
          {([['Bed Availability', hm.bedAvail, C.green], ['ICU Availability', hm.icuAvail, C.yellow],
            ['ER Load', hm.erLoad, C.red], ['Operation Load', hm.opLoad, C.mutedHi],
            ['Ventilator Pressure', hm.ventPress, hm.ventShortage ? C.red : C.accent],
          ] as [string, number, string][]).map(([label, val, col]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <ClinicalBar label={label} value={val} color={col} />
              <div style={{ fontSize: 8, color: C.muted, fontFamily: mono }}>= {val.toFixed(4)}</div>
            </div>
          ))}
        </div>

        <div style={panelStyle}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 12, fontFamily: mono }}>SECTION 9.2 — STRESS INDEX</div>
          <div style={{
            background: C.bgDeep, borderRadius: 6, padding: 12, fontFamily: mono,
            fontSize: 9, color: C.accent, marginBottom: 12, lineHeight: 2,
          }}>
            <div>Stress = 0.25×(1−Bed) + 0.30×(1−ICU) + 0.20×ER</div>
            <div style={{ paddingLeft: 60 }}>+ 0.15×Op + 0.10×Vent</div>
            <div style={{ color: C.muted, marginTop: 4 }}>Σ weights = 1.00</div>
            <div style={{ color: C.green, fontSize: 14, marginTop: 6 }}>= {hm.stress.toFixed(4)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 44, fontFamily: mono, fontWeight: 700, color: stressColor(hm.stress) }}>
              {(hm.stress * 100).toFixed(1)}
            </div>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5 }}>STRESS INDEX / 100</div>
            <div style={{ marginTop: 8 }}><ClinicalBadge label={hm.stressClass} color={stressColor(hm.stress)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {([['ER STATUS', hm.erStatus, hm.erStatus === 'Admit' ? C.green : C.red],
              ['ADMISSIONS', hm.admitStatus === 'Accepting Patients' ? 'OPEN' : 'CLOSED', hm.admitStatus === 'Accepting Patients' ? C.green : C.red],
            ] as [string, string, string][]).map(([t, v, c]) => (
              <div key={t} style={{ background: C.bgDeep, borderRadius: 6, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 8, color: C.muted, marginBottom: 4 }}>{t}</div>
                <ClinicalBadge label={v} color={c} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={panelStyle}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8, fontFamily: mono }}>ACTIVE ALERTS</div>
        {hm.alerts.length === 0
          ? <div style={{ color: C.green, fontSize: 12 }}>✓ No active alerts — system within normal parameters</div>
          : hm.alerts.map((a: any, i: number) => (
            <div key={i} style={{
              color: a.type === 'surge' ? C.purple : a.type === 'o2' ? C.teal : C.red,
              fontSize: 12, padding: '5px 0', borderBottom: `1px solid ${C.border}`,
            }}>{a.msg}</div>
          ))}
      </div>
    </div>
  );
}
