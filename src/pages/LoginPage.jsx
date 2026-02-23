import { useState } from 'react';
import { authenticate } from '../engine/authEngine';
import { C, mono } from '../data/theme';

export default function LoginPage({ onLogin }) {
  const [id,  setId]  = useState('');
  const [pw,  setPw]  = useState('');
  const [err, setErr] = useState('');
  const [shk, setShk] = useState(false);

  const tryLogin = () => {
    if (authenticate(id.trim().toUpperCase(), pw)) { onLogin(id.trim().toUpperCase()); }
    else { setErr('Invalid Hospital Credentials'); setShk(true); setTimeout(()=>setShk(false),500); }
  };

  const inp = { width:'100%', background:'#030810', border:`1px solid ${C.borderHi}`, borderRadius:6,
    color:C.text, padding:'12px 14px', fontSize:13, fontFamily:mono, outline:'none',
    boxSizing:'border-box', letterSpacing:1 };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center',
      justifyContent:'center', position:'relative', overflow:'hidden',
      backgroundImage:`radial-gradient(ellipse at 15% 25%, #001830 0%, transparent 55%),
        radial-gradient(ellipse at 85% 75%, #120022 0%, transparent 55%)` }}>
      <style>{`
        @keyframes pulse  {0%,100%{opacity:.35;transform:translate(-50%,-50%) scale(1)}50%{opacity:.1;transform:translate(-50%,-50%) scale(1.06)}}
        @keyframes pulse2 {0%,100%{opacity:.2;transform:translate(-50%,-50%) scale(1)}50%{opacity:.06;transform:translate(-50%,-50%) scale(1.04)}}
        @keyframes shake  {0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes fadeUp {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink  {0%,100%{opacity:1}50%{opacity:.15}}
        @keyframes hbeat  {0%,100%{transform:scale(1)}30%{transform:scale(1.18)}50%{transform:scale(1)}70%{transform:scale(1.1)}90%{transform:scale(1)}}
        input:focus{border-color:${C.accent}!important;box-shadow:0 0 0 2px ${C.accent}18!important;}
      `}</style>

      {/* Grid */}
      <div style={{ position:'absolute', inset:0, opacity:.03, pointerEvents:'none',
        backgroundImage:`linear-gradient(${C.accent} 1px,transparent 1px),linear-gradient(90deg,${C.accent} 1px,transparent 1px)`,
        backgroundSize:'40px 40px' }} />
      {/* Rings */}
      {[240,400,560].map((s,i)=>(
        <div key={i} style={{ position:'absolute', width:s, height:s, borderRadius:'50%',
          border:`1px solid ${C.accent}${['18','0d','07'][i]}`, top:'50%', left:'50%',
          animation:`pulse${i>0?i+1:''} ${3.5+i*1.5}s ease-in-out infinite`, pointerEvents:'none' }} />
      ))}

      <div style={{ width:440, position:'relative', zIndex:10, animation:'fadeUp .6s ease' }}>
        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:30 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:64, height:64, borderRadius:'50%',
            background:`radial-gradient(circle,${C.accent}15 0%,transparent 70%)`,
            border:`1px solid ${C.accent}28`, marginBottom:12, fontSize:26,
            animation:'hbeat 2.2s ease-in-out infinite' }}>❤️</div>
          <h1 style={{ margin:0, fontSize:34, fontWeight:700, letterSpacing:4,
            color:C.accent, fontFamily:mono, textShadow:`0 0 22px ${C.accent}44` }}>
            CARE<span style={{ color:C.accent2 }}>PULSE</span>
            <span style={{ color:C.mutedHi, fontSize:18 }}>++</span>
          </h1>
          <p style={{ margin:'8px 0 0', fontSize:10, color:C.muted, letterSpacing:1.5 }}>
            CLINICAL COMMAND CENTER · SMART PATIENT MONITORING
          </p>
          <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:10,
            padding:'3px 12px', border:`1px solid ${C.green}30`, borderRadius:12, background:`${C.green}08` }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:C.green, animation:'blink 1.8s infinite' }} />
            <span style={{ fontSize:8, color:C.green, fontFamily:mono, letterSpacing:1.5 }}>SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:C.panel, border:`1px solid ${C.borderHi}`, borderRadius:14,
          padding:'30px 28px', boxShadow:`0 24px 60px #00000099`,
          animation:shk?'shake .4s ease':'none' }}>
          <div style={{ fontSize:8, color:C.muted, letterSpacing:2.5, marginBottom:22, fontFamily:mono, textAlign:'center' }}>
            ─── HOSPITAL AUTHENTICATION ───
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:8, color:C.mutedHi, letterSpacing:1.2, marginBottom:5, fontFamily:mono }}>HOSPITAL ID</label>
            <input type="text" placeholder="e.g. H001" value={id}
              onChange={e=>{setId(e.target.value);setErr('');}}
              onKeyDown={e=>e.key==='Enter'&&tryLogin()}
              style={{ ...inp, textTransform:'uppercase' }} />
          </div>
          <div style={{ marginBottom:22 }}>
            <label style={{ display:'block', fontSize:8, color:C.mutedHi, letterSpacing:1.2, marginBottom:5, fontFamily:mono }}>PASSWORD</label>
            <input type="password" placeholder="••••••••••••" value={pw}
              onChange={e=>{setPw(e.target.value);setErr('');}}
              onKeyDown={e=>e.key==='Enter'&&tryLogin()} style={inp} />
          </div>

          {err && <div style={{ background:`${C.red}0e`, border:`1px solid ${C.red}40`, borderRadius:5,
            padding:'9px 12px', marginBottom:14, fontSize:11, color:C.red, fontFamily:mono, textAlign:'center' }}>✗ {err}</div>}

          <button onClick={tryLogin} style={{ width:'100%', background:`linear-gradient(135deg,${C.accent},${C.accent}99)`,
            border:'none', borderRadius:8, color:'#000', padding:'12px', fontSize:11,
            fontWeight:700, fontFamily:mono, letterSpacing:2.5, cursor:'pointer',
            textTransform:'uppercase', boxShadow:`0 4px 18px ${C.accent}44` }}>
            AUTHENTICATE &amp; ENTER
          </button>

          <div style={{ marginTop:16, padding:'10px 12px', background:'#030710',
            borderRadius:6, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:8, color:C.muted, fontFamily:mono, marginBottom:4 }}>DETERMINISTIC AUTH FORMULA</div>
            <div style={{ fontSize:10, color:C.mutedHi, fontFamily:mono }}>
              password = <span style={{ color:C.accent }}>"CARE"</span> + hospital_id + <span style={{ color:C.accent }}>"2026"</span>
            </div>
            <div style={{ fontSize:8, color:C.muted, fontFamily:mono, marginTop:3 }}>
              Example: H001 → <span style={{ color:C.accent2 }}>CAREH0012026</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:14, fontSize:8, color:C.muted, fontFamily:mono, letterSpacing:1 }}>
          CAREPULSE++ v3.0 · SURGE MODE · O₂ CRISIS · STAFF ALERTS · NO ML
        </div>
      </div>
    </div>
  );
}
