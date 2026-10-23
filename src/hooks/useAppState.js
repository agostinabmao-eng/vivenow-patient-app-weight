import { useCallback, useEffect, useMemo, useState } from 'react';
import { exercisesForPatient, TASK_LABELS, MEAL_TYPES, MEAL_PLAN, MEDICATIONS, patientPlan, buildDailyTasks, currentTimeSlot, hasBpTask } from '../data/sampleData';
import { buildQuestionBlockMap } from '../data/onboardingQuestions';
import { applyFixedRules, shouldReconfirmPersonalReason } from '../data/rules';
import { matchMealPlan } from '../utils/matchMealPlan';
import { bpSeverity, isReadingRecent } from '../utils/bpSafety';

/** Marks one task done (or, with `done: false`, undone) for whichever
 * time-of-day slot applies right now — a single-slot task (weight, water,
 * meals, exercise, meds) just has the one slot; a twice-daily task (blood
 * pressure, glucose) picks morning or evening off the wall clock (see
 * currentTimeSlot), so a morning reading and an evening one land in
 * different slots instead of one overwriting the other. No-ops for a task
 * this patient's plan doesn't actually include. */
function markTaskSlot(day, taskId, done = true) {
  const def = day.taskDefs.find((t) => t.id === taskId);
  if (!def || !day.tasks[taskId]) return day.tasks;
  const slot = currentTimeSlot(def.timesOfDay);
  return { ...day.tasks, [taskId]: { ...day.tasks[taskId], [slot]: done } };
}

const STORAGE_KEY = 'vivenow.today';
const STREAK_KEY = 'vivenow.streak';
const REMINDERS_KEY = 'vivenow.reminders';
const ONBOARDING_KEY = 'vivenow.onboarding';
const WATER_UNIT_KEY = 'vivenow.waterUnit';
const WEIGHT_UNIT_KEY = 'vivenow.weightUnit';
const EXERCISE_SAFETY_INTRO_KEY = 'vivenow.exerciseSafetyIntroSeen';
const LEARN_WATCHED_KEY = 'vivenow.learnWatched';
const REASON_TOAST_KEY = 'vivenow.reasonToastDate';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to the seed below
  }
  // Seed as if she already had a streak coming into today — consistent with
  // the sample Progress history, which covers the 6 days before today.
  return { lastActiveDate: yesterdayKey(), streak: 5 };
}

function emptyMeals() {
  const m = {};
  for (const t of MEAL_TYPES) m[t] = [];
  return m;
}

function defaultTaskDefs(equipmentOwned) {
  return buildDailyTasks(patientPlan, exercisesForPatient(patientPlan, equipmentOwned).length);
}

function defaultTasks(taskDefs) {
  return Object.fromEntries(taskDefs.map((t) => [t.id, Object.fromEntries(t.timesOfDay.map((slot) => [slot, false]))]));
}

// Same shape as defaultTasks, but keeps whatever was already marked done
// for a task/slot that still exists in `taskDefs` — used when equipment
// becomes known right after onboarding submits, so recomputing today's
// task list doesn't erase anything the patient already logged while
// onboarding was paused (see useAppState.submitOnboarding).
function mergeTasksOntoDefs(oldTasks, taskDefs) {
  return Object.fromEntries(
    taskDefs.map((t) => [t.id, Object.fromEntries(t.timesOfDay.map((slot) => [slot, oldTasks[t.id]?.[slot] ?? false]))]),
  );
}

function loadToday(equipmentOwned) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date !== todayKey()) return null;
    // Merge over the current shape so a day saved by an older build (before
    // a field existed, a task was retired, or when `meals` held one entry
    // instead of a list) doesn't leave the app reading something it can't
    // handle. Tasks are merged key-by-key (and slot-by-slot) against
    // *today's* task set rather than spread wholesale, so a task id or
    // time slot retired since the session was saved can't resurface.
    const base = defaultDay(equipmentOwned);
    const meals = emptyMeals();
    for (const t of MEAL_TYPES) {
      const v = parsed.meals?.[t];
      meals[t] = Array.isArray(v) ? v : [];
    }
    const tasks = Object.fromEntries(
      Object.keys(base.tasks).map((id) => [
        id,
        Object.fromEntries(Object.keys(base.tasks[id]).map((slot) => [slot, parsed.tasks?.[id]?.[slot] ?? base.tasks[id][slot]])),
      ]),
    );
    return {
      ...base,
      ...parsed,
      taskDefs: base.taskDefs,
      tasks,
      meals,
      vitals: { ...base.vitals, ...parsed.vitals },
      medsTaken: { ...base.medsTaken, ...parsed.medsTaken },
    };
  } catch {
    return null;
  }
}

function defaultReminders() {
  const r = {};
  for (const id of Object.keys(TASK_LABELS)) r[id] = null;
  return r;
}

