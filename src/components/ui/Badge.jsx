import { mono } from '../../data/theme';
const Badge = ({ label, color, small }) => (
  <span style={{ background:color+'18', color, border:`1px solid ${color}44`, borderRadius:3,
    padding:small?'1px 5px':'2px 9px', fontSize:small?9:10, fontWeight:700,
    letterSpacing:0.8, fontFamily:mono, whiteSpace:'nowrap' }}>{label}</span>
);
export default Badge;
