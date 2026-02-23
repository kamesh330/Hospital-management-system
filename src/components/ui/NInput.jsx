import { C, mono } from '../../data/theme';
const NInput = ({ label, value, onChange, step=1, min, max }) => (
  <div style={{ marginBottom:8 }}>
    <label style={{ display:'block', fontSize:9, color:C.muted, marginBottom:3, letterSpacing:0.6, textTransform:'uppercase' }}>{label}</label>
    <input type="number" value={value} step={step} min={min} max={max}
      onChange={e=>onChange(Number(e.target.value))}
      style={{ width:'100%', background:'#040a14', border:`1px solid ${C.border}`, borderRadius:4,
        color:C.text, padding:'5px 8px', fontSize:12, fontFamily:mono, boxSizing:'border-box', outline:'none' }} />
  </div>
);
export default NInput;
