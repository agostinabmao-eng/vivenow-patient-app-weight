import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import Alert from '../components/Alert';
import MetricCard from '../components/MetricCard';
import MetricActionSheet from '../components/MetricActionSheet';
import TodoRow from '../components/TodoRow';
import Input from '../components/Input';
import Button from '../components/Button';
import WaterSlider, { formatWater } from '../components/WaterSlider';
import MedicationList from '../components/MedicationList';
import Toast from '../components/Toast';
import { HeroProgressCard, WeightGoalMiniCard } from '../components/ProgressCards';
import { formatWeight, weightToLbs } from '../utils/units';
import { metrics, patientName, MEDICATIONS, patientPlan, todaySample, WEIGHT_DELTA_LBS, isTaskFullyDone, formatSlotStatus } from '../data/sampleData';

// Where "Log data" sends each summary card — the dedicated vitals screen
// for anything with one, or the tab that owns that metric otherwise
// (Calories and Exercises are both logged through their own tabs, not a
// standalone screen).
const LOG_SCREEN_FOR_METRIC = {
  weight: 'weight',
  cal: 'nutrition',
  exercises: 'exercise',
  steps: 'steps',
  bp: 'bp',
  glucose: 'glucose',
};

// The tasks simple enough (one value, one drag, or a short checklist) to
// log right in the to-do row instead of opening their own screen. Meals
// and Exercise stay full screens — a meal plan and a video library don't
// fit inline without recreating the clutter Simple mode is trying to remove.
const INLINE_TASK_IDS = new Set(['weight', 'bp', 'meds', 'water']);

function OnboardingNudge({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textAlign: 'left',
        marginTop: 16,
        background: 'var(--teal-50)',
        border: '1.5px solid var(--teal-200)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: 16,
        cursor: 'pointer',
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="clipboard-list" size={20} color="var(--teal-600)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '700 0.9375rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>Finish setting up your profile</div>
        <div style={{ font: '400 0.8125rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 2 }}>
          A few more questions to help your care team build your plan
        </div>
      </div>
      <Icon name="chevron-right" size={20} color="var(--gray-400)" />
    </button>
  );
}

/** A to-do row that expands in place instead of navigating away, for the
 * handful of tasks simple enough to log with one value or one choice —
 * used only in Simple mode, where cutting a screen transition per task is
 * the whole point. */
function InlineTodoRow({ icon, label, sub, done, expanded, onToggle, reminderSet, onSetReminder, children }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        role="button"
        aria-checked={done}
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, minHeight: 56, boxSizing: 'border-box', cursor: 'pointer' }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: done ? 'var(--success-subtle)' : 'var(--teal-50)',
          }}
        >
          <Icon name={icon} size={18} color={done ? 'var(--success)' : 'var(--teal-600)'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '600 0.9375rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{label}</div>
          <div style={{ font: '400 0.78125rem/1.3 var(--font-sans)', color: done ? 'var(--success)' : 'var(--text-muted)' }}>{sub}</div>
        </div>
        <IconButton
          variant="ghost"
          size="sm"
          label={`Set reminder for ${label}`}
          title="Set reminder"
          onClick={(e) => {
            e.stopPropagation();
            onSetReminder();
          }}
          style={reminderSet ? { background: 'var(--teal-50)' } : undefined}
        >
          <Icon name="bell" color={reminderSet ? 'var(--teal-600)' : 'var(--gray-400)'} />
        </IconButton>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="var(--gray-400)" />
      </div>
      {expanded && <div style={{ padding: '0 14px 16px' }}>{children}</div>}
    </div>
  );
}

/** A done task, collapsed behind "See completed tasks" — grayed out and
 * struck through so it reads as done-and-out-of-the-way, tap to undo (this
 * only resets the checklist flag; whatever was actually logged stays put,
 * see useAppState.uncompleteTask). */
function CompletedTaskRow({ icon, label, onUndo }) {
  return (
    <div
      onClick={onUndo}
      role="checkbox"
      aria-checked="true"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onUndo()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--gray-50)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 14,
        minHeight: 56,
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-200)' }}>
        <Icon name="check" size={18} color="var(--text-muted)" />
      </div>
      <div style={{ flex: 1, minWidth: 0, font: '600 0.9375rem/1.3 var(--font-sans)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{label}</div>
    </div>
  );
}

/** The weekly check-in card, shared by both Home layouts — Simple mode
 * used to skip it entirely, but it's a message to the care team (not a
 * to-do item), so it belongs on Home regardless of which layout is showing. */
