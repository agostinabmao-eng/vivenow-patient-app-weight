import Icon from './Icon';
import { formatWeight, weightFromLbs } from '../utils/units';
import { formatNumericDate } from '../utils/dates';

function formatGoalDate(iso) {
  return formatNumericDate(iso);
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
    <div style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-200)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ font: '600 1rem/1 var(--font-sans)', color: 'var(--teal-800)' }}>
          {eyebrow}
        </div>
        {corner}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
        <span style={{ font: '700 3rem/1 var(--font-display)', color: 'var(--teal-700)' }}>{value.toLocaleString()}</span>
        <span style={{ font: '600 1rem/1 var(--font-sans)', color: 'var(--teal-800)' }}>
          {hasGoal ? `/ ${goal.toLocaleString()} ${unit}` : unit}
        </span>
      </div>
      {hasGoal && (
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ marginTop: 18, height: 14, borderRadius: 'var(--radius-pill)', background: '#fff', overflow: 'hidden' }}
        >
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 'var(--radius-pill)', background: 'var(--teal-600)', transition: 'width var(--dur-med) var(--ease-standard)' }} />
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
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} size={18} color="var(--teal-600)" />
        <div style={{ font: '600 1rem/1.2 var(--font-sans)', color: 'var(--ink)' }}>{label}</div>
        <div style={{ marginLeft: 'auto', font: '600 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>
          {value.toLocaleString()} / {goal.toLocaleString()} {unit}
        </div>
      </div>
      <div style={{ marginTop: 8, height: 10, borderRadius: 'var(--radius-pill)', background: 'var(--ice-100)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--teal-600)', transition: 'width var(--dur-med) var(--ease-standard)' }} />
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
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="scale" size={17} color="var(--teal-600)" />
        <div style={{ font: '700 1rem/1.2 var(--font-display)', color: 'var(--ink)' }}>Weight Goal</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <div>
          <div style={{ font: '600 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>Baseline</div>
          <div style={{ font: '700 1.35rem/1.3 var(--font-display)', color: 'var(--ink)', marginTop: 4 }}>{formatWeight(baselineLbs, weightUnit)}</div>
          <div style={{ font: '400 1rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>{formatGoalDate(baselineDate)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ font: '600 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>Goal</div>
          <div style={{ font: '700 1.35rem/1.3 var(--font-display)', color: 'var(--ink)', marginTop: 4 }}>{formatWeight(goalLbs, weightUnit)}</div>
          <div style={{ font: '400 1rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>by {formatGoalDate(goalDate)}</div>
        </div>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress toward weight goal"
        style={{ marginTop: 18, height: 16, borderRadius: 'var(--radius-pill)', background: 'var(--ice-100)', overflow: 'hidden' }}
      >
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 'var(--radius-pill)', background: 'var(--teal-600)', transition: 'width var(--dur-med) var(--ease-standard)' }} />
      </div>
      <div style={{ marginTop: 8, font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>
        {lostSoFar} of {totalToLose} {weightUnit} of your goal ({pct}%)
      </div>
    </div>
  );
}

/** Goals are behaviors, not numbers — this card states the clinical
 * target first (weight), as a single plain-language
 * line with its number, and only then lists the behavior goals underneath,
 * which never repeat a target's number (see patientPlan.goals). */
export function GoalsCard({ goals, weightGoal, weightUnit }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="clipboard-list" size={17} color="var(--teal-600)" />
        <div style={{ font: '700 1rem/1.2 var(--font-display)', color: 'var(--ink)' }}>Your Goals</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {goals.behaviors.map((b) => (
          <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal-400)', flexShrink: 0 }} />
            <span style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-body)' }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact weight-goal summary for Home — just the percentage and a thin
 * bar, so the goal stays visible day-to-day without repeating the full
 * Progress-tab card's baseline/date detail. */
function encouragement(pct) {
  if (pct >= 100) return 'Goal reached — congratulations!';
  if (pct >= 75) return 'Almost there!';
  if (pct >= 25) return 'Well done! Keep it going!';
  return "You've started — every step counts!";
}

export function WeightGoalMiniCard({ weightGoal, currentLbs }) {
  const { pct } = weightGoalProgress(weightGoal, currentLbs);
  return (
    <div
      style={{
        background: 'var(--teal-50)',
        border: '1px solid var(--teal-200)',
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <Icon name="scale" size={22} color="var(--teal-600)" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>Weight goal: {pct}% there</div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress toward weight goal"
          style={{ marginTop: 8, height: 12, borderRadius: 'var(--radius-pill)', background: '#fff', overflow: 'hidden' }}
        >
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 'var(--radius-pill)', background: 'var(--teal-600)' }} />
        </div>
        <div style={{ marginTop: 10, font: '500 1rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>{encouragement(pct)}</div>
      </div>
    </div>
  );
}
