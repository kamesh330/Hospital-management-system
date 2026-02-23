import { C, mono, severityColor, panelStyle } from '../data/theme';
import Badge from '../components/ui/Badge';

export default function O2CrisisTab({ processed, hospital, o2Crisis, onToggleO2, onUpdateHospital, hm }) {
  const criticals = processed.filter(p=>p.severity==='Critical'||p.icu_required_flag===1);
  const shortage  = criticals.length > hospital.ventilators_available;
  const topK      = shortage
    ? criticals.slice().sort((a,b)=>b.score-a.score).slice(0,hospital.ventilators_available)
    : criticals;
  const topKIds   = new Set(topK.map(p=>p.patient_id));

  return (
    <div style={{ animation:'fadeIn .4s ease' }}>
      {/* Header */}
      <div style={{ ...panelStyle, borderColor:C.teal+'50', background:o2Crisis?C.teal+'06':'transparent' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.teal, fontFamily:mono, letterSpacing:2 }}>
              🫁 FEATURE 2 — OXYGEN CRISIS SIMULATION
            </div>
            <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>
              Oxygen supply drops below 40%. Critical + ICU patients risk amplified ×1.25.
            </div>
            <div style={{ fontSize:9, color:C.mutedHi, marginTop:3, fontFamily:mono }}>
              Rule: If O₂ supply &lt; 40% → CriticalRisk = CriticalRisk × 1.25
            </div>
            <div style={{ fontSize:9, color:C.mutedHi, fontFamily:mono }}>
              Rule: If ventilators_available &lt; Critical_Patients → Select top-K by risk only
            </div>
          </div>
          <button onClick={onToggleO2} style={{
            background: o2Crisis?C.teal+'30':C.teal+'14',
            border:`2px solid ${C.teal}`,
            color:C.teal, padding:'10px 22px', borderRadius:6, cursor:'pointer',
            fontFamily:mono, fontSize:11, fontWeight:700, letterSpacing:1.5,
          }}>
            {o2Crisis ? '■ DEACTIVATE O₂ CRISIS' : '▶ SIMULATE O₂ CRISIS'}
          </button>
        </div>

        {/* O2 Level control */}
        <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <div style={{ fontSize:8, color:C.muted, fontFamily:mono, marginBottom:6 }}>
              OXYGEN SUPPLY LEVEL: <span style={{ color:hospital.oxygen_supply_level_percent<40?C.red:C.green }}>
                {hospital.oxygen_supply_level_percent}%
              </span>
              {hospital.oxygen_supply_level_percent<40 && <span style={{ color:C.red }}> ⚠ CRISIS THRESHOLD</span>}
            </div>
            <input type="range" min={0} max={100} step={1}
              value={hospital.oxygen_supply_level_percent}
              onChange={e=>onUpdateHospital('oxygen_supply_level_percent',Number(e.target.value))}
              style={{ width:'100%', accentColor:hospital.oxygen_supply_level_percent<40?C.red:C.teal }} />
            <div style={{ fontSize:8, color:C.muted, marginTop:3 }}>Crisis triggers below 40% — drag left to simulate</div>
          </div>
          <div>
            <div style={{ fontSize:8, color:C.muted, fontFamily:mono, marginBottom:6 }}>VENTILATORS AVAILABLE</div>
            <input type="number" min={0} max={50} value={hospital.ventilators_available}
              onChange={e=>onUpdateHospital('ventilators_available',Number(e.target.value))}
              style={{ width:'80px', background:'#040a14', border:`1px solid ${C.border}`, borderRadius:4,
                color:C.text, padding:'5px 8px', fontSize:13, fontFamily:mono, outline:'none' }} />
            <div style={{ fontSize:8, color:C.muted, marginTop:4 }}>
              Critical patients: <span style={{ color:criticals.length>hospital.ventilators_available?C.red:C.green }}>
                {criticals.length}
              </span> &nbsp;|&nbsp; Available: <span style={{ color:C.teal }}>{hospital.ventilators_available}</span>
            </div>
          </div>
        </div>
      </div>

      {o2Crisis && (
        <>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
            {[
              ['Affected Patients',criticals.length,C.teal],
              ['Ventilators Available',hospital.ventilators_available,shortage?C.red:C.green],
              ['Top-K Allocated',topK.length,C.yellow],
            ].map(([l,v,c])=>(
              <div key={l} style={{ ...panelStyle, textAlign:'center', marginBottom:0, borderColor:c+'30' }}>
                <div style={{ fontSize:26, fontWeight:700, color:c, fontFamily:mono }}>{v}</div>
                <div style={{ fontSize:8, color:C.muted, marginTop:3, letterSpacing:1 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Ventilator allocation */}
          <div style={{ ...panelStyle, borderColor:C.teal+'44', marginBottom:14 }}>
            <div style={{ fontSize:9, color:C.teal, letterSpacing:2, marginBottom:12, fontFamily:mono }}>
              🫁 VENTILATOR ALLOCATION — {shortage?`SHORTAGE: top-${hospital.ventilators_available} by risk`:'Sufficient supply'}
            </div>
            {shortage && (
              <div style={{ background:C.red+'0a', border:`1px solid ${C.red}30`, borderRadius:6,
                padding:'10px 14px', marginBottom:12, fontSize:11, color:C.red }}>
                ⚠ SHORTAGE DETECTED — {criticals.length} critical patients but only {hospital.ventilators_available} ventilators.
                Allocating to top-{hospital.ventilators_available} highest-risk patients only.
              </div>
            )}
            {criticals.sort((a,b)=>b.score-a.score).map((p,i)=>{
              const allocated = topKIds.has(p.patient_id);
              const sc = severityColor(p.severity);
              return (
                <div key={p.patient_id} style={{ padding:'7px 0', borderBottom:`1px solid ${C.border}18`,
                  display:'flex', alignItems:'center', gap:10, flexWrap:'wrap',
                  opacity:allocated?1:0.45 }}>
                  <span style={{ fontSize:10, color:C.muted, fontFamily:mono, minWidth:20 }}>#{i+1}</span>
                  <span style={{ fontFamily:mono, color:C.teal, fontWeight:700, minWidth:50 }}>{p.patient_id}</span>
                  <Badge label={p.severity} color={sc} />
                  <span style={{ fontFamily:mono, fontSize:11, color:sc }}>{p.score.toFixed(1)}</span>
                  <span style={{ fontSize:9, color:C.muted }}>Hgb:{p.hemoglobin_g_dl} O₂:{p.oxygen_saturation_percent}%</span>
                  {allocated
                    ? <Badge label="✓ VENTILATOR ALLOCATED" color={C.green} />
                    : <Badge label="✗ NO VENTILATOR" color={C.red} />
                  }
                </div>
              );
            })}
          </div>

          {/* Bed prioritization */}
          <div style={{ ...panelStyle, borderColor:C.teal+'44' }}>
            <div style={{ fontSize:9, color:C.teal, letterSpacing:2, marginBottom:10, fontFamily:mono }}>
              🛏 BED PRIORITIZATION UNDER O₂ CRISIS
            </div>
            <div style={{ fontSize:10, color:C.text, marginBottom:8 }}>
              Critical + ICU patients re-scored ×1.25. New priority order:
            </div>
            {processed.filter(p=>p.severity==='Critical'||p.icu_required_flag===1)
              .slice().sort((a,b)=>b.score-a.score).map(p=>{
              const sc = severityColor(p.severity);
              return (
                <div key={p.patient_id} style={{ display:'flex', gap:8, alignItems:'center',
                  padding:'5px 0', borderBottom:`1px solid ${C.border}15`, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:mono, color:C.teal, minWidth:50 }}>{p.patient_id}</span>
                  <span style={{ fontFamily:mono, color:sc, fontWeight:700 }}>{p.score.toFixed(1)}</span>
                  <Badge label={p.severity} color={sc} />
                  <Badge label={p.bed} color={p.bed==='ICU'?C.red:C.yellow} />
                  {p.icu_required_flag===1 && <Badge label="ICU REQ" color={C.red} small />}
                </div>
              );
            })}
          </div>
        </>
      )}

      {!o2Crisis && (
        <div style={{ textAlign:'center', padding:40, color:C.muted, fontSize:12, fontFamily:mono }}>
          O₂ Crisis is <span style={{ color:C.yellow }}>INACTIVE</span> — Click "SIMULATE O₂ CRISIS" or drag O₂ level below 40%
        </div>
      )}
    </div>
  );
}
