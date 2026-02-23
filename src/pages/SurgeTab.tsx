import { C, mono, severityColor, panelStyle, heatColor } from '../data/theme';
import ClinicalBadge from '../components/clinical/ClinicalBadge';

interface SurgeTabProps {
  processed: any[];
  surgeMode: boolean;
  surgeFactor: number;
  onToggleSurge: () => void;
  onSurgeFactorChange: (v: number) => void;
  surgeReport: any;
  hm: any;
}

export default function SurgeTab({ processed, surgeMode, surgeFactor, onToggleSurge, onSurgeFactorChange, surgeReport, hm }: SurgeTabProps) {
  const surgeCount = processed.filter(p => p._surgeFlagged).length;

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <div style={{ ...panelStyle, borderColor: C.purple + '40', background: surgeMode ? C.purple + '06' : 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.purple, fontFamily: mono, letterSpacing: 2 }}>
              ⚠ MULTI-PATIENT SURGE MODE
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
              Sudden mass casualty event. 15% of patients flagged as emergency surge cases.
            </div>
            <div style={{ fontSize: 9, color: C.mutedHi, marginTop: 3, fontFamily: mono }}>
              Formula: R<sub>new</sub> = R<sub>base</sub> × (1 + SurgeFactor)
            </div>
          </div>
          <button onClick={onToggleSurge} style={{
            background: surgeMode ? C.purple + '25' : C.purple + '12',
            border: `2px solid ${C.purple}`, color: C.purple, padding: '10px 24px', borderRadius: 6,
            cursor: 'pointer', fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
          }}>
            {surgeMode ? '■ DEACTIVATE SURGE' : '▶ ACTIVATE SURGE MODE'}
          </button>
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 9, color: C.muted, fontFamily: mono, whiteSpace: 'nowrap' }}>SURGE FACTOR:</span>
          <input type="range" min={0.1} max={1.0} step={0.05} value={surgeFactor}
            onChange={e => onSurgeFactorChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: C.purple }} />
          <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.purple, minWidth: 40 }}>
            +{(surgeFactor * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>
          At +{(surgeFactor * 100).toFixed(0)}%, base score 60 → {Math.min(100, (60 * (1 + surgeFactor))).toFixed(1)}
        </div>
      </div>

      {surgeMode && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
            {([['Surge Patients', surgeCount, C.purple], ['New Critical', surgeReport?.newCritical?.length || 0, C.red],
              ['Need Transfer', surgeReport?.needTransfer?.length || 0, C.yellow],
            ] as [string, number, string][]).map(([l, v, c]) => (
              <div key={l} style={{ ...panelStyle, textAlign: 'center', marginBottom: 0, borderColor: c + '30' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: c, fontFamily: mono }}>{v}</div>
                <div style={{ fontSize: 8, color: C.muted, marginTop: 3, letterSpacing: 1 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div style={{ ...panelStyle, borderColor: C.purple + '30' }}>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 10, fontFamily: mono }}>ICU OVERFLOW LOGIC</div>
              <div style={{ fontSize: 12, color: hm.icuOverflow ? C.red : C.green, marginBottom: 6 }}>
                {hm.icuOverflow ? '⚠ ICU OVERFLOW DETECTED' : '✓ ICU Capacity Sufficient'}
              </div>
              <div style={{ fontSize: 10, color: C.text }}>Critical: <span style={{ color: C.red, fontFamily: mono }}>{hm.criticalCount}</span></div>
              <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>Stress after surge: <span style={{ color: C.purple, fontFamily: mono }}>{(hm.stress * 100).toFixed(1)}%</span></div>
            </div>
            <div style={{ ...panelStyle, borderColor: C.purple + '30' }}>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 10, fontFamily: mono }}>VENTILATOR PRESSURE</div>
              <div style={{ fontSize: 10, color: C.text, marginBottom: 6 }}>
                Pressure: <span style={{ color: hm.ventPress > 0.7 ? C.red : C.yellow, fontFamily: mono }}>{(hm.ventPress * 100).toFixed(1)}%</span>
              </div>
              {hm.ventShortage && <div style={{ color: C.red, fontSize: 11 }}>⚠ Ventilator Shortage</div>}
            </div>
          </div>

          <div style={{ ...panelStyle, borderColor: C.purple + '35' }}>
            <div style={{ fontSize: 9, color: C.purple, letterSpacing: 2, marginBottom: 12, fontFamily: mono }}>SURGE ALERT REPORT</div>
            {processed.filter(p => p._surgeFlagged).map(p => {
              const sc = severityColor(p.severity);
              return (
                <div key={p.patient_id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: mono, color: C.purple, fontSize: 11, fontWeight: 700, minWidth: 50 }}>{p.patient_id}</span>
                  <ClinicalBadge label={p.severity} color={sc} />
                  <span style={{ fontFamily: mono, fontSize: 10, color: C.text }}>
                    Base: <span style={{ color: C.muted }}>{p.baseScore?.toFixed(1)}</span>
                    → Surge: <span style={{ color: C.purple, fontWeight: 700 }}>{p.score.toFixed(1)}</span>
                  </span>
                  <span style={{ fontSize: 9, color: C.muted }}>Bed: {p.bed}</span>
                  {p.severity === 'Critical' && <ClinicalBadge label="⚠ IMMEDIATE INTERVENTION" color={C.red} />}
                </div>
              );
            })}
          </div>

          {surgeReport?.needTransfer?.length > 0 && (
            <div style={{ ...panelStyle, borderColor: C.red + '35' }}>
              <div style={{ fontSize: 9, color: C.red, letterSpacing: 2, marginBottom: 10, fontFamily: mono }}>PATIENTS REQUIRING TRANSFER</div>
              {surgeReport.needTransfer.map((p: any) => (
                <div key={p.patient_id} style={{ padding: '6px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontFamily: mono, color: C.red, fontWeight: 700 }}>{p.patient_id}</span>
                  <span style={{ fontSize: 10, color: C.text }}>Score: {p.score.toFixed(1)}</span>
                  <span style={{ fontSize: 9, color: C.muted }}>→ Transfer to higher-capacity facility</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!surgeMode && (
        <div style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 12, fontFamily: mono }}>
          Surge Mode is <span style={{ color: C.yellow }}>INACTIVE</span> — Click "ACTIVATE SURGE MODE" to simulate
        </div>
      )}
    </div>
  );
}
