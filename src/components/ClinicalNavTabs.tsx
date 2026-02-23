import { C, mono } from '../data/theme';

const TABS = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'heatmap',    label: 'Risk Heatmap' },
  { id: 'patients',   label: 'Patients' },
  { id: 'hospital',   label: 'Hospital' },
  { id: 'surge',      label: 'Surge Mode' },
  { id: 'o2crisis',   label: 'O₂ Crisis' },
  { id: 'alerts',     label: 'Staff Alerts' },
  { id: 'data-entry', label: 'Data Entry' },
];

interface NavTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

const ClinicalNavTabs = ({ activeTab, onTabChange, alertCount }: NavTabsProps) => (
  <div style={{
    padding: '6px 24px', borderBottom: `1px solid ${C.border}`,
    display: 'flex', gap: 2, background: C.bg, overflowX: 'auto', flexWrap: 'nowrap',
  }}>
    {TABS.map(t => (
      <button key={t.id} onClick={() => onTabChange(t.id)} style={{
        padding: '8px 16px',
        background: activeTab === t.id ? C.accent : 'transparent',
        color: activeTab === t.id ? C.bg : C.muted,
        border: activeTab === t.id ? 'none' : `1px solid transparent`,
        cursor: 'pointer',
        fontFamily: mono, fontSize: 10, fontWeight: 600, letterSpacing: 1.2,
        textTransform: 'uppercase' as const, borderRadius: 3, whiteSpace: 'nowrap' as const,
        transition: 'all 0.15s', position: 'relative' as const,
      }}>
        {t.label}
        {t.id === 'alerts' && alertCount > 0 && (
          <span style={{
            position: 'absolute' as const, top: 2, right: 2, background: C.red,
            color: '#fff', fontSize: 8, borderRadius: '50%', width: 14, height: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
          }}>
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </button>
    ))}
  </div>
);

export default ClinicalNavTabs;
