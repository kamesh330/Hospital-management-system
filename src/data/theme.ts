// CarePulse++ — Classical Professional Design Tokens
export const C = {
  bg:       '#0a0a0a',
  bgDeep:   '#050505',
  panel:    '#121212',
  panelAlt: '#161616',
  border:   '#2a2a2a',
  borderHi: '#3a3a3a',
  accent:   '#e8e8e8',
  accent2:  '#a0a0a0',
  green:    '#4ead6b',
  yellow:   '#d4a843',
  red:      '#c94444',
  purple:   '#8b6cc4',
  teal:     '#4a9e92',
  text:     '#e0e0e0',
  muted:    '#666666',
  mutedHi:  '#888888',
};

export const mono = "'Courier New','Lucida Console',monospace";
export const serif = "'Playfair Display',Georgia,serif";
export const sans = "'Source Sans 3',system-ui,sans-serif";

export const severityColor = (s: string) =>
  s === 'Critical' ? C.red : s === 'Moderate' ? C.yellow : C.green;

export const stressColor = (v: number) =>
  v > 0.85 ? C.red : v >= 0.60 ? C.yellow : C.green;

export const heatColor = (score: number) => {
  if (score >= 85) return C.red;
  if (score >= 70) return '#c95030';
  if (score >= 55) return '#d48030';
  if (score >= 40) return C.yellow;
  if (score >= 25) return C.green;
  return C.teal;
};

export const panelStyle: React.CSSProperties = {
  background: C.panel,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: 18,
  marginBottom: 14,
};
