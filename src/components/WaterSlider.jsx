import DragSlider from './DragSlider';
import { patientPlan, OUNCES_PER_GLASS } from '../data/sampleData';

/** Water is tracked in glasses internally either way — "ounces" mode just
 * displays each whole-glass step as its 8oz equivalent, so the drag target
 * stays a clean one-glass increment no matter which unit is showing. */
export function formatWater(glasses, unit) {
  return unit === 'ounces' ? `${glasses * OUNCES_PER_GLASS} oz` : `${glasses} glass${glasses === 1 ? '' : 'es'}`;
}

export default function WaterSlider({ waterGlasses, waterUnit, onChange, goalGlasses = patientPlan.waterGoalGlasses }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ font: '700 1.25rem/1 var(--font-display)', color: 'var(--ink)' }}>{formatWater(waterGlasses, waterUnit)}</span>
        <span style={{ font: '600 0.8125rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>Goal: {formatWater(goalGlasses, waterUnit)}</span>
      </div>
      <DragSlider value={waterGlasses} max={goalGlasses} step={1} onChange={onChange} fillColor="var(--teal-500)" trackColor="var(--teal-50)" />
    </div>
  );
}
