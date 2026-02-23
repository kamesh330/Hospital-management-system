import { C, mono, heatColor, severityColor } from '../data/theme';

const VDI_LABELS = ['HR', 'BP', 'O₂', 'Fever', 'Resp', 'Sugar', 'Age', 'BMI', 'Hgb', 'Hyd'];
const VDI_KEYS = ['HR', 'BP', 'O2', 'Fever', 'Resp', 'Sugar', 'Age', 'BMI', 'Hgb', 'Hyd'];

export default function HeatmapTab({ processed }: { processed: any[] }) {
  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 16, fontFamily: mono }}>
        CLINICAL COMMAND CENTER — SEVERITY HEATMAP · VITAL DEVIATION INDEX
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, color: C.muted, fontFamily: mono }}>RISK SCALE:</span>
        {([['0–25', C.teal, 'Low'], ['25–40', C.green, 'Guarded'], ['40–55', C.yellow, 'Moderate'],
          ['55–70', '#d48030', 'Elevated'], ['70–85', '#c95030', 'High'], ['85–100', C.red, 'Critical']] as [string, string, string][]).map(([r, c, l]) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
            <span style={{ fontSize: 8, color: C.muted, fontFamily: mono }}>{l} ({r})</span>
          </div>
        ))}
      </div>

      {/* Ward Heatmap Grid */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: C.accent, fontFamily: mono, letterSpacing: 1.5, marginBottom: 10 }}>
          ▸ WARD HEATMAP — Each cell = one patient
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 8 }}>
          {processed.map(p => {
            const heat = heatColor(p.score);
            const sc = severityColor(p.severity);
            return (
              <div key={p.patient_id} style={{
                background: heat + '12', border: `1px solid ${heat}40`, borderRadius: 6,
                padding: '12px 10px', position: 'relative', cursor: 'default', transition: 'transform .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                {p._surgeFlagged && (
                  <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 8, color: C.purple }}>⚡</div>
                )}
                <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: heat, marginBottom: 4 }}>
                  {p.patient_id}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', border: `2px solid ${heat}`, background: heat + '10',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: heat, fontFamily: mono,
                  }}>
                    {p.score.toFixed(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: sc, fontWeight: 700 }}>{p.severity}</div>
                    <div style={{ fontSize: 8, color: C.muted }}>{p.bed}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 7, color: C.muted, marginBottom: 2 }}>VDI {(p.vdi * 100).toFixed(0)}%</div>
                  <div style={{ height: 3, background: C.bgDeep, borderRadius: 2 }}>
                    <div style={{ width: `${p.vdi * 100}%`, height: '100%', borderRadius: 2, background: heat }} />
                  </div>
                </div>
                <div style={{ fontSize: 7, color: C.muted, marginTop: 4 }}>
                  {Object.entries(p.normalised)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 2)
                    .map(([k, v]) => (
                      <span key={k} style={{ marginRight: 4, color: (v as number) > 0.6 ? C.red : (v as number) > 0.35 ? C.yellow : C.green }}>
                        {k}:{((v as number) * 100).toFixed(0)}%
                      </span>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vital Deviation Index — full matrix */}
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: 18 }}>
        <div style={{ fontSize: 9, color: C.accent, fontFamily: mono, letterSpacing: 1.5, marginBottom: 12 }}>
          ▸ VITAL DEVIATION INDEX MATRIX — Normalised deviations per patient [0–1]
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 9 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: C.muted, padding: '4px 8px', borderBottom: `1px solid ${C.border}`, fontSize: 8 }}>PID</th>
                <th style={{ color: C.muted, padding: '4px 4px', borderBottom: `1px solid ${C.border}`, fontSize: 8 }}>SCORE</th>
                <th style={{ color: C.muted, padding: '4px 4px', borderBottom: `1px solid ${C.border}`, fontSize: 8 }}>SEV</th>
                {VDI_LABELS.map(l => (
                  <th key={l} style={{ color: C.muted, padding: '4px 4px', borderBottom: `1px solid ${C.border}`, fontSize: 8, textAlign: 'center' }}>{l}</th>
                ))}
                <th style={{ color: C.accent, padding: '4px 4px', borderBottom: `1px solid ${C.border}`, fontSize: 8, textAlign: 'center' }}>VDI</th>
              </tr>
            </thead>
            <tbody>
              {processed.map(p => {
                const sc = severityColor(p.severity);
                return (
                  <tr key={p.patient_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '4px 8px', color: C.accent, fontWeight: 700 }}>{p.patient_id}</td>
                    <td style={{ padding: '4px 4px', color: sc, textAlign: 'center', fontWeight: 700 }}>{p.score.toFixed(1)}</td>
                    <td style={{ padding: '4px 4px', textAlign: 'center' }}>
                      <span style={{ color: sc, fontSize: 8 }}>{p.severity.slice(0, 3).toUpperCase()}</span>
                    </td>
                    {VDI_KEYS.map(k => {
                      const val = p.normalised[k] || 0;
                      const cell = val > 0.7 ? C.red : val > 0.4 ? C.yellow : val > 0.1 ? C.green : C.border;
                      return (
                        <td key={k} style={{ padding: '3px 4px', textAlign: 'center' }}>
                          <div style={{
                            width: 32, height: 20, background: cell + '18', border: `1px solid ${cell}35`,
                            borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8, color: cell, fontWeight: 700,
                          }}>
                            {(val * 100).toFixed(0)}
                          </div>
                        </td>
                      );
                    })}
                    <td style={{ padding: '3px 4px', textAlign: 'center' }}>
                      <div style={{
                        width: 36, height: 20, background: heatColor(p.score) + '18',
                        border: `1px solid ${heatColor(p.score)}40`, borderRadius: 3,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, color: heatColor(p.score), fontWeight: 700,
                      }}>
                        {(p.vdi * 100).toFixed(0)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
