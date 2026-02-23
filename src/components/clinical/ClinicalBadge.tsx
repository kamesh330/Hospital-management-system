import { C, mono } from '../../data/theme';

interface BadgeProps {
  label: string;
  color: string;
  small?: boolean;
}

const ClinicalBadge = ({ label, color, small }: BadgeProps) => (
  <span style={{
    background: color + '15',
    color,
    border: `1px solid ${color}40`,
    borderRadius: 3,
    padding: small ? '1px 5px' : '2px 9px',
    fontSize: small ? 9 : 10,
    fontWeight: 600,
    letterSpacing: 0.8,
    fontFamily: mono,
    whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

export default ClinicalBadge;