function CheckInCard({ day, onOpenSurvey }) {
  return (
    <button
      onClick={onOpenSurvey}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textAlign: 'left',
        marginTop: 20,
        background: day.surveySubmittedAt ? 'var(--surface-card)' : 'var(--teal-50)',
        border: `1.5px solid ${day.surveySubmittedAt ? 'var(--border-subtle)' : 'var(--teal-200)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: 16,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: day.surveySubmittedAt ? 'var(--success-subtle)' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={day.surveySubmittedAt ? 'check' : 'stethoscope'} size={20} color={day.surveySubmittedAt ? 'var(--success)' : 'var(--teal-600)'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '700 0.9375rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>
          {day.surveySubmittedAt ? 'Check-in sent to your care team' : 'Tell your care team how you’re feeling'}
        </div>
        <div style={{ font: '400 0.8125rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 2 }}>
          {day.surveySubmittedAt ? 'Thanks for checking in — tap to review' : 'A quick weekly check-in — takes under a minute'}
        </div>
      </div>
      <Icon name="chevron-right" size={20} color="var(--gray-400)" />
    </button>
  );
}

/** The active/completed split + toggle, shared by both Home layouts —
 * done tasks drop out of the main list so it only ever shows what's left,
 * with completed ones a tap away instead of gone. */
function CompletedTasksSection({ completedTodos, showCompleted, onToggleShow, onUndo }) {
  if (completedTodos.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={onToggleShow}
        style={{
          display: 'block',
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '10px 0',
          textAlign: 'center',
          font: '600 0.875rem/1 var(--font-sans)',
          color: 'var(--teal-600)',
          cursor: 'pointer',
        }}
      >
        {showCompleted ? 'Hide completed tasks' : `See completed tasks (${completedTodos.length})`}
      </button>
      {showCompleted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {completedTodos.map((t) => (
            <CompletedTaskRow key={t.id} icon={t.icon} label={t.label} onUndo={() => onUndo(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomeScreen({
  day,
  streak,
  doneCount,
  totalCount,
  online,
  onOpenTask,
  onOpenProfile,
  onOpenSurvey,
  reminders,
  onSetReminder,
  onboardingComplete,
  onResumeOnboarding,
  onUncompleteTask,
  simpleMode,
  waterUnit,
  weightUnit,
  weightInput,
  setWeightInput,
  saveWeight,
  bpSys,
  setBpSys,
  bpDia,
  setBpDia,
  saveBp,
  medsTaken,
  onToggleMed,
  onMarkAllMedsTaken,
  setWaterGlasses,
}) {
  const [actionMetric, setActionMetric] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Inline saves (Weight/BP) confirm with a toast instead of making the
  // patient close the row by hand — it collapses on its own a beat later
  // and drops to the completed section.
  const confirmSave = (message) => {
    setToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      setExpandedTask(null);
    }, 1600);
  };
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // Which tasks apply today — the union of base tasks, the patient's
  // condition templates, and her mobility-level template, deduplicated
  // (see sampleData.buildDailyTasks). A task with more than one
  // time-of-day slot (blood pressure, glucose — assigned twice-daily by
  // more than one condition) shows one row with a check per time instead
  // of needing its own doneSub/notDoneSub text.
  const todos = day.taskDefs.map((t) => {
    const slots = day.tasks[t.id];
    const done = isTaskFullyDone(slots);
    const multiSlot = t.timesOfDay.length > 1;
    let sub = multiSlot ? formatSlotStatus(t.timesOfDay, slots) : done ? t.doneSub : t.notDoneSub;
    if (t.id === 'exercise' && !done) sub = `${day.videos.length} videos available`;
    if (t.id === 'water' && !done) sub = day.waterGlasses > 0 ? `${formatWater(day.waterGlasses, waterUnit)} so far` : 'Not started yet';
    if (t.id === 'meds' && !done) {
      const takenCount = MEDICATIONS.filter((m) => day.medsTaken[m.id]).length;
      sub = takenCount > 0 ? `${takenCount} of ${MEDICATIONS.length} taken` : 'Not taken yet';
    }
    if (t.id === 'meals' && !done) {
      const loggedCount = Object.values(day.meals).filter((entries) => entries.length > 0).length;
      sub = loggedCount > 0 ? `${loggedCount} of 4 meals logged` : 'Not logged yet';
    }
    return { ...t, done, sub };
  });
  // Water's "done" flag flips live while its slider is being dragged (no
  // separate Save step, unlike Weight/BP) — without this exception the
  // row would vanish out from under the patient's thumb the instant it
  // crosses 0, before they can actually finish dragging. Keeping the
  // expanded task in the active list (even once done) fixes that; it drops
  // to the completed section as soon as it's collapsed.
  const activeTodos = todos.filter((t) => !t.done || t.id === expandedTask);
  const completedTodos = todos.filter((t) => t.done && t.id !== expandedTask);

  if (simpleMode) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div
          className="vh-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `calc(16px + var(--safe-top)) calc(20px + var(--safe-right)) 88px calc(20px + var(--safe-left))`,
          }}
        >
          {!online && (
            <div style={{ marginBottom: 14 }}>
              <Alert tone="warning" title="You're offline">
                Vitals you enter now are saved on this phone and will sync automatically once you&apos;re back online.
              </Alert>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Good morning, {patientName}</div>
            <IconButton variant="outline" label="Open your profile" onClick={onOpenProfile}>
              <Icon name="user" size={20} />
            </IconButton>
          </div>

          {!onboardingComplete && <OnboardingNudge onClick={onResumeOnboarding} />}

          <div style={{ marginTop: 14 }}>
            <HeroProgressCard
              eyebrow="Today's Progress"
              value={doneCount}
              goal={totalCount}
              unit="tasks completed"
              corner={
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <Icon name="flame" size={16} color="#fff" />
                  <span style={{ font: '700 0.875rem/1 var(--font-display)', color: '#fff' }}>{streak}</span>
                </div>
              }
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <WeightGoalMiniCard weightGoal={patientPlan.weight} currentLbs={todaySample.weight} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
            {activeTodos.map((t) => {
              if (!INLINE_TASK_IDS.has(t.id)) {
                return (
                  <TodoRow
                    key={t.id}
                    icon={t.icon}
                    label={t.label}
                    sub={t.sub}
                    done={t.done}
                    reminderSet={!!reminders[t.id]}
                    onClick={() => onOpenTask(t.screen)}
                    onSetReminder={() => onSetReminder(t.id)}
                  />
                );
              }
              const expanded = expandedTask === t.id;
              return (
                <InlineTodoRow
                  key={t.id}
                  icon={t.icon}
                  label={t.label}
                  sub={t.sub}
                  done={t.done}
                  expanded={expanded}
                  onToggle={() => setExpandedTask(expanded ? null : t.id)}
                  reminderSet={!!reminders[t.id]}
                  onSetReminder={() => onSetReminder(t.id)}
                >
                  {t.id === 'weight' && (
                    <>
                      <Input
                        label={`Weight (${weightUnit})`}
                        type="number"
                        inputMode="decimal"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        containerStyle={{ marginTop: 4 }}
                      />
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        disabled={!((parseFloat(weightInput) || 0) > 0)}
                        onClick={() => {
                          saveWeight(weightToLbs(parseFloat(weightInput) || 0, weightUnit));
                          confirmSave('Weight saved');
                        }}
                        style={{ marginTop: 10 }}
                        iconLeft={<Icon name="check" size={16} />}
                      >
                        OK, save
                      </Button>
                    </>
                  )}
                  {t.id === 'bp' && (
                    <>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <Input
                          label="Systolic"
                          type="number"
                          inputMode="numeric"
                          value={bpSys}
                          onChange={(e) => setBpSys(e.target.value)}
                          containerStyle={{ flex: 1, minWidth: 0 }}
                        />
                        <Input
                          label="Diastolic"
                          type="number"
                          inputMode="numeric"
                          value={bpDia}
                          onChange={(e) => setBpDia(e.target.value)}
                          containerStyle={{ flex: 1, minWidth: 0 }}
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        disabled={!(bpSys !== '' && bpDia !== '')}
                        onClick={() => {
                          saveBp();
                          confirmSave('Blood pressure saved');
                        }}
                        style={{ marginTop: 10 }}
                        iconLeft={<Icon name="check" size={16} />}
                      >
                        OK, save
                      </Button>
                    </>
                  )}
                  {t.id === 'meds' && (
                    <div style={{ marginTop: 4 }}>
                      <MedicationList medsTaken={medsTaken} onToggleMed={onToggleMed} onMarkAllTaken={onMarkAllMedsTaken} />
                    </div>
                  )}
                  {t.id === 'water' && (
                    <div style={{ marginTop: 8 }}>
                      <WaterSlider waterGlasses={day.waterGlasses} waterUnit={waterUnit} onChange={setWaterGlasses} />
                    </div>
                  )}
                </InlineTodoRow>
              );
            })}
          </div>

          {activeTodos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', font: '600 0.875rem/1.4 var(--font-sans)', color: 'var(--success)' }}>
              All done for today — nice work!
            </div>
          )}

          <CompletedTasksSection
            completedTodos={completedTodos}
            showCompleted={showCompleted}
            onToggleShow={() => setShowCompleted((s) => !s)}
            onUndo={onUncompleteTask}
          />

          <CheckInCard day={day} onOpenSurvey={onOpenSurvey} />
        </div>

        <Toast message={toast} />

        {actionMetric && (
          <MetricActionSheet
            metric={actionMetric}
            onClose={() => setActionMetric(null)}
            onSeeProgress={() => {
              setActionMetric(null);
              onOpenTask('progress');
            }}
            onLogData={() => {
              setActionMetric(null);
              onOpenTask(LOG_SCREEN_FOR_METRIC[actionMetric.id] || 'progress');
            }}
          />
        )}
      </div>
    );
  }

  const completedVideos = day.videos.filter((v) => v.checked).length;
  const weightMetric = {
    ...metrics[0],
    value: formatWeight(todaySample.weight, weightUnit),
    unit: `${WEIGHT_DELTA_LBS < 0 ? '−' : '+'}${formatWeight(Math.abs(WEIGHT_DELTA_LBS), weightUnit)} this week`,
  };
  const summaryCards = [
    weightMetric,
    metrics[1], // Calories
    {
      id: 'exercises',
      icon: 'dumbbell',
      label: 'Exercises',
      value: `${completedVideos}/${day.videos.length}`,
      unit: 'videos done',
      valueNum: completedVideos,
      goal: day.videos.length,
    },
    metrics[2], // Steps
    metrics[3], // Blood Pressure
    metrics[4], // Glucose
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        className="vh-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `calc(16px + var(--safe-top)) calc(20px + var(--safe-right)) 88px calc(20px + var(--safe-left))`,
        }}
      >
        {!online && (
          <div style={{ marginBottom: 14 }}>
            <Alert tone="warning" title="You're offline">
              Vitals you enter now are saved on this phone and will sync automatically once you&apos;re back online.
            </Alert>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Good morning, {patientName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Icon name="flame" size={16} color="var(--gold-500)" />
              <span style={{ font: '600 0.8125rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>
                {streak}-day streak
              </span>
            </div>
          </div>
          <IconButton variant="outline" label="Open your profile" onClick={onOpenProfile}>
            <Icon name="user" size={20} />
          </IconButton>
        </div>

        {!onboardingComplete && <OnboardingNudge onClick={onResumeOnboarding} />}

        <div style={{ marginTop: 18, font: '600 0.75rem/1 var(--font-display)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)' }}>
          Today&apos;s Summary
        </div>
        <div className="vh-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '10px -20px 0', padding: '0 20px 2px' }}>
          {summaryCards.map((m) => (
            <MetricCard key={m.id} metric={m} onClick={() => setActionMetric(m)} />
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <WeightGoalMiniCard weightGoal={patientPlan.weight} currentLbs={todaySample.weight} />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 20 }}>
          <div style={{ font: '600 0.75rem/1 var(--font-display)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)' }}>To-Do List</div>
          <div style={{ font: '600 0.8125rem/1.2 var(--font-sans)', color: 'var(--teal-600)' }}>
            {doneCount} of {totalCount} complete
          </div>
        </div>
        {doneCount < totalCount && (
          <div style={{ font: '400 0.78125rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 4 }}>
            No worries — you can still log today&apos;s activity.
          </div>
        )}
        {activeTodos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', font: '600 0.875rem/1.4 var(--font-sans)', color: 'var(--success)' }}>
            All done for today — nice work!
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {activeTodos.map((t) => (
            <TodoRow
              key={t.id}
              icon={t.icon}
              label={t.label}
              sub={t.sub}
              done={t.done}
              reminderSet={!!reminders[t.id]}
              onClick={() => onOpenTask(t.screen)}
              onSetReminder={() => onSetReminder(t.id)}
            />
          ))}
        </div>

        <CompletedTasksSection
          completedTodos={completedTodos}
          showCompleted={showCompleted}
          onToggleShow={() => setShowCompleted((s) => !s)}
          onUndo={onUncompleteTask}
        />

        <CheckInCard day={day} onOpenSurvey={onOpenSurvey} />
      </div>

      {actionMetric && (
        <MetricActionSheet
          metric={actionMetric}
          onClose={() => setActionMetric(null)}
          onSeeProgress={() => {
            setActionMetric(null);
            onOpenTask('progress');
          }}
          onLogData={() => {
            setActionMetric(null);
            onOpenTask(LOG_SCREEN_FOR_METRIC[actionMetric.id] || 'progress');
          }}
        />
      )}
    </div>
  );
}
