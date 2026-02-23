import { useState } from 'react';
import { C, mono, severityColor, stressColor, panelStyle } from '../data/theme';
import { DIET_ICONS } from '../data/dietMenu';
import Badge from '../components/ui/Badge';
import Bar from '../components/ui/Bar';
import FoodMenuCard from '../components/FoodMenuCard';

export default function DashboardTab({ processed, hm, patientCount, surgeMode, o2Crisis, onPatientClick }) {
  const [foodOpen, setFoodOpen] = useState({});
  const critical = processed.filter(p=>p.severity==='Critical').length;
  const moderate = processed.filter(p=>p.severity==='Moderate').length;
  const stable   = processed.filter(p=>p.severity==='Stable').length;

  return (
    <div style={{ animation:'fadeIn .4s ease' }}>
      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
        {[['Total Patients',patientCount,C.accent],['Critical',critical,C.red],['Moderate',moderate,C.yellow],['Stable',stable,C.green]].map(([l,v,c])=>(
          <div key={l} style={{ ...panelStyle, textAlign:'center', padding:'14px 10px', marginBottom:0, borderColor:c+'30' }}>
            <div style={{ fontSize:30, fontWeight:700, color:c, fontFamily:mono, textShadow:`0 0 12px ${c}55` }}>{v}</div>
            <div style={{ fontSize:8, color:C.muted, letterSpacing:1.2, marginTop:3, textTransform:'uppercase' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Surge / O2 banners */}
      {surgeMode && (
        <div style={{ ...panelStyle, borderColor:C.purple+'60', background:C.purple+'08', marginBottom:14 }}>
          <div style={{ color:C.purple, fontFamily:mono, fontSize:12, fontWeight:700 }}>
            🚨 SURGE MODE ACTIVE — 15% of patients flagged as emergency surge cases — Risk scores escalated
          </div>
        </div>
      )}
      {o2Crisis && (
        <div style={{ ...panelStyle, borderColor:C.teal+'60', background:C.teal+'08', marginBottom:14 }}>
          <div style={{ color:C.teal, fontFamily:mono, fontSize:12, fontWeight:700 }}>
            🫁 OXYGEN CRISIS — Supply &lt; 40% — Critical patients risk ×1.25 — Ventilator top-K protocol active
          </div>
        </div>
      )}

      {/* Alerts */}
      {hm.alerts.length > 0 && (
        <div style={{ ...panelStyle, borderColor:C.red+'50', background:C.red+'06', marginBottom:14 }}>
          <div style={{ fontSize:8, color:C.red, letterSpacing:2, marginBottom:8, fontFamily:mono }}>▲ ACTIVE SYSTEM ALERTS</div>
          {hm.alerts.map((a,i)=>(
            <div key={i} style={{ color:a.type==='surge'?C.purple:a.type==='o2'?C.teal:C.red,
              fontSize:12, padding:'4px 0', borderBottom:i<hm.alerts.length-1?`1px solid ${C.red}15`:'none' }}>{a.msg}</div>
          ))}
        </div>
      )}

      {/* Hospital metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <div style={panelStyle}>
          <div style={{ fontSize:8, color:C.muted, letterSpacing:2, marginBottom:12, fontFamily:mono }}>HOSPITAL STRESS METRICS</div>
          <Bar label="Bed Occupancy"       value={1-hm.bedAvail}  color={hm.bedAvail<0.1?C.red:C.yellow} />
          <Bar label="ICU Occupancy"       value={1-hm.icuAvail}  color={C.red} />
          <Bar label="ER Load"             value={hm.erLoad}       color={hm.erLoad>=0.85?C.red:C.yellow} />
          <Bar label="Operation Load"      value={hm.opLoad}       color={C.accent2} />
          <Bar label="Ventilator Pressure" value={hm.ventPress}    color={hm.ventShortage?C.red:C.accent} />
          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}`,
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:10, color:C.muted }}>Stress Index</span>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:22, fontFamily:mono, color:stressColor(hm.stress), fontWeight:700 }}>
                {(hm.stress*100).toFixed(1)}%
              </div>
              <Badge label={hm.stressClass} color={stressColor(hm.stress)} />
            </div>
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ fontSize:8, color:C.muted, letterSpacing:2, marginBottom:12, fontFamily:mono }}>ER &amp; ADMISSION STATUS</div>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            {[['ER STATUS',hm.erStatus,hm.erStatus==='Admit'?C.green:C.red],
              ['ADMISSIONS',hm.admitStatus==='Accepting Patients'?'OPEN':'CLOSED',hm.admitStatus==='Accepting Patients'?C.green:C.red]]
              .map(([t,v,c])=>(
              <div key={t} style={{ flex:1, background:'#060f1c', borderRadius:6, padding:10, textAlign:'center' }}>
                <div style={{ fontSize:8, color:C.muted, marginBottom:5 }}>{t}</div>
                <Badge label={v} color={c} />
              </div>
            ))}
          </div>
          <div style={{ fontSize:8, color:C.muted, letterSpacing:1.2, marginBottom:6, fontFamily:mono }}>PROTOCOL FORMULAS (IMAGE-MATCHED)</div>
          {[['HR_dev = |HR−80|','w=0.15'],['BP_dev = |sys−120|+|dia−80|','w=0.15'],
            ['O2 = max(0, 0.95−SpO2)','w=0.20★'],['Fever = max(0,T−37.5)×10','w=0.10'],
            ['Resp = |RR−16|','w=0.10'],['Sugar: 0 if 70-140, else |S−100|','w=0.08'],
            ['Age = 5 if >60, else 0','w=0.07'],['BMI = 5 if <18.5 or >30','w=0.05'],
            ['Anemia = 5 if Hgb<10','w=0.05'],['Hyd = max(0,60−hydration)','w=0.05'],
          ].map(([k,v])=>(
            <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:9, padding:'2px 0', borderBottom:`1px solid ${C.border}20` }}>
              <span style={{ color:C.text, fontFamily:mono }}>{k}</span>
              <span style={{ color:C.accent, fontFamily:mono, flexShrink:0, marginLeft:8 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Patient priority queue */}
      <div style={panelStyle}>
        <div style={{ fontSize:8, color:C.muted, letterSpacing:2, marginBottom:12, fontFamily:mono }}>
          PATIENT PRIORITY QUEUE — sorted descending by risk score
          {surgeMode && <span style={{ color:C.purple, marginLeft:10 }}>⚡ SURGE SCORES ACTIVE</span>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'60px 60px 90px 1fr 90px 95px 95px', gap:6,
          padding:'4px 0', borderBottom:`1px solid ${C.borderHi}`, marginBottom:4 }}>
          {['PID','SCORE','SEVERITY','DIET / MENU','VDI','ROOM °C','BED'].map(h=>(
            <div key={h} style={{ fontSize:7, color:C.muted, fontFamily:mono, letterSpacing:1 }}>{h}</div>
          ))}
        </div>
        {processed.map(p=>{
          const fo = foodOpen[p.patient_id];
          const sc = severityColor(p.severity);
          const isSurge = p._surgeFlagged;
          return (
            <div key={p.patient_id} style={{ borderBottom:`1px solid ${C.border}18`, paddingBottom:fo?10:0 }}>
              <div style={{ display:'grid', gridTemplateColumns:'60px 60px 90px 1fr 90px 95px 95px', gap:6,
                padding:'7px 0', alignItems:'center',
                background:isSurge?C.purple+'06':'transparent', borderRadius:4 }}>
                <span onClick={()=>onPatientClick(p.patient_id)}
                  style={{ fontFamily:mono, color:isSurge?C.purple:C.accent, fontSize:10, cursor:'pointer', textDecoration:'underline dotted' }}>
                  {p.patient_id}{isSurge&&' ⚡'}
                </span>
                <div>
                  <span style={{ fontFamily:mono, fontSize:12, color:sc, fontWeight:700 }}>{p.score.toFixed(1)}</span>
                  {surgeMode && p.baseScore && p.score !== p.baseScore && (
                    <div style={{ fontSize:8, color:C.muted, fontFamily:mono }}>base:{p.baseScore.toFixed(1)}</div>
                  )}
                </div>
                <Badge label={p.severity} color={sc} />
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ fontSize:9, color:C.text }}>{DIET_ICONS[p.diet]} {p.diet}</span>
                  <button onClick={()=>setFoodOpen({...foodOpen,[p.patient_id]:!fo})}
                    style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted,
                      fontSize:7, borderRadius:3, padding:'1px 5px', cursor:'pointer', fontFamily:mono, flexShrink:0 }}>
                    {fo?'▲':'▼'}
                  </button>
                </div>
                {/* VDI bar */}
                <div>
                  <div style={{ fontSize:8, color:C.muted, marginBottom:2 }}>{(p.vdi*100).toFixed(0)}%</div>
                  <div style={{ height:3, background:'#0a1830', borderRadius:2 }}>
                    <div style={{ width:`${p.vdi*100}%`, height:'100%', borderRadius:2,
                      background:p.vdi>0.7?C.red:p.vdi>0.4?C.yellow:C.green,
                      boxShadow:`0 0 6px ${p.vdi>0.7?C.red:C.yellow}66` }} />
                  </div>
                </div>
                <span style={{ fontSize:9, color:C.mutedHi, fontFamily:mono }}>{p.roomTemp}</span>
                <Badge label={p.bed} color={p.bed==='ICU'?C.red:p.bed==='General Bed'?C.yellow:C.green} />
              </div>
              {fo && <FoodMenuCard diet={p.diet} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
