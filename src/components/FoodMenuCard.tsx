import { DIET_FOOD_MAP, DIET_ICONS, DIET_COLORS } from '../data/dietMenu';
import { C, mono } from '../data/theme';

const FoodMenuCard = ({ diet }: { diet: string }) => {
  const foods = DIET_FOOD_MAP[diet] || [];
  const icon = DIET_ICONS[diet] || '🍽';
  const dColor = DIET_COLORS[diet] || C.accent;

  return (
    <div style={{ background: C.bgDeep, border: `1px solid ${dColor}25`, borderRadius: 6, padding: '12px 14px', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 9, color: C.muted, fontFamily: mono, letterSpacing: 1.2 }}>PRESCRIBED FOOD MENU</div>
          <div style={{ fontSize: 11, color: dColor, fontWeight: 600 }}>{diet}</div>
        </div>
        <span style={{
          marginLeft: 'auto', fontSize: 9, color: C.muted, fontFamily: mono,
          background: dColor + '10', border: `1px solid ${dColor}20`, borderRadius: 10, padding: '2px 8px',
        }}>6 ITEMS</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
        {foods.map((food, i) => (
          <div key={i} style={{
            background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4,
            padding: '6px 10px', fontSize: 10, color: C.text, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: dColor, flexShrink: 0 }} />
            {food}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodMenuCard;
