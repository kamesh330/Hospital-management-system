import { C, mono } from '../../data/theme';

interface BarProps {
  label: string;
  value: number;
  color: string;
  max?: number;
}

const ClinicalBar = ({ label, value, color, max = 1 }: BarProps) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color, fontFamily: mono, fontWeight: 600 }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 4, background: C.bgDeep, borderRadius: 2 }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color, borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
};

export default ClinicalBar;
