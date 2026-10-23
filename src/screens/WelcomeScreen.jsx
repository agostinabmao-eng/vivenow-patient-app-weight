import { useState } from 'react';
import Icon from '../components/Icon';
import BackIconButton from '../components/BackIconButton';
import Button from '../components/Button';
import Photo from '../components/Photo';
import { patientName, patientPlan, buildDailyTasks, exercisesForPatient } from '../data/sampleData';

/** The very first screen a patient sees — step 2 of onboarding, after the
 * nurse's intake call (step 1, outside the app) already built her plan.
 * No questions here: just what the care team already decided, in plain
 * words, so she starts the app already knowing why she's using it. Equipment
 * isn't known yet at this point (that's asked next), so the exercise count
 * behind "daily tasks" uses the no-equipment default — every patient has at
 * least a few bodyweight exercises at her level, so the task still shows.
 *
 * Two short steps instead of one long scroll: the goal first, then the
 * daily tasks. */
export default function WelcomeScreen({ onStart }) {
  const [step, setStep] = useState(0);
  const todaysVideos = exercisesForPatient(patientPlan, [], new Date());
  const tasks = buildDailyTasks(patientPlan, todaysVideos.length);

  const footer = (label, onClick) => (
    <div style={{ padding: `12px calc(24px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(24px + var(--safe-left))`, flexShrink: 0 }}>
      <Button variant="primary" size="lg" fullWidth onClick={onClick}>
        {label}
      </Button>
    </div>
  );

  if (step === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div
          className="vh-scroll"
          style={{ flex: 1, overflowY: 'auto', padding: 'calc(20px + var(--safe-top)) 24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
          <Photo name="welcome" alt="A smiling older adult on a video call with their care team" height={200} />
          <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>
            Your care team prepared your plan, {patientName}.
          </div>

          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ font: '600 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>Your main goal</div>
            <div style={{ font: '700 1.35rem/1.35 var(--font-display)', color: 'var(--ink)', marginTop: 6 }}>{patientPlan.mainGoalPlain}</div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="check" size={18} color="var(--teal-600)" style={{ flexShrink: 0 }} />
              <span style={{ font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>
                Weight at or below {patientPlan.weight.goalLbs} lbs by {new Date(`${patientPlan.weight.goalDate}T00:00:00`).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        {footer('Next', () => setStep(1))}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 16px 0' }}>
        <BackIconButton onClick={() => setStep(0)} />
      </div>
      <div
        className="vh-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>Your daily tasks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                padding: '6px 14px',
                minHeight: 56,
              }}
            >
              <span style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--sand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={t.icon} size={18} color="var(--teal-600)" />
              </span>
              <span style={{ font: '700 1.0625rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
      {footer("Let's start", onStart)}
    </div>
  );
}