function loadReminders() {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (raw) return { ...defaultReminders(), ...JSON.parse(raw) };
  } catch {
    // fall through to defaults below
  }
  return defaultReminders();
}

function loadOnboarding() {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (raw) return { ...defaultOnboarding(), ...JSON.parse(raw) };
  } catch {
    // fall through to the default below
  }
  return defaultOnboarding();
}

// `equipment`/`readingsTime`/`exerciseTime`/`preferredActivities`/
// `barriers`/`personalReason`/`learnHints`/`eveningCheckIn`/
// `rulesApplied`/`responseBlocks` are all set once, at submitOnboarding —
// see data/rules.js for how the fixed rules derive them from `responses`.
// This is also the shape the Provider Portal would read back (see
// DATA THE APP STORES in sampleData's header comment).
function defaultOnboarding() {
  return {
    completed: false,
    completedAt: null,
    responses: {},
    responseBlocks: {},
    stepIndex: 0,
    welcomeSeen: false,
    equipment: [],
    readingsTime: [],
    exerciseTime: [],
    preferredActivities: [],
    barriers: [],
    personalReason: null,
    learnHints: { quickFirst: false, welcomeFirst: false },
    highlightWins: false,
    eveningCheckIn: false,
    rulesApplied: [],
  };
}

// Ounces is the default display unit; glasses is offered in Profile for
// patients who'd rather count containers than track a number of ounces.
function loadWaterUnit() {
  try {
    const raw = localStorage.getItem(WATER_UNIT_KEY);
    if (raw === 'glasses' || raw === 'ounces') return raw;
  } catch {
    // fall through to the default below
  }
  return 'ounces';
}

// Weight is always stored in lbs (see utils/units.js) — this only picks
// which unit it's entered/displayed in.
function loadWeightUnit() {
  try {
    const raw = localStorage.getItem(WEIGHT_UNIT_KEY);
    if (raw === 'lbs' || raw === 'kg') return raw;
  } catch {
    // fall through to the default below
  }
  return 'lbs';
}

function loadExerciseSafetyIntroSeen() {
  try {
    return localStorage.getItem(EXERCISE_SAFETY_INTRO_KEY) === 'true';
  } catch {
    return false;
  }
}

// Which Learn videos have been watched — lifetime, not reset daily like
// `day`, since education content isn't a to-do item.
function loadLearnWatched() {
  try {
    const raw = localStorage.getItem(LEARN_WATCHED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to the default below
  }
  return {};
}

function loadReasonToastDate() {
  try {
    return localStorage.getItem(REASON_TOAST_KEY) || null;
  } catch {
    return null;
  }
}

function defaultDay(equipmentOwned = []) {
  const taskDefs = defaultTaskDefs(equipmentOwned);
  return {
    date: todayKey(),
    taskDefs,
    tasks: defaultTasks(taskDefs),
    medsTaken: Object.fromEntries(MEDICATIONS.map((m) => [m.id, false])),
    videos: exercisesForPatient(patientPlan, equipmentOwned),
    // Activity the patient did on her own, outside the prescribed routine
    // (see ExerciseScreen's "Log other activity" / LogCustomExerciseScreen)
    // — each logging an exercise just like watching a prescribed video.
    customExercises: [],
    waterGlasses: 0,
    // Each meal type holds a *list* of logged entries, not one slot — a
    // patient can log several things for the same meal (e.g. a prescribed
    // item plus something extra) without one overwriting the other.
    meals: emptyMeals(),
    // `bp` also carries `takenAt` once logged, so the pre-exercise safety
    // check can tell a fresh reading from a stale one (see utils/bpSafety).
    vitals: { bp: null, weight: null, steps: null, glucose: null },
    // The weekly check-in survey — separate from the to-do checklist above,
    // since it's a message to the care team rather than a task to complete.
    surveyResponses: {},
    surveySubmittedAt: null,
    // How each exercise felt, keyed by video id — captured right after
    // watching it, separate from the weekly check-in.
    exerciseFeedback: {},
  };
}

// Screens reachable from more than one place via a floating button or an
// in-screen link (not a tab) — see the `open` callback below.
const RETURNS_TO_PREVIOUS = new Set(['sos', 'nurse-notice']);

function newEntryId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Holds today's checklist progress (persisted so a page reload — or opening
 * the PWA again later — doesn't wipe out what the patient already logged
 * today) plus the transient screen/navigation state. */
