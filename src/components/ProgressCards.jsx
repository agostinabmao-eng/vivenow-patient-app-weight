import Icon from './Icon';
import { formatWeight, weightFromLbs } from '../utils/units';

function formatGoalDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

/** The high-hierarchy "hero" progress card — solid teal, big number, thick
 * bar. One per screen at most: it's meant to read as *the* thing this
 * screen is tracking (Today's Diary on Nutrition, today's exercises here).
 * `goal` may be null/undefined (no goal assigned) — in that case the card
 * shows only the logged value and unit, with no "/ goal" and no bar, rather
 * than implying a target that doesn't exist. */
export function HeroProgressCard({ eyebrow, value, goal, unit, corner }) {
  const hasGoal = goal != null;
  const pct = hasGoal && goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div style={{ background: 'var(--teal-500)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ font: '600 0.78125rem/1 var(--font-sans)', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {eyebrow}
        </div>
        {corner}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
        <span style={{ font: '700 2.25rem/1 var(--font-display)', color: '#fff' }}>{value.toLocaleString()}</span>
        <span style={{ font: '600 0.9375rem/1 var(--font-sans)', color: 'rgba(255,255,255,0.85)' }}>
          {hasGoal ? `/ ${goal.toLocaleString()} ${unit}` : unit}
        </span>
      </div>
      {hasGoal && (
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ marginTop: 14, height: 6, borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.28)', overflow: 'hidden' }}
        >
          <div style={{ width: `${pct}%`, height: '100%', background: '#fff', transition: 'width var(--dur-med) var(--ease-standard)' }} />
        </div>
      )}
    </div>
  );
}

/** A lower-hierarchy companion card — same idea (progress toward a daily
 * goal), much less visual weight: white card, thin bar, everything on one
 * compact row. For a secondary metric that's worth a glance on this screen
 * without competing with the hero above it. */
export function SecondaryProgressCard({ icon, label, value, goal, unit }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={15} color="var(--teal-600)" />
        <div style={{ font: '600 0.8125rem/1.2 var(--font-sans)', color: 'var(--ink)' }}>{label}</div>
        <div style={{ marginLeft: 'auto', font: '600 0.75rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>
          {value.toLocaleString()} / {goal.toLocaleString()} {unit}
        </div>
      </div>
      <div style={{ marginTop: 8, height: 4, borderRadius: 'var(--radius-pill)', background: 'var(--teal-50)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--teal-500)', transition: 'width var(--dur-med) var(--ease-standard)' }} />
      </div>
    </div>
  );
}

/** Shared math for the weight-goal cards below — how much of the planned
 * loss (baseline → goal) has actually happened so far, clamped to
 * [0, totalToLose] so an early reading above baseline or one already past
 * goal doesn't show a negative or over-100% progress bar. */
function weightGoalProgress({ baselineLbs, goalLbs }, currentLbs) {
  const totalToLoseLbs = Math.max(0, baselineLbs - goalLbs);
  const lostSoFarLbs = Math.max(0, Math.min(totalToLoseLbs, baselineLbs - currentLbs));
  const pct = totalToLoseLbs > 0 ? Math.round((lostSoFarLbs / totalToLoseLbs) * 100) : 0;
  return { totalToLoseLbs, lostSoFarLbs, pct };
}

/** The Progress tab's full weight-goal card — baseline, target weight and
 * date, and how much of the planned loss has happened so far, all in the
 * patient's preferred unit. Pairs with TrendChart's `refLines` (baseline +
 * goal dashed lines) on the Weight chart, so the same two numbers anchor
 * both views. */
export function WeightGoalCard({ weightGoal, currentLbs, weightUnit }) {
  const { baselineLbs, baselineDate, goalLbs, goalDate } = weightGoal;
  const { totalToLoseLbs, lostSoFarLbs, pct } = weightGoalProgress(weightGoal, currentLbs);
  const totalToLose = Math.round(weightFromLbs(totalToLoseLbs, weightUnit) * 10) / 10;
  const lostSoFar = Math.round(weightFromLbs(lostSoFarLbs, weightUnit) * 10) / 10;

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="scale" size={17} color="var(--teal-600)" />
        <div style={{ font: '700 0.9375rem/1.2 var(--font-display)', color: 'var(--ink)' }}>Weight Goal</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <div>
          <div style={{ font: '600 0.71875rem/1 var(--font-sans)', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>Baseline</div>
          <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)', marginTop: 4 }}>{formatWeight(baselineLbs, weightUnit)}</div>
          <div style={{ font: '400 0.75rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>{formatGoalDate(baselineDate)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ font: '600 0.71875rem/1 var(--font-sans)', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>Goal</div>
          <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)', marginTop: 4 }}>{formatWeight(goalLbs, weightUnit)}</div>
          <div style={{ font: '400 0.75rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>by {formatGoalDate(goalDate)}</div>
        </div>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress toward weight goal"
        style={{ marginTop: 16, height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--teal-50)', overflow: 'hidden' }}
      >
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--teal-500)', transition: 'width var(--dur-med) var(--ease-standard)' }} />
      </div>
      <div style={{ marginTop: 8, font: '600 0.8125rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>
        {lostSoFar} of {totalToLose} {weightUnit} toward your goal ({pct}%)
      </div>
    </div>
  );
}

/** Goals are behaviors, not numbers — this card states the clinical
 * target(s) first (blood pressure, weight), each as a single plain-language
 * line with its number, and only then lists the behavior goals underneath,
 * which never repeat a target's number (see patientPlan.goals). */
export function GoalsCard({ goals, weightGoal, weightUnit }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="clipboard-list" size={17} color="var(--teal-600)" />
        <div style={{ font: '700 0.9375rem/1.2 var(--font-display)', color: 'var(--ink)' }}>Your Goals</div>
      </div>

      <div style={{ font: '600 0.71875rem/1 var(--font-sans)', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginTop: 16 }}>
        Targets
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {goals.targets.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="check" size={14} color="var(--teal-600)" style={{ flexShrink: 0 }} />
            <span style={{ font: '600 0.875rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{t.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="check" size={14} color="var(--teal-600)" style={{ flexShrink: 0 }} />
          <span style={{ font: '600 0.875rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>
            Weight at or below {formatWeight(weightGoal.goalLbs, weightUnit)} by {formatGoalDate(weightGoal.goalDate)}
          </span>
        </div>
      </div>

      <div style={{ font: '600 0.71875rem/1 var(--font-sans)', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginTop: 18 }}>
        Goals
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {goals.behaviors.map((b) => (
          <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--teal-400)', marginTop: 7, flexShrink: 0 }} />
            <span style={{ font: '400 0.84375rem/1.4 var(--font-sans)', color: 'var(--text-body)' }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact weight-goal summary for Home — just the percentage and a thin
 * bar, so the goal stays visible day-to-day without repeating the full
 * Progress-tab card's baseline/date detail. */
export function WeightGoalMiniCard({ weightGoal, currentLbs }) {
  const { pct } = weightGoalProgress(weightGoal, currentLbs);
  return (
    <div
      style={{
        background: 'var(--teal-50)',
        border: '1px solid var(--teal-200)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Icon name="scale" size={17} color="var(--teal-600)" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 0.8125rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>Weight goal: {pct}% there</div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress toward weight goal"
          style={{ marginTop: 5, height: 4, borderRadius: 'var(--radius-pill)', background: 'var(--teal-100)', overflow: 'hidden' }}
        >
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--teal-500)' }} />
        </div>
      </div>
    </div>
  );
}
