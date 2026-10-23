import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import BackIconButton from '../components/BackIconButton';
import Button from '../components/Button';
import Photo from '../components/Photo';
import { formatNumericDate } from '../utils/dates';
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
          style={{ flex: 1, overflowY: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}
        >
          <Photo name="welcome" alt="A smiling older woman using the ViveNow app on her phone" height={280} radius="0 0 120px 120px" position="35% 30%" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>Welcome {patientName}!</div>
            <div style={{ font: '700 1.55rem/1.4 var(--font-display)', color: 'var(--ink)', marginTop: 14 }}>Your care team prepared your plan</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '600 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>Your main goal</div>
              <div style={{ font: '700 1.35rem/1.35 var(--font-display)', color: 'var(--ink)', marginTop: 6 }}>{patientPlan.mainGoalPlain}</div>
              <div style={{ font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)', marginTop: 14 }}>
                Weight {patientPlan.weight.goalLbs} lbs or less by {formatNumericDate(patientPlan.weight.goalDate)}
              </div>
            </div>
            <span style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" size={20} color="var(--teal-600)" />
            </span>
          </div>
        </div>
        {footer('Next', () => setStep(1))}
      </div>
    );
  }

  return <DailyTasksStep tasks={tasks} onBack={() => setStep(0)} footer={footer} onStart={onStart} />;
}

/** The task list ticks itself off one row at a time — a short, gentle
 * preview of what a finished day feels like. */
function DailyTasksStep({ tasks, onBack, footer, onStart }) {
  const shown = tasks;
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    if (checked >= shown.length) return undefined;
    const id = setTimeout(() => setChecked((c) => c + 1), checked === 0 ? 700 : 650);
    return () => clearTimeout(id);
  }, [checked, shown.length]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 16px 0' }}>
        <BackIconButton onClick={onBack} />
      </div>
      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>Your daily tasks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shown.map((t, i) => {
            const done = i < checked;
            return (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: done ? 'var(--success-subtle)' : 'var(--surface-card)',
                  border: `1px solid ${done ? '#bfe6cf' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '10px 16px 10px 14px',
                  minHeight: 68,
                  transition: 'background var(--dur-med) var(--ease-standard), border-color var(--dur-med) var(--ease-standard)',
                }}
              >
                <span style={{ width: 46, height: 46, borderRadius: '50%', background: done ? '#fff' : 'var(--sand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={t.icon} size={19} color="var(--teal-600)" />
                </span>
                <span style={{ flex: 1, minWidth: 0, font: '700 1.0625rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{t.label}</span>
                <span
                  aria-label={done ? 'Done' : undefined}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    background: done ? 'var(--success)' : 'transparent',
                    border: done ? '2px solid var(--success)' : '2px solid var(--border-strong)',
                    transform: done ? 'scale(1)' : 'scale(0.9)',
                    transition: 'background var(--dur-med) var(--ease-standard), border-color var(--dur-med) var(--ease-standard), transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <Icon name="check" size={16} color="#fff" strokeWidth={3.2} style={{ opacity: done ? 1 : 0, transition: 'opacity var(--dur-med)' }} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {footer("Let's start", onStart)}
    </div>
  );
}
