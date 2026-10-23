import { useEffect, useState } from 'react';
import TaskScreenShell from '../components/TaskScreenShell';
import Icon from '../components/Icon';
import { patientPlan, todaySample, SCALE_MODELS } from '../data/sampleData';
import { formatWeight } from '../utils/units';

/** Weight is never typed in — it arrives from the connected scale. The
 * patient steps on it and the task completes by itself. In this preview the
 * reading "arrives" a few seconds after opening the screen; a real build
 * would receive it over Bluetooth, even with the app closed. */
export default function TaskWeight({ weightUnit, onSave, onBack }) {
  const model = SCALE_MODELS[patientPlan.scaleModel] || SCALE_MODELS.smart;
  const [reading, setReading] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setReading(todaySample.weight), 4000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (reading == null) return undefined;
    const id = setTimeout(() => onSave(reading), 2200);
    return () => clearTimeout(id);
  }, [reading, onSave]);

  return (
    <TaskScreenShell
      icon="scale"
      photo="weight"
      title="Measure Weight"
      description={reading == null ? `Step on your ${model.label} and stay still. Your weight is saved automatically.` : 'Got it — your weight is saved.'}
      onBack={onBack}
    >
      <div style={{ width: '100%', marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {reading == null ? (
          <>
            <span style={{ position: 'relative', width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="vh-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--teal-200)', animation: 'vh-ring 1.6s ease-out infinite' }} />
              <span style={{ position: 'relative', width: 84, height: 84, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="scale" size={32} color="var(--teal-600)" />
              </span>
            </span>
            <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Waiting for your scale…</div>
            <div style={{ font: '500 1rem/1.3 var(--font-sans)', color: 'var(--success)' }}>{model.label} · Connected</div>
          </>
        ) : (
          <>
            <span style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={36} color="#fff" strokeWidth={3.2} />
            </span>
            <div style={{ font: '700 2.6rem/1.1 var(--font-display)', color: 'var(--ink)' }}>{formatWeight(reading, weightUnit)}</div>
          </>
        )}
      </div>
    </TaskScreenShell>
  );
}
