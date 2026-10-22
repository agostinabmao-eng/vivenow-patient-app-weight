import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import Button from '../components/Button';
import PeriodDropdown from '../components/PeriodDropdown';
import TrendChart from '../components/TrendChart';
import { formatWeight, weightFromLbs } from '../utils/units';
import { formatWater } from '../components/WaterSlider';
import { buildProgressReportPdf } from '../utils/progressReportPdf';
import { WeightGoalCard, GoalsCard } from '../components/ProgressCards';
import {
  weeklySample,
  sampleRange,
  weekDayLabels,
  todaySample,
  patientName,
  patientPlan,
  VIDEOS_PER_DAY,
  TASKS_PER_DAY,
  STEPS_GOAL,
  TODAY_STEPS,
  MEAL_TYPES,
} from '../data/sampleData';

function mean(values) {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function daysBetween(startStr, endStr) {
  const diff = Math.round((new Date(`${endStr}T00:00:00`) - new Date(`${startStr}T00:00:00`)) / 86400000) + 1;
  return Math.max(1, diff);
}

function dateLabels(count) {
  const labels = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString([], { month: 'short', day: 'numeric' }));
  }
  return labels;
}

function FlameRow({ days, labels }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {days.map((d, i) => {
        const earned = d.doneCount >= 4;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Icon name="flame" size={20} color={earned ? 'var(--gold-500)' : 'var(--gray-300)'} fill={earned ? 'var(--gold-500)' : 'none'} />
            <span style={{ font: '500 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

function pctChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

// The change vs. the previous equivalent period, as a percentage — direction-
// colored only when the metric has a clear "better direction" (down for
// vitals someone's managing toward a lower number, up for adherence-style
// counts); neutral gray when more/less isn't inherently good or bad
// (Nutrition).
function DeltaLabel({ pct, goodDirection, previousLabel }) {
  if (pct === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="minus" size={12} color="var(--text-muted)" />
        <span style={{ font: '600 1rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>No change vs {previousLabel}</span>
      </div>
    );
  }
  const increased = pct > 0;
  const good = goodDirection == null ? null : goodDirection === 'up' ? increased : !increased;
  const color = good == null ? 'var(--text-muted)' : good ? 'var(--success)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Icon name={increased ? 'arrow-up' : 'arrow-down'} size={12} color={color} />
      <span style={{ font: '600 1rem/1.3 var(--font-sans)', color }}>
        {increased ? '+' : ''}
        {pct}% vs {previousLabel}
      </span>
    </div>
  );
}

function SummaryCard({ icon, label, value, active, onClick, children }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? active : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      style={{
        flex: '1 1 calc(50% - 5px)',
        background: 'var(--surface-card)',
        border: `1.5px solid ${active ? 'var(--teal-500)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 14,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={15} color="var(--teal-600)" />
        </div>
        <div style={{ font: '600 1rem/1.2 var(--font-sans)', color: 'var(--text-muted)' }}>{label}</div>
      </div>
      <div style={{ marginTop: 8, font: '700 1.0625rem/1.2 var(--font-display)', color: 'var(--ink)' }}>{value}</div>
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
}

/** The larger, detailed view of one metric — appears above the Cards grid
 * when a SummaryCard is tapped, since a 2-up grid tile has no room for a
 * chart or today's reading alongside the period average.
 *
 * The headline number defaults to the period average (labeled "Average" so
 * it never reads as today's single reading) and swaps to whichever day is
 * being touched/dragged on the chart below, reverting the instant the
 * patient lets go — `metric.chart` is a render-prop taking the `setScrub`
 * callback so each metric can format its own scrub value (BP's two
 * numbers, weight's unit, etc.) without TrendChart needing to know that. */
function ExpandedMetricCard({ metric, previousLabel, onClose }) {
  const [scrub, setScrub] = useState(null);
  return (
    <div style={{ background: 'var(--surface-card)', border: '1.5px solid var(--teal-500)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={metric.icon} size={17} color="var(--teal-600)" />
        </div>
        <div style={{ flex: 1, font: '600 1rem/1.2 var(--font-sans)', color: 'var(--text-muted)' }}>{metric.label}</div>
        <button
          onClick={onClose}
          aria-label="Collapse"
          style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <Icon name="x" size={16} color="var(--text-muted)" />
        </button>
      </div>
      <div style={{ marginTop: 10, font: '600 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>
        {scrub ? scrub.label : 'Average'}
      </div>
      <div style={{ marginTop: 3, font: '700 2rem/1.2 var(--font-display)', color: 'var(--ink)' }}>{scrub ? scrub.value : metric.value}</div>
      {!scrub && (
        <>
          <div style={{ marginTop: 4 }}>
            <DeltaLabel pct={metric.pct} goodDirection={metric.goodDirection} previousLabel={previousLabel} />
          </div>
          <div style={{ marginTop: 4, font: '500 1rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>Today: {metric.today}</div>
        </>
      )}
      <div style={{ marginTop: 14 }}>{metric.chart(setScrub)}</div>
    </div>
  );
}

/** Progress tab — how the patient is doing over time, as opposed to Home's
 * "what's left today." Adherence (streak + a 7-day flame row), period
 * summaries that lead with the selected period's average (not today's
 * single reading) and how that average moved against the equivalent prior
 * period, and a shareable report. Tapping a card expands it in place with
 * its trend chart — there's no separate all-charts view, since that just
 * duplicated the same five charts already reachable one tap away. */
export default function ProgressScreen({ day, streak, doneCount, weightUnit, waterUnit }) {
  const [shareStatus, setShareStatus] = useState(null);
  const [period, setPeriod] = useState('week');
  const [customRange, setCustomRange] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const labels = useMemo(() => weekDayLabels(), []);

  const today = useMemo(
    () => ({
      bp: day.vitals.bp || todaySample.bp,
      glucose: todaySample.glucose,
      weight: todaySample.weight,
      water: day.waterGlasses,
      steps: day.vitals.steps ?? TODAY_STEPS,
      doneCount,
      videosCompleted: day.videos.filter((v) => v.checked).length,
      mealCalories: MEAL_TYPES.reduce((sum, t) => sum + day.meals[t].reduce((s, e) => s + e.calories, 0), 0),
    }),
    [day, doneCount],
  );

  // The streak row is always a literal 7-day view, independent of the
  // period picker below (which only scopes the summary cards/charts).
  const weekDays = useMemo(() => [...weeklySample, today], [today]);
  const totalTasksDone = weekDays.reduce((s, d) => s + d.doneCount, 0);

  const periodLength =
    period === 'week' ? 7 : period === 'month' ? 30 : customRange?.start && customRange?.end ? daysBetween(customRange.start, customRange.end) : 7;

  // periodDays: the selected window, ending today. previousPeriodDays: the
  // same number of days immediately before that — what "vs last week" /
  // "vs last month" actually compares against.
  const periodDays = useMemo(() => [...sampleRange(periodLength - 1, 1), today], [periodLength, today]);
  const previousPeriodDays = useMemo(() => sampleRange(2 * periodLength - 1, periodLength), [periodLength]);

  const previousLabel = period === 'week' ? 'last week' : period === 'month' ? 'last month' : 'the prior period';
  const todayEntry = today;

  const avgSys = Math.round(mean(periodDays.map((d) => d.bp.sys)));
  const avgDia = Math.round(mean(periodDays.map((d) => d.bp.dia)));
  const avgSysPrev = Math.round(mean(previousPeriodDays.map((d) => d.bp.sys)));
  // Systolic carries the headline % change for Blood Pressure — sys and dia
  // don't always move by the same proportion, and one clear number reads
  // better than two percentages fighting for the same line.
  const pctSys = pctChange(avgSys, avgSysPrev);

  const avgGlucose = Math.round(mean(periodDays.map((d) => d.glucose)));
  const avgGlucosePrev = Math.round(mean(previousPeriodDays.map((d) => d.glucose)));
  const pctGlucose = pctChange(avgGlucose, avgGlucosePrev);

  const avgWeight = Math.round(mean(periodDays.map((d) => d.weight)) * 10) / 10;
  const avgWeightPrev = Math.round(mean(previousPeriodDays.map((d) => d.weight)) * 10) / 10;
  const pctWeight = pctChange(avgWeight, avgWeightPrev);

  const totalVideos = periodDays.reduce((s, d) => s + d.videosCompleted, 0);
  const prescribedVideos = VIDEOS_PER_DAY * periodDays.length;
  const totalVideosPrev = previousPeriodDays.reduce((s, d) => s + d.videosCompleted, 0);
  const pctVideos = pctChange(totalVideos, totalVideosPrev);

  const avgCalories = Math.round(periodDays.reduce((s, d) => s + d.mealCalories, 0) / periodDays.length);
  const avgCaloriesPrev = Math.round(previousPeriodDays.reduce((s, d) => s + d.mealCalories, 0) / previousPeriodDays.length);
  const pctCalories = pctChange(avgCalories, avgCaloriesPrev);

  const avgWater = Math.round(mean(periodDays.map((d) => d.water)) * 10) / 10;
  const avgWaterPrev = Math.round(mean(previousPeriodDays.map((d) => d.water)) * 10) / 10;
  const pctWater = pctChange(avgWater, avgWaterPrev);

  const avgSteps = Math.round(mean(periodDays.map((d) => d.steps)));
  const avgStepsPrev = Math.round(mean(previousPeriodDays.map((d) => d.steps)));
  const pctSteps = pctChange(avgSteps, avgStepsPrev);

  const xLabels = useMemo(() => dateLabels(periodDays.length), [periodDays.length]);

  // One entry per Cards-view tile — the source both the compact grid and
  // the expanded detail panel read from, so tapping a card can't show
  // anything the grid itself didn't already have. Order matches product
  // direction: Weight, Exercise, Calories, Water, Steps, then BP/Glucose
  // last (point-in-time vitals rather than daily habits).
  const METRICS = [
    {
      id: 'weight',
      icon: 'scale',
      label: 'Weight',
      value: formatWeight(avgWeight, weightUnit),
      today: formatWeight(todayEntry.weight, weightUnit),
      pct: pctWeight,
      goodDirection: 'down',
      chart: (setScrub) => (
        <TrendChart
          series={[{ label: 'Weight', color: 'var(--teal-500)', data: periodDays.map((d) => Math.round(weightFromLbs(d.weight, weightUnit) * 10) / 10) }]}
          xLabels={xLabels}
          unit={` ${weightUnit}`}
          refLines={[
            { label: 'Baseline', value: Math.round(weightFromLbs(patientPlan.weight.baselineLbs, weightUnit) * 10) / 10, color: 'var(--gray-500)' },
            { label: 'Goal', value: Math.round(weightFromLbs(patientPlan.weight.goalLbs, weightUnit) * 10) / 10, color: 'var(--gold-500)' },
          ]}
          onScrub={(i) => setScrub(i == null ? null : { label: xLabels[i], value: formatWeight(periodDays[i].weight, weightUnit) })}
        />
      ),
    },
    {
      id: 'exercise',
      icon: 'dumbbell',
      label: 'Exercise',
      value: `${totalVideos} of ${prescribedVideos}`,
      today: `${todayEntry.videosCompleted} of ${VIDEOS_PER_DAY} today`,
      pct: pctVideos,
      goodDirection: 'up',
      chart: (setScrub) => (
        <TrendChart
          series={[{ label: 'Videos', color: 'var(--teal-500)', data: periodDays.map((d) => d.videosCompleted) }]}
          xLabels={xLabels}
          goal={VIDEOS_PER_DAY}
          goalLabel="daily goal"
          onScrub={(i) => setScrub(i == null ? null : { label: xLabels[i], value: `${periodDays[i].videosCompleted} of ${VIDEOS_PER_DAY}` })}
        />
      ),
    },
    {
      id: 'nutrition',
      icon: 'utensils',
      label: 'Calories',
      value: `${avgCalories.toLocaleString()} kcal/day`,
      today: `${todayEntry.mealCalories.toLocaleString()} kcal today`,
      pct: pctCalories,
      goodDirection: null,
      chart: (setScrub) => (
        <TrendChart
          series={[{ label: 'Calories', color: 'var(--teal-500)', data: periodDays.map((d) => d.mealCalories) }]}
          xLabels={xLabels}
          goal={patientPlan.calorieGoal}
          goalLabel="goal"
          onScrub={(i) => setScrub(i == null ? null : { label: xLabels[i], value: `${periodDays[i].mealCalories.toLocaleString()} kcal` })}
        />
      ),
    },
    {
      id: 'water',
      icon: 'droplet',
      label: 'Water',
      value: `${formatWater(avgWater, waterUnit)}/day`,
      today: `${formatWater(todayEntry.water, waterUnit)} today`,
      pct: pctWater,
      goodDirection: 'up',
      chart: (setScrub) => (
        <TrendChart
          series={[{ label: 'Water', color: 'var(--teal-500)', data: periodDays.map((d) => d.water) }]}
          xLabels={xLabels}
          goal={patientPlan.waterGoalGlasses}
          goalLabel="goal"
          onScrub={(i) => setScrub(i == null ? null : { label: xLabels[i], value: formatWater(periodDays[i].water, waterUnit) })}
        />
      ),
    },
    {
      id: 'steps',
      icon: 'footprints',
      label: 'Steps',
      value: `${avgSteps.toLocaleString()}/day`,
      today: `${todayEntry.steps.toLocaleString()} today`,
      pct: pctSteps,
      goodDirection: 'up',
      chart: (setScrub) => (
        <TrendChart
          series={[{ label: 'Steps', color: 'var(--teal-500)', data: periodDays.map((d) => d.steps) }]}
          xLabels={xLabels}
          goal={STEPS_GOAL}
          goalLabel="goal"
          onScrub={(i) => setScrub(i == null ? null : { label: xLabels[i], value: `${periodDays[i].steps.toLocaleString()} steps` })}
        />
      ),
    },
    {
      id: 'bp',
      icon: 'activity',
      label: 'Blood Pressure',
      value: `${avgSys}/${avgDia} mmHg`,
      today: `${todayEntry.bp.sys}/${todayEntry.bp.dia} mmHg`,
      pct: pctSys,
      goodDirection: 'down',
      chart: (setScrub) => (
        <TrendChart
          series={[
            { label: 'Systolic', color: 'var(--teal-500)', data: periodDays.map((d) => d.bp.sys) },
            { label: 'Diastolic', color: 'var(--navy-500)', data: periodDays.map((d) => d.bp.dia) },
          ]}
          xLabels={xLabels}
          onScrub={(i) => setScrub(i == null ? null : { label: xLabels[i], value: `${periodDays[i].bp.sys}/${periodDays[i].bp.dia} mmHg` })}
        />
      ),
    },
    {
      id: 'glucose',
      icon: 'droplets',
      label: 'Glucose',
      value: `${avgGlucose} mg/dL`,
      today: `${todayEntry.glucose} mg/dL`,
      pct: pctGlucose,
      goodDirection: 'down',
      chart: (setScrub) => (
        <TrendChart
          series={[{ label: 'Glucose', color: 'var(--teal-500)', data: periodDays.map((d) => d.glucose) }]}
          xLabels={xLabels}
          onScrub={(i) => setScrub(i == null ? null : { label: xLabels[i], value: `${periodDays[i].glucose} mg/dL` })}
        />
      ),
    },
  ];
  const expandedMetric = METRICS.find((m) => m.id === expandedId) || null;

  async function shareReport() {
    const doc = buildProgressReportPdf({
      patientName,
      streak,
      totalTasksDone,
      taskGoal: TASKS_PER_DAY * weekDays.length,
      periodLabel: previousLabel === 'last month' ? 'this month' : previousLabel === 'the prior period' ? 'this period' : 'this week',
      metrics: METRICS.map((m) => ({ label: m.label, value: m.value, today: m.today, pct: m.pct })),
      previousLabel,
    });
    const blob = doc.output('blob');
    const fileName = 'ViveNow-Progress-Report.pdf';

    if (navigator.canShare && navigator.share) {
      const file = new File([blob], fileName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: 'ViveNow Progress Report', files: [file] });
          return;
        } catch {
          // patient cancelled the share sheet — nothing to do
          return;
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setShareStatus('downloaded');
    setTimeout(() => setShareStatus(null), 2200);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(20px + var(--safe-top)) 20px 0' }}>
        <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>Progress</div>
      </div>

      <div
        className="vh-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `16px calc(20px + var(--safe-right)) 88px calc(20px + var(--safe-left))`,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16 }}>
          <FlameRow days={weekDays} labels={labels} />
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="flame" size={16} color="var(--gold-500)" />
            <span style={{ font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{streak}-day streak</span>
          </div>
        </div>

        <WeightGoalCard weightGoal={patientPlan.weight} currentLbs={todayEntry.weight} weightUnit={weightUnit} />
        <GoalsCard goals={patientPlan.goals} weightGoal={patientPlan.weight} weightUnit={weightUnit} />

        <PeriodDropdown period={period} customRange={customRange} onChange={(p, r) => { setPeriod(p); setCustomRange(r); }} />

        {expandedMetric && <ExpandedMetricCard metric={expandedMetric} previousLabel={previousLabel} onClose={() => setExpandedId(null)} />}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {METRICS.map((m) => (
            <SummaryCard
              key={m.id}
              icon={m.icon}
              label={m.label}
              value={m.value}
              active={expandedId === m.id}
              onClick={() => setExpandedId((cur) => (cur === m.id ? null : m.id))}
            >
              <DeltaLabel pct={m.pct} goodDirection={m.goodDirection} previousLabel={previousLabel} />
            </SummaryCard>
          ))}
        </div>

        <div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={shareReport}
            iconLeft={<Icon name="share" size={18} color="#fff" />}
          >
            {shareStatus === 'downloaded' ? 'Downloaded ✓' : 'Share weekly report'}
          </Button>
          <div style={{ marginTop: 8, font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)', textAlign: 'center' }}>
            Download or share a PDF summary with your caregiver or care team.
          </div>
        </div>
      </div>
    </div>
  );
}
