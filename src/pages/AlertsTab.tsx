import { C, mono, panelStyle } from '../data/theme';
import type { StaffAlert } from '../engine/hospitalEngine';

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  CRITICAL: { color: C.red, bg: C.red + '0a', label: '⚠ CRITICAL' },
  SYSTEM: { color: C.purple, bg: C.purple + '0a', label: '⚙ SYSTEM' },
  URGENT: { color: '#d48030', bg: '#d4803008', label: '⚡ URGENT' },
  WARNING: { color: C.yellow, bg: C.yellow + '0a', label: '⚠ WARNING' },
};

interface AlertsTabProps {
  alerts: StaffAlert[];
  onDismiss: (id: string) => void;
}

export default function AlertsTab({ alerts, onDismiss }: AlertsTabProps) {
  const critical = alerts.filter(a => a.level === 'CRITICAL').length;
  const urgent = alerts.filter(a => a.level === 'URGENT').length;
  const warning = alerts.filter(a => a.level === 'WARNING').length;
  const system = alerts.filter(a => a.level === 'SYSTEM').length;

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, fontFamily: mono, letterSpacing: 2 }}>
            DYNAMIC STAFF ALERTING SYSTEM
          </div>
          <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>
            Real-time alerts from patient vitals and hospital metrics
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {([['CRITICAL', critical, C.red], ['URGENT', urgent, C.yellow], ['SYSTEM', system, C.purple], ['WARNING', warning, '#d48030']] as [string, number, string][]).map(([l, v, c]) => (
            <div key={l} style={{ background: c + '0a', border: `1px solid ${c}25`, borderRadius: 6, padding: '6px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: mono }}>{v}</div>
              <div style={{ fontSize: 7, color: C.muted, letterSpacing: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div style={{ ...panelStyle, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
          <div style={{ color: C.green, fontFamily: mono, fontSize: 13 }}>All Clear — No Active Alerts</div>
          <div style={{ color: C.muted, fontSize: 10, marginTop: 6 }}>All patients within safe parameters</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map((alert, i) => {
            const cfg = LEVEL_CONFIG[alert.level] || LEVEL_CONFIG.WARNING;
            return (
              <div key={alert.id || i} style={{
                background: cfg.bg, border: `1px solid ${cfg.color}30`,
                borderLeft: `4px solid ${cfg.color}`, borderRadius: 6,
                padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14,
                animation: 'fadeIn .3s ease',
              }}>
                <div style={{ minWidth: 72 }}>
                  <div style={{
                    fontSize: 9, color: cfg.color, fontFamily: mono, fontWeight: 700,
                    background: cfg.color + '12', border: `1px solid ${cfg.color}25`,
                    borderRadius: 4, padding: '3px 6px', textAlign: 'center', letterSpacing: 0.5,
                  }}>
                    {cfg.label}
                  </div>
                  {alert.patient && (
                    <div style={{ fontSize: 8, color: C.muted, fontFamily: mono, marginTop: 4, textAlign: 'center' }}>
                      {alert.patient}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>{alert.msg}</div>
                  <div style={{ fontSize: 10, color: cfg.color, fontFamily: mono }}>▸ ACTION: {alert.action}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 8, color: C.muted, fontFamily: mono, marginBottom: 8 }}>{alert.time}</div>
                  <button onClick={() => onDismiss(alert.id)} style={{
                    background: 'transparent', border: `1px solid ${C.border}`,
                    color: C.muted, fontSize: 8, padding: '3px 8px', borderRadius: 3,
                    cursor: 'pointer', fontFamily: mono,
                  }}>DISMISS</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
