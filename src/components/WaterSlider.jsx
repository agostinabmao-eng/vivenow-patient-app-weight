import DragSlider from './DragSlider';
import Icon from './Icon';
import { patientPlan, OUNCES_PER_GLASS } from '../data/sampleData';

/** Water is tracked in glasses internally either way — "ounces" mode just
 * displays each whole-glass step as its 8oz equivalent, so the drag target
 * stays a clean one-glass increment no matter which unit is showing. */
export function formatWater(glasses, unit) {
  return unit === 'ounces' ? `${glasses * OUNCES_PER_GLASS} oz` : `${glasses} glass${glasses === 1 ? '' : 'es'}`;
}

function RoundButton({ icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 80,
        height: 80,
        flexShrink: 0,
        borderRadius: '50%',
        border: 'none',
        background: disabled ? 'var(--ice-100)' : 'var(--teal-600)',
        color: disabled ? 'var(--gray-500)' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : 'var(--shadow-brand)',
      }}
    >
      <Icon name={icon} size={30} strokeWidth={3} />
    </button>
  );
}

export default function WaterSlider({ waterGlasses, waterUnit, onChange, goalGlasses = patientPlan.waterGoalGlasses }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <RoundButton icon="minus" label="One less glass" disabled={waterGlasses <= 0} onClick={() => onChange(Math.max(0, waterGlasses - 1))} />
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          <div style={{ font: '700 2.2rem/1.1 var(--font-display)', color: 'var(--ink)' }}>{formatWater(waterGlasses, waterUnit)}</div>
          <div style={{ font: '600 1.0625rem/1.2 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6 }}>Goal: {formatWater(goalGlasses, waterUnit)}</div>
        </div>
        <RoundButton icon="plus" label="One more glass" disabled={waterGlasses >= goalGlasses} onClick={() => onChange(Math.min(goalGlasses, waterGlasses + 1))} />
      </div>
      <div style={{ marginTop: 22 }}>
        <DragSlider value={waterGlasses} max={goalGlasses} step={1} onChange={onChange} fillColor="var(--teal-500)" trackColor="var(--ice-100)" />
      </div>
    </div>
  );
}
