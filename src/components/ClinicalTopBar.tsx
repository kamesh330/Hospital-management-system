import { C, mono, serif, stressColor } from '../data/theme';
import ClinicalBadge from './clinical/ClinicalBadge';

interface TopBarProps {
  hospitalId: string;
  patientCount: number;
  stressClass: string;
  stress: number;
  surgeMode: boolean;
  o2Crisis: boolean;
  onLogout: () => void;
}

const ClinicalTopBar = ({ hospitalId, patientCount, stressClass, stress, surgeMode, o2Crisis, onLogout }: TopBarProps) => (
  <div style={{
    borderBottom: `1px solid ${C.border}`, padding: '12px 24px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', background: C.bgDeep,
    position: 'sticky', top: 0, zIndex: 200,
  }}>
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: C.accent, fontFamily: serif }}>
        Care<span style={{ fontWeight: 800 }}>Pulse</span>
        <span style={{ color: C.mutedHi, fontSize: 14 }}>++</span>
      </div>
      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginTop: 1, fontFamily: mono }}>
        CLINICAL COMMAND CENTER
      </div>
    </div>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      <ClinicalBadge label={`HOSP ${hospitalId}`} color={C.accent} />
      <ClinicalBadge label={stressClass.toUpperCase()} color={stressColor(stress)} />
      <ClinicalBadge label={`${patientCount} PATIENTS`} color={C.mutedHi} />
      {surgeMode && <ClinicalBadge label="⚠ SURGE MODE" color={C.purple} />}
      {o2Crisis && <ClinicalBadge label="🫁 O₂ CRISIS" color={C.teal} />}
      <button onClick={onLogout} style={{
        background: C.red + '15', border: `1px solid ${C.red}35`,
        color: C.red, padding: '4px 14px', borderRadius: 4, cursor: 'pointer',
        fontFamily: mono, fontSize: 10, fontWeight: 600, letterSpacing: 1,
      }}>⏻ LOGOUT</button>
    </div>
  </div>
);

export default ClinicalTopBar;
