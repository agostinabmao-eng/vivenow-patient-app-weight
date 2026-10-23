import TaskScreenShell from '../components/TaskScreenShell';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { todaySample } from '../data/sampleData';
import { formatWeight } from '../utils/units';

/** Weight is never typed in — it comes from the connected smart scale. This
 * screen just tells the patient how to weigh in and lets them pull the
 * latest reading from the scale ("Sync" stands in for the device sync a
 * real build would do in the background). */
export default function TaskWeight({ weightUnit, onSave, onBack }) {
  return (
    <TaskScreenShell
      icon="scale"
      photo="weight"
      title="Measure Weight"
      description="Step on your smart scale. Your weight is sent to the app automatically."
      onBack={onBack}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={() => onSave(todaySample.weight)} iconLeft={<Icon name="check" size={20} />}>
          Sync from my scale
        </Button>
      }
    >
      <div style={{ width: '100%', marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 18, textAlign: 'left' }}>
        <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="scale" size={22} color="var(--teal-600)" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '700 1.0625rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>Smart Scale</div>
          <div style={{ font: '500 1rem/1.3 var(--font-sans)', color: 'var(--success)' }}>Connected</div>
        </div>
        <div style={{ font: '700 1.35rem/1.2 var(--font-display)', color: 'var(--ink)' }}>{formatWeight(todaySample.weight, weightUnit)}</div>
      </div>
    </TaskScreenShell>
  );
}
