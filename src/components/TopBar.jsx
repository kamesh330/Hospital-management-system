import { C, mono, stressColor } from '../data/theme';
import Badge from './ui/Badge';

const TopBar = ({ hospitalId, patientCount, stressClass, stress, surgeMode, o2Crisis, onLogout }) => (
  <div style={{ borderBottom:`1px solid ${C.border}`, padding:'10px 24px', display:'flex',
    alignItems:'center', justifyContent:'space-between', background:'#030609',
    position:'sticky', top:0, zIndex:200 }}>
    <div>
      <div style={{ fontSize:18, fontWeight:700, letterSpacing:3, color:C.accent,
        fontFamily:mono, textShadow:`0 0 14px ${C.accent}55` }}>
        CARE<span style={{ color:C.accent2 }}>PULSE</span>
        <span style={{ color:C.mutedHi, fontSize:13 }}>++</span>
      </div>
      <div style={{ fontSize:8, color:C.muted, letterSpacing:2, marginTop:1 }}>
        CLINICAL COMMAND CENTER · SMART PATIENT MONITORING
      </div>
    </div>
    <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
      <Badge label={`HOSP ${hospitalId}`}       color={C.accent} />
      <Badge label={stressClass.toUpperCase()}   color={stressColor(stress)} />
      <Badge label={`${patientCount} PATIENTS`}  color={C.mutedHi} />
      {surgeMode && <Badge label="🚨 SURGE MODE" color={C.purple} />}
      {o2Crisis  && <Badge label="🫁 O₂ CRISIS"  color={C.teal} />}
      <button onClick={onLogout} style={{ background:`${C.red}18`, border:`1px solid ${C.red}44`,
        color:C.red, padding:'4px 12px', borderRadius:4, cursor:'pointer',
        fontFamily:mono, fontSize:10, fontWeight:700, letterSpacing:1 }}>⏻ LOGOUT</button>
    </div>
  </div>
);
export default TopBar;
