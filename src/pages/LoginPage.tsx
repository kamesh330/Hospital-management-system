import { useState } from 'react';
import { authenticate } from '../engine/authEngine';
import { C, mono, serif } from '../data/theme';

interface LoginPageProps {
  onLogin: (id: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [shk, setShk] = useState(false);

  const tryLogin = () => {
    if (authenticate(id.trim().toUpperCase(), pw)) {
      onLogin(id.trim().toUpperCase());
    } else {
      setErr('Invalid Hospital Credentials');
      setShk(true);
      setTimeout(() => setShk(false), 500);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', background: C.bgDeep, border: `1px solid ${C.borderHi}`, borderRadius: 6,
    color: C.text, padding: '12px 14px', fontSize: 13, fontFamily: mono, outline: 'none',
    boxSizing: 'border-box', letterSpacing: 1,
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${C.accent} 1px, transparent 1px), linear-gradient(90deg, ${C.accent} 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      <div style={{ width: 420, position: 'relative', zIndex: 10, animation: 'fadeUp .6s ease' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: '50%',
            border: `1px solid ${C.borderHi}`, marginBottom: 14, fontSize: 24,
            animation: 'hbeat 2.2s ease-in-out infinite',
          }}>❤️</div>
          <h1 style={{
            margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: 3,
            color: C.accent, fontFamily: serif,
          }}>
            CarePulse<span style={{ color: C.mutedHi, fontSize: 18 }}>++</span>
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: C.muted, letterSpacing: 1.5, fontFamily: mono }}>
            CLINICAL COMMAND CENTER
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12,
            padding: '3px 12px', border: `1px solid ${C.green}30`, borderRadius: 12,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, animation: 'blink 1.8s infinite' }} />
            <span style={{ fontSize: 8, color: C.green, fontFamily: mono, letterSpacing: 1.5 }}>SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: C.panel, border: `1px solid ${C.borderHi}`, borderRadius: 8,
          padding: '32px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          animation: shk ? 'shake .4s ease' : 'none',
        }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2.5, marginBottom: 24, fontFamily: mono, textAlign: 'center' }}>
            ─── HOSPITAL AUTHENTICATION ───
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 9, color: C.mutedHi, letterSpacing: 1.2, marginBottom: 5, fontFamily: mono }}>HOSPITAL ID</label>
            <input type="text" placeholder="e.g. H001" value={id}
              onChange={e => { setId(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && tryLogin()}
              style={{ ...inp, textTransform: 'uppercase' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 9, color: C.mutedHi, letterSpacing: 1.2, marginBottom: 5, fontFamily: mono }}>PASSWORD</label>
            <input type="password" placeholder="••••••••••••" value={pw}
              onChange={e => { setPw(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && tryLogin()} style={inp} />
          </div>

          {err && <div style={{
            background: C.red + '10', border: `1px solid ${C.red}35`, borderRadius: 5,
            padding: '9px 12px', marginBottom: 14, fontSize: 11, color: C.red, fontFamily: mono, textAlign: 'center',
          }}>✗ {err}</div>}

          <button onClick={tryLogin} style={{
            width: '100%', background: C.accent, border: 'none', borderRadius: 6,
            color: C.bg, padding: '12px', fontSize: 11, fontWeight: 700, fontFamily: mono,
            letterSpacing: 2.5, cursor: 'pointer', textTransform: 'uppercase',
          }}>
            AUTHENTICATE & ENTER
          </button>

          <div style={{
            marginTop: 18, padding: '10px 12px', background: C.bgDeep,
            borderRadius: 6, border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: mono, marginBottom: 4 }}>DETERMINISTIC AUTH FORMULA</div>
            <div style={{ fontSize: 10, color: C.mutedHi, fontFamily: mono }}>
              password = <span style={{ color: C.accent }}>"CARE"</span> + hospital_id + <span style={{ color: C.accent }}>"2026"</span>
            </div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: mono, marginTop: 3 }}>
              Example: H001 → <span style={{ color: C.yellow }}>CAREH0012026</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 9, color: C.muted, fontFamily: mono, letterSpacing: 1 }}>
          CAREPULSE++ v3.0 · CLASSICAL EDITION
        </div>
      </div>
    </div>
  );
}
