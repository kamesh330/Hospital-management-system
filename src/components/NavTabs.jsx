import { C, mono } from '../data/theme';
const TABS = [
  { id:'dashboard',   label:'Dashboard'   },
  { id:'heatmap',     label:'Risk Heatmap'},
  { id:'patients',    label:'Patients'    },
  { id:'hospital',    label:'Hospital'    },
  { id:'surge',       label:'Surge Mode'  },
  { id:'o2crisis',    label:'O₂ Crisis'   },
  { id:'alerts',      label:'Staff Alerts'},
  { id:'data-entry',  label:'Data Entry'  },
];
const NavTabs = ({ activeTab, onTabChange, alertCount }) => (
  <div style={{ padding:'6px 24px', borderBottom:`1px solid ${C.border}22`,
    display:'flex', gap:3, background:C.bg, overflowX:'auto', flexWrap:'nowrap' }}>
    {TABS.map(t => (
      <button key={t.id} onClick={() => onTabChange(t.id)} style={{
        padding:'6px 14px', background:activeTab===t.id?C.accent:'transparent',
        color:activeTab===t.id?'#000':C.muted, border:'none', cursor:'pointer',
        fontFamily:mono, fontSize:10, fontWeight:700, letterSpacing:1.2,
        textTransform:'uppercase', borderRadius:3, whiteSpace:'nowrap',
        transition:'all 0.15s', position:'relative',
      }}>
        {t.label}
        {t.id==='alerts' && alertCount>0 && (
          <span style={{ position:'absolute', top:2, right:2, background:C.red,
            color:'#fff', fontSize:8, borderRadius:'50%', width:14, height:14,
            display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </button>
    ))}
  </div>
);
export default NavTabs;
