// CarePulse++ — Clinical Command Center Design Tokens
// Aesthetic: Dark ops-room medical terminal. Sharp cyan readouts on near-black.
export const C = {
  bg:       '#04070e',
  bgDeep:   '#020408',
  panel:    '#07101f',
  panelAlt: '#091222',
  border:   '#132030',
  borderHi: '#1c3050',
  accent:   '#00d4ff',
  accent2:  '#ff5722',
  green:    '#00e676',
  yellow:   '#ffc400',
  red:      '#ff1744',
  purple:   '#d500f9',  // surge mode colour
  teal:     '#00bfa5',  // oxygen crisis
  text:     '#cde4f8',
  muted:    '#3a5a7a',
  mutedHi:  '#5a80a8',
};

export const mono = "'Courier New','Lucida Console',monospace";
export const serif = "'Georgia','Times New Roman',serif";

export const severityColor = (s) =>
  s === 'Critical' ? C.red : s === 'Moderate' ? C.yellow : C.green;

export const stressColor = (v) =>
  v > 0.85 ? C.red : v >= 0.60 ? C.yellow : C.green;

// Heatmap colour — maps score 0→100 to blue→yellow→red
export const heatColor = (score) => {
  if (score >= 85) return '#ff1744';
  if (score >= 70) return '#ff5722';
  if (score >= 55) return '#ff9100';
  if (score >= 40) return '#ffc400';
  if (score >= 25) return '#69f0ae';
  return '#00bcd4';
};

export const panelStyle = {
  background: '#07101f',
  border: '1px solid #132030',
  borderRadius: 8,
  padding: 18,
  marginBottom: 14,
};
