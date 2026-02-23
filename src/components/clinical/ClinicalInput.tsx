import { C, mono } from '../../data/theme';

interface NInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

const ClinicalInput = ({ label, value, onChange, step = 1, min, max }: NInputProps) => (
  <div style={{ marginBottom: 8 }}>
    <label style={{ display: 'block', fontSize: 9, color: C.muted, marginBottom: 3, letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: mono }}>
      {label}
    </label>
    <input
      type="number" value={value} step={step} min={min} max={max}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        width: '100%', background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: 4,
        color: C.text, padding: '6px 8px', fontSize: 12, fontFamily: mono,
        boxSizing: 'border-box' as const, outline: 'none',
      }}
    />
  </div>
);

export default ClinicalInput;
