import { C, mono } from '../../data/theme';
const Bar = ({ label, value, color, max=1 }) => {
  const pct = Math.min(100, (value/max)*100);
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:C.muted, marginBottom:3 }}>
        <span>{label}</span>
        <span style={{ color, fontFamily:mono }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height:4, background:'#0a1830', borderRadius:2 }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:2,
          transition:'width 0.5s ease', boxShadow:`0 0 8px ${color}66` }} />
      </div>
    </div>
  );
};
export default Bar;
