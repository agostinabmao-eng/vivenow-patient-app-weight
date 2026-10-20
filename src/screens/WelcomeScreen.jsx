import Icon from '../components/Icon';
import Button from '../components/Button';
import { patientName, patientPlan, buildDailyTasks, exercisesForPatient } from '../data/sampleData';

/** The very first screen a patient sees — step 2 of onboarding, after the
 * nurse's intake call (step 1, outside the app) already built her plan.
 * No questions here: just what the care team already decided, in plain
 * words, so she starts the app already knowing why she's using it. Equipment
 * isn't known yet at this point (that's asked next), so the exercise count
 * behind "daily tasks" uses the no-equipment default — every patient has at
 * least a few bodyweight exercises at her level, so the task still shows. */
export default function WelcomeScreen({ onStart }) {
  const todaysVideos = exercisesForPatient(patientPlan, [], new Date());
  const tasks = buildDailyTasks(patientPlan, todaysVideos.length);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        className="vh-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: 'calc(32px + var(--safe-top)) 24px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}
      >
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="clipboard-list" size={30} color="var(--teal-600)" />
        </div>
        <div style={{ font: '700 1.375rem/1.3 var(--font-display)', color: 'var(--ink)' }}>
          Your care team prepared your plan, {patientName}.
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ font: '600 0.71875rem/1 var(--font-sans)', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>
            Your main goal
          </div>
          <div style={{ font: '700 1.0625rem/1.4 var(--font-display)', color: 'var(--ink)', marginTop: 6 }}>{patientPlan.mainGoalPlain}</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {patientPlan.goals.targets.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="check" size={14} color="var(--teal-600)" style={{ flexShrink: 0 }} />
                <span style={{ font: '600 0.875rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{t.label}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="check" size={14} color="var(--teal-600)" style={{ flexShrink: 0 }} />
              <span style={{ font: '600 0.875rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>
                Weight at or below {patientPlan.weight.goalLbs} lbs by {new Date(`${patientPlan.weight.goalDate}T00:00:00`).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div style={{ font: '600 0.75rem/1 var(--font-display)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
            Your daily tasks
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                }}
              >
                <Icon name={t.icon} size={17} color="var(--teal-600)" style={{ flexShrink: 0 }} />
                <span style={{ font: '600 0.875rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ font: '400 0.8125rem/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
          A few quick questions next will help us personalize your app — nothing about your health, just your
          preferences.
        </div>
      </div>

      <div style={{ padding: `0 calc(24px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(24px + var(--safe-left))`, flexShrink: 0 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onStart}>
          Let&apos;s start
        </Button>
      </div>
    </div>
  );
}