export default function useAppState() {
  const [day, setDay] = useState(() => {
    const equipmentOwned = loadOnboarding().equipment;
    return loadToday(equipmentOwned) || defaultDay(equipmentOwned);
  });
  const [streak, setStreak] = useState(loadStreak);
  const [onboarding, setOnboarding] = useState(loadOnboarding);
  // Onboarding runs once, ever — not once a day like `day` — so the very
  // first screen depends on whether it's already been completed.
  const [screen, setScreen] = useState(() => (loadOnboarding().completed ? 'home' : 'onboarding'));
  // Simulates a nurse editing the plan from the Provider Portal mid-session
  // (see ProfileScreen's "Simulate nurse update" link) — there's no live
  // plan-sync backend in this prototype, so this only drives the banner
  // itself, not an actual plan change.
  const [nurseUpdateBanner, setNurseUpdateBanner] = useState(false);
  const [previousScreen, setPreviousScreen] = useState('home');
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [glucoseInput, setGlucoseInput] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertReading, setAlertReading] = useState('');
  const [composeMealType, setComposeMealType] = useState(null);
  const [composeEntryId, setComposeEntryId] = useState(null);
  const [openVideoId, setOpenVideoId] = useState(null);
  const [reminders, setReminders] = useState(loadReminders);
  const [reminderTarget, setReminderTarget] = useState(null);
  const [waterUnit, setWaterUnit] = useState(loadWaterUnit);
  const [weightUnit, setWeightUnit] = useState(loadWeightUnit);

  // Pre-exercise safety gate — see components/ExerciseSafetyModal. `exerciseGate`
  // drives which (if any) safety modal is on screen; `symptomCheckPassed`
  // resets every time the patient (re)enters the Exercise tab, so the
  // symptom check runs once per visit, not once per video; `videoFilter`
  // narrows the list to low-intensity videos after "Do gentle mobility
  // instead"; `pendingExerciseVideoId` remembers which video to resume once
  // a fresh BP reading comes back from the Measure Blood Pressure screen.
  const [exerciseGate, setExerciseGate] = useState(null);
  const [symptomCheckPassed, setSymptomCheckPassed] = useState(false);
  const [exerciseVideoFilter, setExerciseVideoFilter] = useState(null);
  const [pendingExerciseVideoId, setPendingExerciseVideoId] = useState(null);
  const [exerciseSafetyIntroSeen, setExerciseSafetyIntroSeen] = useState(loadExerciseSafetyIntroSeen);
  const [showExerciseSafetyIntro, setShowExerciseSafetyIntro] = useState(false);
  const [pendingVideoAfterIntro, setPendingVideoAfterIntro] = useState(null);
  const [learnWatched, setLearnWatched] = useState(loadLearnWatched);
  const [learnVideo, setLearnVideo] = useState(null); // { id, title } | null
  // The date (YYYY-MM-DD) the personal-reason toast was last shown/
  // dismissed — compared against today's date to decide whether to show
  // it again (see HomeScreen's ReasonToast); null means "never shown".
  const [reasonToastDate, setReasonToastDate] = useState(loadReasonToastDate);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(day));
    } catch {
      // storage unavailable (private mode, quota) — checklist just won't persist
    }
  }, [day]);

  useEffect(() => {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    } catch {
      // storage unavailable — streak just won't persist across visits
    }
  }, [streak]);

  useEffect(() => {
    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    } catch {
      // storage unavailable — reminders just won't persist across visits
    }
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(onboarding));
    } catch {
      // storage unavailable — onboarding will just be asked again next visit
    }
  }, [onboarding]);

  useEffect(() => {
    try {
      localStorage.setItem(WATER_UNIT_KEY, waterUnit);
    } catch {
      // storage unavailable — water unit preference just won't stick across visits
    }
  }, [waterUnit]);

  useEffect(() => {
    try {
      localStorage.setItem(WEIGHT_UNIT_KEY, weightUnit);
    } catch {
      // storage unavailable — weight unit preference just won't stick across visits
    }
  }, [weightUnit]);

  useEffect(() => {
    try {
      localStorage.setItem(EXERCISE_SAFETY_INTRO_KEY, String(exerciseSafetyIntroSeen));
    } catch {
      // storage unavailable — the safety intro will just show again next visit
    }
  }, [exerciseSafetyIntroSeen]);

  useEffect(() => {
    try {
      localStorage.setItem(LEARN_WATCHED_KEY, JSON.stringify(learnWatched));
    } catch {
      // storage unavailable — watched videos just won't persist across visits
    }
  }, [learnWatched]);

  const markLearnWatched = useCallback((id) => {
    setLearnWatched((w) => ({ ...w, [id]: true }));
  }, []);

  useEffect(() => {
    try {
      if (reasonToastDate) localStorage.setItem(REASON_TOAST_KEY, reasonToastDate);
    } catch {
      // storage unavailable — the toast will just show again next visit
    }
  }, [reasonToastDate]);

  // Shown once per calendar day (reconfirming the reason, when due, takes
  // priority instead — see HomeScreen) — dismissing (the X, the timeout,
  // or just navigating away) marks today as done so it won't repeat.
  const reasonToastDue = !!(
    onboarding.personalReason?.value &&
    !shouldReconfirmPersonalReason(onboarding.personalReason) &&
    reasonToastDate !== todayKey()
  );
  const dismissReasonToast = useCallback(() => setReasonToastDate(todayKey()), []);

  // Saving doesn't navigate — OnboardingSurveyScreen shows its own closing
  // screen first ("you're all set") and only leaves for Home once the
  // patient taps through that, the same way the post-exercise survey does.
  // The fixed rules (data/rules.js) run right here, on the spot, with no
  // review step — their effects (reminders, equipment-filtered exercises,
  // Learn ordering, the personal-reason reminder) all land in the same
  // update as `completed: true`.
  const submitOnboarding = useCallback((responses) => {
    const now = new Date().toISOString();
    const outcome = applyFixedRules(responses, patientPlan);

    setOnboarding((o) => ({
      ...o,
      completed: true,
      completedAt: now,
      responses,
      responseBlocks: buildQuestionBlockMap(patientPlan),
      stepIndex: 0,
      welcomeSeen: true,
      equipment: outcome.equipmentOwned,
      readingsTime: responses.readingsTime || [],
      exerciseTime: responses.exerciseTime || [],
      preferredActivities: outcome.approvedActivities,
      barriers: responses.barriers || [],
      personalReason: outcome.personalReason ? { value: outcome.personalReason, setAt: now, lastConfirmedAt: now } : null,
      learnHints: { quickFirst: outcome.quickFirst, welcomeFirst: outcome.welcomeFirst },
      highlightWins: outcome.highlightWins,
      eveningCheckIn: outcome.eveningCheckIn,
      rulesApplied: outcome.rulesApplied,
    }));

    // Reminders the weigh-in/exercise rules drive (only when the patient
    // answered "Yes" to "Do you want to set reminders?") — a real build
    // would push these straight to the reminder-scheduling backend; here
    // they just seed the same `reminders` state the bell icon sets by hand.
    setReminders((r) => ({
      ...r,
      ...(outcome.readingsReminderTime ? { weight: outcome.readingsReminderTime } : {}),
      ...(outcome.exerciseReminderTime ? { exercise: outcome.exerciseReminderTime } : {}),
    }));

    // Equipment is only known now — recompute today's exercise (and task)
    // list so a video needing equipment she doesn't have never shows up,
    // preserving anything already logged while onboarding was paused.
    setDay((d) => {
      const videos = exercisesForPatient(patientPlan, outcome.equipmentOwned);
      const taskDefs = buildDailyTasks(patientPlan, videos.length);
      return { ...d, videos, taskDefs, tasks: mergeTasksOntoDefs(d.tasks, taskDefs) };
    });
  }, []);

  // Backing out of the first question goes back to Welcome; backing out of
  // Welcome itself (nowhere earlier to go) pauses instead — the draft
  // (answers so far + which question she was on) is saved as-is, not
  // marked complete, and she lands back on Home with a nudge to finish
  // later. Re-opening onboarding (automatically on next launch, or by
  // tapping that nudge) resumes right there.
  const pauseOnboarding = useCallback((responses, stepIndex, welcomeSeen = true) => {
    setOnboarding((o) => ({ ...o, completed: false, responses, stepIndex, welcomeSeen }));
    setScreen('home');
  }, []);

  // The personal reason (set from the first onboarding "outcomes" answer)
  // is re-asked every few weeks, per the clinical spec — "Yes" just bumps
  // the confirmation date; "Change it" replaces the value and resets the
  // clock the same way (see data/rules.js's REASON_RECONFIRM_DAYS).
  const confirmPersonalReason = useCallback((stillValid, newValue) => {
    setOnboarding((o) => {
      const now = new Date().toISOString();
      return {
        ...o,
        personalReason: stillValid ? { ...o.personalReason, lastConfirmedAt: now } : { value: newValue, setAt: now, lastConfirmedAt: now },
      };
    });
  }, []);

  const simulateNurseUpdate = useCallback(() => setNurseUpdateBanner(true), []);
  const dismissNurseUpdateBanner = useCallback(() => setNurseUpdateBanner(false), []);

  // Reminders are a standing preference (not reset daily like `day`), set
  // from the bell on a Home checklist row — either for just that task or,
  // via "apply to all", for every task at once.
  const openReminderModal = useCallback((taskId) => setReminderTarget(taskId), []);
  const closeReminderModal = useCallback(() => setReminderTarget(null), []);
  const saveReminder = useCallback(
    (time, applyToAll) => {
      setReminders((r) => (applyToAll ? Object.fromEntries(Object.keys(r).map((id) => [id, time])) : { ...r, [reminderTarget]: time }));
      setReminderTarget(null);
    },
    [reminderTarget],
  );

  // SOS and the nurse-notice redirect are both reachable from more than one
  // screen via a floating button or an in-screen link, not a tab — remember
  // where the patient was so Cancel/Back returns them there instead of
  // always dumping them back to Home. Entering the Exercise tab also resets
  // this visit's safety-gate state, so returning to it later asks the
  // symptom check again instead of remembering an earlier answer forever.
  const open = useCallback((next) => {
    setScreen((cur) => {
      if (RETURNS_TO_PREVIOUS.has(next) && !RETURNS_TO_PREVIOUS.has(cur)) setPreviousScreen(cur);
      return next;
    });
    if (next === 'exercise') {
      setSymptomCheckPassed(false);
      setExerciseVideoFilter(null);
      setExerciseGate(null);
    }
  }, []);
  const goHome = useCallback(() => setScreen('home'), []);
  const closeSos = useCallback(() => setScreen(previousScreen), [previousScreen]);

  const openLearnVideo = useCallback(
    (id, title) => {
      setLearnVideo({ id, title });
      open('learn-video');
    },
    [open],
  );
  const closeLearnVideo = useCallback(() => setScreen('learn'), []);

  // The meal composer and video player are their own screens (like Measure
  // Blood Pressure) rather than sub-views nested inside the Nutrition/
  // Exercise tabs, so they get the tab bar's focused, nav-free chrome
  // instead of the tab bar showing underneath their own footer.
  // `entryId` is set when editing an existing logged entry (vs. logging a
  // new one), so saveMeal knows to update it in place instead of appending.
  const openMealComposer = useCallback(
    (mealType, entryId = null) => {
      setComposeMealType(mealType);
      setComposeEntryId(entryId);
      open('nutrition-compose');
    },
    [open],
  );
  const closeMealComposer = useCallback(() => setScreen('nutrition'), []);

  const actuallyOpenVideo = useCallback(
    (id) => {
      setOpenVideoId(id);
      setExerciseGate(null);
      open('exercise-video');
    },
    [open],
  );

  // The heart of the pre-exercise safety check. `checkSymptoms` is false for
  // Previous/Next inside the player (the symptom check already happened to
  // get into this session) and true for a fresh tap from the Exercise list.
  const runExerciseGate = useCallback(
    (video, id, { checkSymptoms }) => {
      if (checkSymptoms && !symptomCheckPassed) {
        setExerciseGate({ stage: 'symptom-check', videoId: id });
        return;
      }
      if (video.intensity !== 'moderate' || !hasBpTask(patientPlan)) {
        actuallyOpenVideo(id);
        return;
      }
      const reading = day.vitals.bp;
      if (!reading || !isReadingRecent(reading.takenAt)) {
        setPendingExerciseVideoId(id);
        setExerciseGate({ stage: 'need-reading', videoId: id });
        return;
      }
      const severity = bpSeverity(reading, patientPlan.bp);
      if (severity === 'high') {
        setExerciseGate({ stage: 'high-block', videoId: id });
        return;
      }
      if (severity === 'moderate') {
        setExerciseGate({ stage: 'moderate-warning', videoId: id });
        return;
      }
      actuallyOpenVideo(id);
    },
    [symptomCheckPassed, day.vitals.bp, actuallyOpenVideo],
  );

  // Entry point from the Exercise list — shows the one-time safety intro
  // first if it's never been seen, then runs the full gate (symptom check,
  // then BP check for a moderate-intensity video).
  const openVideoPlayer = useCallback(
    (id) => {
      const video = day.videos.find((v) => v.id === id);
      if (!video) return;
      if (!exerciseSafetyIntroSeen) {
        setPendingVideoAfterIntro(id);
        setShowExerciseSafetyIntro(true);
        return;
      }
      runExerciseGate(video, id, { checkSymptoms: true });
    },
    [day.videos, exerciseSafetyIntroSeen, runExerciseGate],
  );

  // Previous/Next inside the player — same BP check, no repeat symptom check.
  const goToAdjacentVideo = useCallback(
    (id) => {
      const video = day.videos.find((v) => v.id === id);
      if (!video) return;
      runExerciseGate(video, id, { checkSymptoms: false });
    },
    [day.videos, runExerciseGate],
  );

  const dismissExerciseSafetyIntro = useCallback(() => {
    setExerciseSafetyIntroSeen(true);
    setShowExerciseSafetyIntro(false);
    const id = pendingVideoAfterIntro;
    setPendingVideoAfterIntro(null);
    if (id) {
      const video = day.videos.find((v) => v.id === id);
      if (video) runExerciseGate(video, id, { checkSymptoms: true });
    }
  }, [pendingVideoAfterIntro, day.videos, runExerciseGate]);

  // Reopened on demand from the Exercise tab — purely informational, isn't
  // gating any particular video.
  const openExerciseSafetyIntro = useCallback(() => {
    setPendingVideoAfterIntro(null);
    setShowExerciseSafetyIntro(true);
  }, []);

  // `flaggedIds` are the preExerciseCheck question ids the patient flagged
  // (answered with that question's `ifFlagged` value) — e.g. a fall since
  // the last check-in. A 'pause' outcome wins over a 'caution' one if both
  // are flagged at once; pause reuses the same "skip exercise today, care
  // team notified" screen a severely elevated BP reading shows.
  const submitSymptomCheck = useCallback(
    (flaggedIds) => {
      const videoId = exerciseGate?.videoId;
      const flagged = patientPlan.preExerciseCheck.filter((q) => flaggedIds.includes(q.id));
      if (flagged.some((q) => q.outcome === 'pause')) {
        setExerciseGate({ stage: 'high-block', videoId });
        return;
      }
      if (flagged.some((q) => q.outcome === 'caution')) {
        setExerciseGate({ stage: 'symptom-caution', videoId });
        return;
      }
      setSymptomCheckPassed(true);
      const video = day.videos.find((v) => v.id === videoId);
      if (video) runExerciseGate(video, videoId, { checkSymptoms: false });
      else setExerciseGate(null);
    },
    [exerciseGate, day.videos, runExerciseGate],
  );

  // "Not now" from the caution screen still counts as having passed the
  // symptom check this visit (the patient chose to proceed) — resumes the
  // normal BP-based gate chain for the video that was pending.
  const proceedFromCaution = useCallback(() => {
    const videoId = exerciseGate?.videoId;
    setSymptomCheckPassed(true);
    const video = day.videos.find((v) => v.id === videoId);
    if (video) runExerciseGate(video, videoId, { checkSymptoms: false });
    else setExerciseGate(null);
  }, [exerciseGate, day.videos, runExerciseGate]);

  const exerciseGateContactCareTeam = useCallback(() => {
    setExerciseGate(null);
    open('sos');
  }, [open]);
  const exerciseGateGentleMobility = useCallback(() => {
    setExerciseVideoFilter('low');
    setExerciseGate(null);
  }, []);
  const exerciseGateMeasureNow = useCallback(() => {
    setExerciseGate(null);
    setScreen('bp');
  }, []);
  const closeExerciseGate = useCallback(() => setExerciseGate(null), []);

  const closeVideoPlayer = useCallback(() => setScreen('exercise'), []);

  const saveBp = useCallback(() => {
    const sys = parseInt(bpSys, 10) || 0;
    const dia = parseInt(bpDia, 10) || 0;
    const takenAt = new Date().toISOString();

    setDay((d) => ({ ...d, tasks: markTaskSlot(d, 'bp'), vitals: { ...d.vitals, bp: { sys, dia, takenAt } } }));

    // Came here from the exercise safety gate's "Measure now" — resume that
    // video attempt with this fresh reading instead of the stale one still
    // sitting in `day` this render, and skip the generic post-BP modals.
    if (pendingExerciseVideoId) {
      const id = pendingExerciseVideoId;
      setPendingExerciseVideoId(null);
      const severity = bpSeverity({ sys, dia }, patientPlan.bp);
      if (severity === 'high') {
        setScreen('exercise');
        setExerciseGate({ stage: 'high-block', videoId: id });
      } else if (severity === 'moderate') {
        setScreen('exercise');
        setExerciseGate({ stage: 'moderate-warning', videoId: id });
      } else {
        actuallyOpenVideo(id);
      }
      return;
    }

    const severity = bpSeverity({ sys, dia }, patientPlan.bp);
    if (severity === 'high') {
      // A severely elevated reading blocks exercise for the rest of the
      // day regardless of why it was taken — land on the Exercise tab so
      // dismissing the notice reveals a screen that reflects that (a bare
      // "Measure Blood Pressure" screen underneath would strand the patient).
      setScreen('exercise');
      setExerciseGate({ stage: 'high-block' });
      return;
    }
    if (severity === 'moderate') {
      setAlertReading(`${sys}/${dia} mmHg`);
      setShowAlert(true);
      return;
    }
    setScreen('home');
  }, [bpSys, bpDia, pendingExerciseVideoId, actuallyOpenVideo]);

  const saveWeight = useCallback((value) => {
    const weight = parseFloat(value) || 0;
    setDay((d) => ({ ...d, vitals: { ...d.vitals, weight }, tasks: markTaskSlot(d, 'weight') }));
    setScreen('home');
  }, []);

  const saveSteps = useCallback((value) => {
    const steps = parseInt(value, 10) || 0;
    setDay((d) => ({ ...d, vitals: { ...d.vitals, steps } }));
    setScreen('home');
  }, []);

  const saveGlucose = useCallback((value) => {
    const glucose = parseInt(value, 10) || 0;
    setDay((d) => ({ ...d, vitals: { ...d.vitals, glucose }, tasks: markTaskSlot(d, 'glucose') }));
    setScreen('home');
  }, []);

  // Home hides a task once it's done, behind a "See completed tasks"
  // toggle — unmarking it there just resets the checklist flag, it doesn't
  // erase whatever was actually logged (a reading, a meal entry, watched
  // videos), so re-doing the task naturally marks it done again.
  const uncompleteTask = useCallback((taskId) => {
    setDay((d) => ({
      ...d,
      tasks: { ...d.tasks, [taskId]: Object.fromEntries(Object.keys(d.tasks[taskId]).map((slot) => [slot, false])) },
    }));
  }, []);

  const dismissAlert = useCallback(() => {
    setShowAlert(false);
    setScreen('home');
  }, []);

  const callCaregiver = useCallback(() => {
    setShowAlert(false);
    open('sos');
  }, [open]);

  // Each medication is its own tap target rather than one yes/no choice for
  // "did you take your meds" — a patient who only took one of several doses
  // can say exactly that. The task counts as done once every medication is
  // marked taken.
  const toggleMed = useCallback((medId) => {
    setDay((d) => {
      const medsTaken = { ...d.medsTaken, [medId]: !d.medsTaken[medId] };
      const allTaken = MEDICATIONS.every((m) => medsTaken[m.id]);
      return { ...d, medsTaken, tasks: markTaskSlot(d, 'meds', allTaken) };
    });
  }, []);
  const markAllMedsTaken = useCallback(() => {
    setDay((d) => ({
      ...d,
      medsTaken: Object.fromEntries(MEDICATIONS.map((m) => [m.id, true])),
      tasks: markTaskSlot(d, 'meds', true),
    }));
  }, []);

  // A full workout only counts as done by playing it start to finish (see
  // VideoPlayerScreen) — there's no manual toggle. A single exercise with a
  // prescribed dose instead counts one set per playthrough, and only
  // checks off once every set is done — the player shows "Set 1 of 2" and
  // a short rest in between, and calling this again before all sets are
  // done just advances the set counter without marking it watched yet.
  // Either way, the Exercise task itself is done once at least one video
  // is — the task isn't "do every assigned video/exercise". Marking
  // something watched doesn't navigate anywhere on its own — the player
  // stays open afterward to show the "great job" screen and a short
  // feedback survey.
  const markVideoWatched = useCallback((id) => {
    setDay((d) => {
      const current = d.videos.find((v) => v.id === id);
      if (!current || current.checked) return d;
      const videos = d.videos.map((v) => {
        if (v.id !== id) return v;
        if (v.kind !== 'exercise') return { ...v, checked: true };
        const setsDone = Math.min(v.dose.sets, v.setsDone + 1);
        return { ...v, setsDone, checked: setsDone >= v.dose.sets };
      });
      return { ...d, videos, tasks: markTaskSlot(d, 'exercise', videos.some((v) => v.checked) || d.customExercises.length > 0) };
    });
  }, []);

  // Logging an activity the patient did on her own (outside the prescribed
  // routine) counts toward the Exercise task exactly like watching a
  // prescribed video does — see ExerciseScreen's "Log other activity".
  const openCustomExerciseForm = useCallback(() => open('exercise-log-custom'), [open]);
  const closeCustomExerciseForm = useCallback(() => setScreen('exercise'), []);
  const saveCustomExercise = useCallback((activityType, durationMinutes, intensity) => {
    setDay((d) => {
      const entry = { id: newEntryId(), activityType, durationMinutes, intensity, loggedAt: new Date().toISOString() };
      const customExercises = [...d.customExercises, entry];
      return { ...d, customExercises, tasks: markTaskSlot(d, 'exercise', true) };
    });
    setScreen('exercise');
  }, []);
  const removeCustomExercise = useCallback((id) => {
    setDay((d) => {
      const customExercises = d.customExercises.filter((e) => e.id !== id);
      const stillDone = d.videos.some((v) => v.checked) || customExercises.length > 0;
      return { ...d, customExercises, tasks: markTaskSlot(d, 'exercise', stillDone) };
    });
  }, []);

  const submitExerciseFeedback = useCallback((id, feedback) => {
    setDay((d) => ({ ...d, exerciseFeedback: { ...d.exerciseFeedback, [id]: feedback } }));
  }, []);

  const setWaterGlasses = useCallback((glasses) => {
    setDay((d) => {
      const clamped = Math.max(0, Math.round(glasses));
      return { ...d, waterGlasses: clamped, tasks: markTaskSlot(d, 'water', clamped > 0) };
    });
  }, []);
  const saveWater = useCallback(() => {
    setDay((d) => ({ ...d, tasks: markTaskSlot(d, 'water', d.waterGlasses > 0) }));
    setScreen('home');
  }, []);

  const applyMealsUpdate = useCallback((mealType, updater) => {
    setDay((d) => {
      const meals = { ...d.meals, [mealType]: updater(d.meals[mealType]) };
      const anyLogged = MEAL_TYPES.some((t) => meals[t].length > 0);
      return { ...d, meals, tasks: markTaskSlot(d, 'meals', anyLogged) };
    });
  }, []);

  // One tap on an un-logged prescribed item logs exactly that — no need to
  // go through the composer when it's already what the care team asked for.
  const quickLogMeal = useCallback(
    (mealType, item) => {
      const when = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      applyMealsUpdate(mealType, (entries) => [...entries, { id: newEntryId(), text: item.name, calories: item.calories, when, planItemName: item.name }]);
      setScreen('nutrition');
    },
    [applyMealsUpdate],
  );

  // Un-checking a logged plan item removes just that entry — the checkbox
  // is a real toggle, not a one-way "log" action.
  const removeMealEntry = useCallback(
    (mealType, entryId) => {
      applyMealsUpdate(mealType, (entries) => entries.filter((e) => e.id !== entryId));
    },
    [applyMealsUpdate],
  );

  // Saving from the composer either appends a new logged entry, or — when
  // opened to edit one (composeEntryId set) — updates that entry in place,
  // so it never wipes out anything else already logged for that meal.
  const saveMeal = useCallback(
    (mealType, text, calories) => {
      const when = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const planItemName = matchMealPlan(text, MEAL_PLAN[mealType])?.name ?? null;
      applyMealsUpdate(mealType, (entries) => {
        if (composeEntryId) {
          return entries.map((e) => (e.id === composeEntryId ? { ...e, text, calories, when, planItemName } : e));
        }
        return [...entries, { id: newEntryId(), text, calories, when, planItemName }];
      });
      setScreen('nutrition');
    },
    [applyMealsUpdate, composeEntryId],
  );

  // The check-in survey is reachable from its own Home card, not the
  // to-do checklist — submitting it sends the answers to the care team
  // (recorded here as a timestamp + the answers themselves) and returns
  // to Home, the same pattern as every other task screen.
  const submitSurvey = useCallback((responses) => {
    setDay((d) => ({ ...d, surveyResponses: responses, surveySubmittedAt: new Date().toISOString() }));
    setScreen('home');
  }, []);

  // Counted in time slots, not tasks — a twice-daily task (blood pressure,
  // glucose) contributes up to 2, so taking just the morning reading still
  // moves the needle on "X of Y complete" even before the evening one.
  const doneCount = useMemo(
    () => Object.values(day.tasks).reduce((sum, slots) => sum + Object.values(slots).filter(Boolean).length, 0),
    [day.tasks],
  );
  const totalCount = useMemo(() => Object.values(day.tasks).reduce((sum, slots) => sum + Object.keys(slots).length, 0), [day.tasks]);

  // The streak counts consecutive calendar days with at least one logged
  // task — extend it the first time today crosses that bar, don't touch it
  // again today after that, and reset it if a day was missed entirely.
  useEffect(() => {
    if (doneCount === 0) return;
    setStreak((s) => {
      if (s.lastActiveDate === todayKey()) return s;
      const continuesStreak = s.lastActiveDate === yesterdayKey();
      return { lastActiveDate: todayKey(), streak: continuesStreak ? s.streak + 1 : 1 };
    });
  }, [doneCount]);

  return {
    screen,
    open,
    goHome,
    closeSos,
    day,
    streak: streak.streak,
    onboarding,
    submitOnboarding,
    pauseOnboarding,
    confirmPersonalReason,
    reasonToastDue,
    dismissReasonToast,
    nurseUpdateBanner,
    simulateNurseUpdate,
    dismissNurseUpdateBanner,
    waterUnit,
    setWaterUnit,
    weightUnit,
    setWeightUnit,
    doneCount,
    totalCount,
    uncompleteTask,
    bpSys,
    setBpSys,
    bpDia,
    setBpDia,
    saveBp,
    weightInput,
    setWeightInput,
    saveWeight,
    stepsInput,
    setStepsInput,
    saveSteps,
    glucoseInput,
    setGlucoseInput,
    saveGlucose,
    showAlert,
    alertReading,
    dismissAlert,
    callCaregiver,
    toggleMed,
    markAllMedsTaken,
    openVideoId,
    openVideoPlayer,
    goToAdjacentVideo,
    closeVideoPlayer,
    markVideoWatched,
    openCustomExerciseForm,
    closeCustomExerciseForm,
    saveCustomExercise,
    removeCustomExercise,
    submitExerciseFeedback,
    exerciseGate,
    submitSymptomCheck,
    proceedFromCaution,
    exerciseGateContactCareTeam,
    exerciseGateGentleMobility,
    exerciseGateMeasureNow,
    closeExerciseGate,
    exerciseVideoFilter,
    showExerciseSafetyIntro,
    dismissExerciseSafetyIntro,
    openExerciseSafetyIntro,
    setWaterGlasses,
    saveWater,
    learnWatched,
    markLearnWatched,
    learnVideo,
    openLearnVideo,
    closeLearnVideo,
    composeMealType,
    composeEntryId,
    openMealComposer,
    closeMealComposer,
    quickLogMeal,
    removeMealEntry,
    saveMeal,
    submitSurvey,
    reminders,
    reminderTarget,
    openReminderModal,
    closeReminderModal,
    saveReminder,
  };
}
