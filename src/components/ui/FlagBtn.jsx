import { C, mono } from '../../data/theme';
const FlagBtn = ({ label, active, color, onClick }) => (
  <button onClick={onClick} style={{ flex:1, padding:'4px 2px', background:active?color+'28':'transparent',
    border:`1px solid ${active?color:C.border}`, color:active?color:C.muted,
    borderRadius:3, cursor:'pointer', fontSize:10, fontFamily:mono }}>{label}</button>
);
export default FlagBtn;
