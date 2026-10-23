import { useState } from 'react';
import Icon from '../components/Icon';
import Input from '../components/Input';
import Button from '../components/Button';
import BackIconButton from '../components/BackIconButton';
import { ChoiceQuestion } from '../components/SurveyFields';

const INTENSITY_OPTIONS = ['Low', 'Moderate', 'High'];

/** Logs an activity the patient did on her own — a walk, gardening,
 * housework, anything outside the prescribed routine — so it still counts
 * toward today's Exercise task. Reached from ExerciseScreen's "Log other
 * activity" button; saving returns to the Exercise list, where the entry
 * shows up under "Logged Activities" (see useAppState.saveCustomExercise). */
export default function LogCustomExerciseScreen({ onSave, onBack }) {
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState(null);

  const canSave = activityType.trim() !== '' && (parseInt(duration, 10) || 0) > 0 && !!intensity;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BackIconButton onClick={onBack} />
          <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>Log Activity</div>
        </div>
        <div style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6 }}>
          Did something active that wasn&apos;t on your plan? Log it here.
        </div>
      </div>

      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Input
          label="What did you do?"
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          placeholder="e.g. Gardening, a walk around the block"
        />
        <Input
          label="How long, in minutes?"
          type="number"
          inputMode="numeric"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 20"
        />
        <div>
          <div style={{ font: '600 1rem/1.2 var(--font-sans)', color: 'var(--ink)' }}>How intense was it?</div>
          <ChoiceQuestion options={INTENSITY_OPTIONS} value={intensity} onChange={setIntensity} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: `0 calc(24px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(24px + var(--safe-left))`,
          flexShrink: 0,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSave}
          onClick={() => onSave(activityType.trim(), parseInt(duration, 10) || 0, intensity)}
          iconLeft={<Icon name="check" size={20} />}
        >
          Save activity
        </Button>
      </div>
    </div>
  );
}
