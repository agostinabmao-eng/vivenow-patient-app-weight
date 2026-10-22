// Sample data standing in for the RPM backend (vitals device sync, video
// library, care-team contact). Shapes match what the real API would return.

export const patientName = 'Dorothy';

// Six days of history (oldest first, ending yesterday) backing the Progress
// trend charts and weekly summaries. "Today" is never in here — it's always
// computed live from actual app state so the charts move as the patient
// actually logs things in this session. Day -1 matches the pre-existing
// "Yesterday" entries so the two views never contradict each other.
export const weeklySample = [
  { bp: { sys: 132, dia: 86 }, glucose: 148, weight: 213.6, doneCount: 3, videosCompleted: 1, mealCalories: 1450, water: 5, steps: 5200 },
  { bp: { sys: 128, dia: 84 }, glucose: 142, weight: 213.0, doneCount: 5, videosCompleted: 2, mealCalories: 1720, water: 6, steps: 6100 },
  { bp: { sys: 126, dia: 83 }, glucose: 150, weight: 212.4, doneCount: 4, videosCompleted: 1, mealCalories: 1580, water: 6, steps: 7300 },
  { bp: { sys: 130, dia: 85 }, glucose: 138, weight: 211.8, doneCount: 6, videosCompleted: 3, mealCalories: 1690, water: 8, steps: 8400 },
  { bp: { sys: 122, dia: 80 }, glucose: 130, weight: 211.1, doneCount: 5, videosCompleted: 2, mealCalories: 1610, water: 7, steps: 6800 },
  { bp: { sys: 124, dia: 82 }, glucose: 126, weight: 210.5, doneCount: 4, videosCompleted: 2, mealCalories: 1550, water: 7, steps: 7600 },
];

// Any day further back than weeklySample covers is generated from a
// deterministic formula rather than hand-authored — same idea as
// weeklySample, just openended, so "previous period" comparisons (e.g. the
// 7 days before this week, or the 30 days before this month) always have
// something to compare against no matter how far back the period picker
// needs to reach.
function sampleDayAt(daysAgo) {
  if (daysAgo >= 1 && daysAgo <= weeklySample.length) {
    return weeklySample[weeklySample.length - daysAgo];
  }
  const m = daysAgo - weeklySample.length;
  return {
    bp: { sys: 134 + (m % 5), dia: 88 + (m % 3) },
    glucose: 150 + (m % 7) * 2,
    weight: Math.round((214 - m * 0.3) * 10) / 10,
    doneCount: 2 + (m % 5),
    videosCompleted: m % 4,
    mealCalories: 1400 + (m % 6) * 60,
    water: 4 + (m % 5),
    steps: 4000 + (m % 6) * 500,
  };
}

/** Oldest-first sample days for [startDaysAgo, endDaysAgo] inclusive (both
 * counted as "days before today"), e.g. sampleRange(7, 1) is the 7 days
 * immediately before today. */
export function sampleRange(startDaysAgo, endDaysAgo) {
  const days = [];
  for (let d = startDaysAgo; d >= endDaysAgo; d--) days.push(sampleDayAt(d));
  return days;
}

// 30 days of history ending yesterday — kept as a named export since
// Progress used to slice it directly; period math now goes through
// sampleRange instead so it isn't bounded by this array's length.
export const monthlySample = sampleRange(30, 1);

// Today's defaults before the patient logs anything — same numbers the old
// static metrics used, so nothing visually jumps the moment the app loads.
export const todaySample = { bp: { sys: 120, dia: 80 }, glucose: 122, weight: 210.0 };

// Flavor text for the Weight summary card ("-1.6 lbs this week") — kept as
// a raw lbs number (not a pre-formatted string) so it can be converted to
// kg the same way any other weight is.
export const WEIGHT_DELTA_LBS = -1.6;

export const TASKS_PER_DAY = 6;
export const CALORIE_BURN_GOAL = 600;
export const STEPS_GOAL = 8000;
export const TODAY_STEPS = 2450;

export const OUNCES_PER_GLASS = 8;

// Order matches the Today's Summary carousel: Weight, Calories, Exercises
// (inserted dynamically in HomeScreen from live video-completion state),
// Steps, Blood Pressure, Glucose (kept last per product direction).
// Weight, Blood Pressure and Glucose all keep a trend sparkline instead of a
// progress wheel — none of them is a daily 0-to-goal counter (Weight is a
// slow trajectory; BP/Glucose are point-in-time readings), so a fill ring
// doesn't map onto them the way it does for Calories/Steps/Exercises.
export const metrics = [
  {
    id: 'weight',
    icon: 'scale',
    label: 'Weight',
    value: `${todaySample.weight} lbs`,
    unit: `${WEIGHT_DELTA_LBS} lbs this week`,
    hasTrend: true,
    trend: [...weeklySample.map((d) => d.weight), todaySample.weight],
  },
  { id: 'cal', icon: 'flame', label: 'Calories', value: '550', unit: `of ${CALORIE_BURN_GOAL} goal`, valueNum: 550, goal: CALORIE_BURN_GOAL },
  { id: 'steps', icon: 'footprints', label: 'Steps', value: '2,450', unit: `of ${STEPS_GOAL.toLocaleString()} goal`, valueNum: 2450, goal: STEPS_GOAL },
  {
    id: 'bp',
    icon: 'activity',
    label: 'Blood Pressure',
    value: `${todaySample.bp.sys}/${todaySample.bp.dia}`,
    unit: 'mmHg',
    hasTrend: true,
    trend: [...weeklySample.map((d) => d.bp.sys), todaySample.bp.sys],
  },
  {
    id: 'glucose',
    icon: 'droplets',
    label: 'Glucose',
    value: `${todaySample.glucose}`,
    unit: 'mg/dL',
    hasTrend: true,
    trend: [...weeklySample.map((d) => d.glucose), todaySample.glucose],
  },
];

// The care team's prescribed plan for this patient — stands in for what a
// real build would pull from the Provider Portal (diagnosis/BMI coding,
// conditions, medication status, weight goal, calorie/water targets, and
// the blood-pressure thresholds that gate exercise). Everything the app
// used to hardcode (which tasks apply, the calorie goal, the water goal,
// the "elevated BP" threshold) reads from here instead.
export const patientPlan = {
  diagnosis: { label: 'Overweight', icd10: 'E66.3' },
  conditions: {
    hypertension: true,
    type2Diabetes: true,
    cardiovascularDisease: false,
    heartFailure: false,
  },
  takesMedication: true,
  // Drives which mobility-level task template applies (see
  // MOBILITY_TASK_TEMPLATES) — independent/limited/assisted, same three
  // tiers the Provider Portal uses to pick a safe default exercise set.
  mobilityLevel: 'independent',
  // Set on the nurse's intake call (the mobility check), never asked again
  // in the app — one of 'bed' | 'seated' | 'standing-beginner' |
  // 'standing-advanced'. Drives which tier of EXERCISE_VIDEO_LIBRARY shows
  // up (see exercisesForPatient) — independent of mobilityLevel above,
  // which only drives whether the daily task list includes an exercise row.
  exerciseLevel: 'standing-beginner',
  // The clinical goal in plain words for the Welcome screen — the numeric
  // target itself is the weight goal below; this is just the one-line
  // "why" for this weight-management-focused plan.
  mainGoalPlain: 'Lower your weight',
  weight: {
    baselineLbs: 214,
    baselineDate: '2026-05-10',
    goalPercent: 5,
    goalTimeframeMonths: 6,
    goalDate: '2026-11-10',
    goalLbs: 203,
  },
  // Daily calorie target shown against logged meals — null means "no
  // calorie goal assigned," in which case screens show only what was
  // logged, with no "/ goal", no progress bar, and no over-goal styling.
  calorieGoal: 2000,
  waterGoalGlasses: 8,
  // Blood-pressure safety thresholds that gate exercise (see
  // utils/bpSafety.js) — Moderate warns before a moderate-intensity video,
  // High blocks exercise for the rest of the day. Replaces the old fixed
  // 140/90 "elevated reading" threshold everywhere in the app.
  bp: {
    moderate: { sys: 160, dia: 100 },
    high: { sys: 180, dia: 110 },
  },
  // The pre-exercise safety check's questions, driven by the plan instead
  // of hardcoded — each is a yes/no question; `ifFlagged` is the answer
  // that counts as a flag, and `outcome` says what a flag does: 'pause'
  // stops exercise for the rest of the day (same notice as a severely
  // elevated BP reading), 'caution' shows a lighter "proceed carefully"
  // warning the patient can get past. The fall question is always a
  // 'pause' — there's no separate "I had a fall" button anywhere else in
  // the app; this question is the only way a fall gets recorded.
  preExerciseCheck: [
    { id: 'fall', question: 'Have you fallen since your last check-in?', ifFlagged: 'Yes', outcome: 'pause' },
    { id: 'chestPain', question: 'Are you having chest pain or tightness right now?', ifFlagged: 'Yes', outcome: 'pause' },
    { id: 'dizziness', question: 'Do you feel dizzy or lightheaded right now?', ifFlagged: 'Yes', outcome: 'caution' },
    { id: 'breath', question: 'Are you more short of breath than usual right now?', ifFlagged: 'Yes', outcome: 'caution' },
  ],
  // Goals are behaviors, not numbers — the clinical targets they serve are
  // stated once, up front (see GoalsCard), and never repeated inside the
  // behavior list itself.
  goals: {
    targets: [{ id: 'bp', label: 'Blood pressure below 130/80 mmHg' }],
    behaviors: [
      'Take your blood pressure as scheduled',
      'Check your blood glucose as scheduled',
      'Stay active most days of the week',
      'Log your meals daily',
      'Take your medications as prescribed',
    ],
  },
  // Condition-specific education videos — filtered to the patient's actual
  // conditions (plus weight-management content, relevant to every patient
  // in this program regardless of which boxes are checked) and to videos
  // that have actually been recorded; see LearnScreen.
  conditionEducation: [
    { id: 'edu-cond-bp', title: 'Understanding High Blood Pressure', condition: 'hypertension', recorded: true },
    { id: 'edu-cond-sodium', title: 'Cutting Back on Salt', condition: 'hypertension', recorded: true, tag: 'sodium' },
    { id: 'edu-cond-portion', title: 'Portion Sizes Made Simple', condition: 'weightManagement', recorded: true },
    { id: 'edu-cond-5to10', title: 'Why Losing 5 to 10% Matters', condition: 'weightManagement', recorded: true, tag: 'why5to10' },
    { id: 'edu-cond-diabetes', title: 'Managing Type 2 Diabetes', condition: 'type2Diabetes', recorded: false },
    { id: 'edu-cond-heart', title: 'Living with Heart Failure', condition: 'heartFailure', recorded: false },
  ],
};

// The standing library of general exercise-education videos — separate
// from conditionEducation (which is assigned per-condition) and from
// EXERCISE_VIDEO_LIBRARY (which is exercise to *do*, not to watch and
// learn from). All recorded; these aren't gated by the patient's plan.
// `quick: true` marks the short (~5 min) ones promoted first for the
// "Time" barrier and the "just thinking about it" readiness answer (see
// data/rules.js); `tag` marks the two added for the "Not sure where to
// start" barrier, shown first as their own "Getting Started" section.
export const EXERCISE_EDUCATION_VIDEOS = [
  { id: 'edu-ex-7', title: 'Welcome to Your Program', recorded: true, quick: true, tag: 'welcome' },
  { id: 'edu-ex-8', title: 'Your First Week Guide', recorded: true, quick: true, tag: 'firstWeek' },
  { id: 'edu-ex-1', title: 'Warming Up Safely', recorded: true, quick: true },
  { id: 'edu-ex-2', title: 'The Talk Test Explained', recorded: true },
  { id: 'edu-ex-3', title: 'Proper Form for Seated Exercises', recorded: true },
  { id: 'edu-ex-4', title: 'Cooling Down & Stretching', recorded: true },
  { id: 'edu-ex-5', title: 'Exercising with Joint Pain', recorded: true },
  { id: 'edu-ex-6', title: 'Staying Motivated', recorded: true, quick: true },
];

/** The condition-education videos relevant to this patient — matched
 * against her actual condition flags (plus weight-management, always
 * relevant in this program) and filtered to ones that have actually been
 * recorded. A condition the Provider Portal hasn't produced a video for
 * yet just doesn't show up, rather than appearing as a broken entry. */
export function conditionEducationForPatient(plan) {
  return plan.conditionEducation.filter((v) => {
    if (!v.recorded) return false;
    if (v.condition === 'weightManagement') return true;
    return !!plan.conditions[v.condition];
  });
}

/** True when this patient's plan calls for tracking blood pressure as a
 * daily task — hypertension, cardiovascular disease, or heart failure all
 * warrant it; a patient with none of those isn't asked to measure it. */
export function hasBpTask(plan) {
  return !!(plan.conditions.hypertension || plan.conditions.cardiovascularDisease || plan.conditions.heartFailure);
}

/** True when the plan's diagnosis is anywhere on the overweight/obesity
 * (E66.x) ladder — overweight and every obesity class share the same
 * onboarding block and the same "weight management" education content,
 * regardless of which exact E66 code the chart has. Not a flag in
 * `conditions` (that object is reserved for the four conditions the
 * Provider Portal tracks per-task) — this reads the diagnosis directly. */
export function hasWeightManagementCondition(plan) {
  return !!plan.diagnosis?.icd10?.startsWith('E66');
}

// The equipment the nurse can ask about at home — matched against each
// exercise's optional `equipment` list (below) to decide what's safe to
// show. Values are the ids used in that `equipment` list; labels are what
// the onboarding question's options show (see data/onboardingQuestions.js).
export const EQUIPMENT_OPTIONS = [
  { id: 'resistance-band', label: 'Resistance bands' },
  { id: 'dumbbells', label: 'Light dumbbells (1-3 lb)' },
  { id: 'ball', label: 'Small ball' },
  { id: 'step-box', label: 'Step box or sturdy step' },
];

// Fixed weekday schedule for the exercises the clinical team wants on
// specific days rather than every day (0=Sun…6=Sat) — squats and standing
// balance work aren't meant to be done daily.
const SQUAT_DAYS = [2, 4]; // Tue, Thu
const BALANCE_DAYS = [1, 3, 5]; // Mon, Wed, Fri
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

// Full library of exercise videos this patient could be assigned, each
// scheduled for specific days of the week — a real build would pull this
// from the Provider Portal's assigned routine. Intensity drives the
// blood-pressure safety check (see utils/bpSafety.js): "low" videos are
// always safe to do; "moderate" ones are gated behind a recent,
// non-elevated BP reading for patients who have the BP task.
//
// Two kinds of video, per the Provider Portal's plan:
//  - "workout": a multi-exercise session the patient plays start to finish,
//    like before — no dose, no sets.
//  - "exercise": a single short movement with a prescribed dose
//    ({ amount, unit: 'reps' | 'sec' | 'min', sets }) — the card shows the
//    dose, the player shows a set counter + rest between sets, and it's
//    marked done once every set is done (see useAppState/VideoPlayerScreen).
//
// Every exercise also carries:
//  - `focus`: 'upper-body' | 'lower-body' | 'full-body' | 'cardio' |
//    'balance' | 'mobility' — informational, keeps the plan readable.
//  - `levels`: which of the patient's exercise levels (set by the nurse's
//    mobility check, see patientPlan.exerciseLevel) this is safe for —
//    'bed' | 'seated' | 'standing-beginner' | 'standing-advanced'.
//  - `equipment` (optional): ids from EQUIPMENT_OPTIONS this exercise
//    needs. Omitted (or empty) means no equipment required. An exercise
//    whose equipment the patient doesn't have at home is hidden entirely
//    (see exercisesForPatient) — exercises with no equipment always stay.
export const EXERCISE_VIDEO_LIBRARY = [
  { id: 452, kind: 'workout', title: 'Full Body Strength Workout', duration: '18 min', icon: 'dumbbell', intensity: 'moderate', focus: 'full-body', levels: ['standing-beginner', 'standing-advanced'], days: EVERY_DAY },
  { id: 473, kind: 'exercise', title: 'Sit-to-Stand', icon: 'person-standing', intensity: 'moderate', focus: 'lower-body', levels: ['seated', 'standing-beginner', 'standing-advanced'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: EVERY_DAY },
  { id: 372, kind: 'exercise', title: 'Wall Sit', icon: 'dumbbell', intensity: 'moderate', focus: 'lower-body', levels: ['standing-beginner', 'standing-advanced'], dose: { amount: 30, unit: 'sec', sets: 2 }, days: EVERY_DAY },
  { id: 413, kind: 'exercise', title: 'March in Place', icon: 'footprints', intensity: 'low', focus: 'cardio', levels: ['standing-beginner', 'standing-advanced'], dose: { amount: 2, unit: 'min', sets: 3 }, days: EVERY_DAY },

  // Bed level — hands, neck, upper body, and a light-dumbbell option.
  { id: 501, kind: 'exercise', title: 'Hand and Finger Stretches', icon: 'activity', intensity: 'low', focus: 'mobility', levels: ['bed'], dose: { amount: 10, unit: 'reps', sets: 1 }, days: EVERY_DAY },
  { id: 502, kind: 'exercise', title: 'Gentle Neck Stretches', icon: 'activity', intensity: 'low', focus: 'mobility', levels: ['bed'], dose: { amount: 10, unit: 'reps', sets: 1 }, days: EVERY_DAY },
  { id: 503, kind: 'exercise', title: 'In-Bed Arm Circles', icon: 'dumbbell', intensity: 'low', focus: 'upper-body', levels: ['bed'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: EVERY_DAY },
  { id: 504, kind: 'exercise', title: 'In-Bed Light Dumbbell Curls', icon: 'dumbbell', intensity: 'low', focus: 'upper-body', levels: ['bed'], equipment: ['dumbbells'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: EVERY_DAY },

  // Seated level — side-lying, mini-band, seated upper-body strength, and a
  // seated balance exercise (fixed days, like standing balance work below).
  { id: 505, kind: 'exercise', title: 'Side-Lying Leg Lifts', icon: 'footprints', intensity: 'low', focus: 'lower-body', levels: ['seated'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: EVERY_DAY },
  { id: 506, kind: 'exercise', title: 'Seated Mini-Band Leg Press', icon: 'footprints', intensity: 'low', focus: 'lower-body', levels: ['seated'], equipment: ['resistance-band'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: EVERY_DAY },
  { id: 507, kind: 'exercise', title: 'Seated Upper-Body Strength', icon: 'dumbbell', intensity: 'low', focus: 'upper-body', levels: ['seated'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: EVERY_DAY },
  { id: 508, kind: 'exercise', title: 'Seated Balance Exercise', icon: 'person-standing', intensity: 'low', focus: 'balance', levels: ['seated'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: BALANCE_DAYS },

  // Higher (standing) levels — wall push-up, wall bird dog, weight shift at
  // the beginner tier; squat with chair touch and tandem stance (fixed
  // days) at the advanced tier.
  { id: 509, kind: 'exercise', title: 'Wall Push-Up', icon: 'dumbbell', intensity: 'moderate', focus: 'upper-body', levels: ['standing-beginner', 'standing-advanced'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: EVERY_DAY },
  { id: 510, kind: 'exercise', title: 'Wall Bird Dog', icon: 'person-standing', intensity: 'moderate', focus: 'balance', levels: ['standing-beginner', 'standing-advanced'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: EVERY_DAY },
  { id: 511, kind: 'exercise', title: 'Weight Shift', icon: 'person-standing', intensity: 'low', focus: 'balance', levels: ['standing-beginner', 'standing-advanced'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: EVERY_DAY },
  { id: 512, kind: 'exercise', title: 'Squat with Chair Touch', icon: 'dumbbell', intensity: 'moderate', focus: 'lower-body', levels: ['standing-advanced'], dose: { amount: 10, unit: 'reps', sets: 2 }, days: SQUAT_DAYS },
  { id: 513, kind: 'exercise', title: 'Tandem Stance', icon: 'person-standing', intensity: 'low', focus: 'balance', levels: ['standing-advanced'], dose: { amount: 30, unit: 'sec', sets: 2 }, days: BALANCE_DAYS },
];

/** Today's assigned videos — the library filtered to today's weekday, the
 * patient's exercise level (set by the nurse's mobility check), and the
 * equipment she actually has at home (so an exercise that needs a
 * resistance band or dumbbells just doesn't appear if she doesn't have
 * one) — then freshly unwatched. Called once per day by defaultDay(), and
 * again right after onboarding submits (now that equipment is known). */
export function exercisesForPatient(plan, equipmentOwned = [], date = new Date()) {
  const weekday = date.getDay();
  const owned = new Set(equipmentOwned);
  return EXERCISE_VIDEO_LIBRARY.filter((v) => {
    if (!v.days.includes(weekday)) return false;
    if (v.levels && !v.levels.includes(plan.exerciseLevel)) return false;
    if (v.equipment && v.equipment.length > 0 && !v.equipment.every((e) => owned.has(e))) return false;
    return true;
  }).map((v) => ({
    ...v,
    checked: false,
    // Single exercises track sets completed so far; full workouts don't
    // use this (they're marked done by playing straight through once).
    ...(v.kind === 'exercise' ? { setsDone: 0 } : {}),
  }));
}

// The schedule varies by weekday (some days have more videos than others),
// so there's no single "videos per day" goal anymore — this is the weekly
// average, used only for Progress's historical sample days and period
// totals (today's actual goal uses the live `day.videos.length` instead).
export const VIDEOS_PER_DAY = Math.round(EXERCISE_VIDEO_LIBRARY.reduce((sum, v) => sum + v.days.length, 0) / 7);

export const logEntries = [
  { label: 'Blood Pressure', when: 'Today, 8:02 AM', value: '120/80' },
  { label: 'Weight', when: 'Today, 7:45 AM', value: '172.4 lbs' },
  { label: 'Blood Pressure', when: 'Yesterday, 8:10 AM', value: '124/82' },
  { label: 'Weight', when: 'Yesterday, 7:50 AM', value: '173.1 lbs' },
];

export const careTeamPhone = { display: '(352) 555-0134', tel: '+13525550134' };

// Static patient/account info backing the Profile screen — a real build
// would pull this from the same patient record the RPM device data comes
// from, not sample data, but the shape mirrors what that API returns.
export const patientProfile = {
  fullName: 'Dorothy Chen',
  dob: 'March 12, 1952',
  patientId: 'VH-284051',
  heightIn: 73,
  conditions: ['Type 2 Diabetes', 'Hypertension'],
  careTeam: {
    name: 'Dr. Amara Okafor',
    role: 'Primary Care Coordinator',
    phone: careTeamPhone.display,
    phoneTel: careTeamPhone.tel,
  },
  devices: [
    { id: 'bp-cuff', label: 'Blood Pressure Monitor', icon: 'activity', connected: true },
    { id: 'scale', label: 'Smart Scale', icon: 'scale', connected: true },
    { id: 'glucometer', label: 'Glucose Meter', icon: 'droplets', connected: false },
  ],
};

// Every task's static details (which screen it opens, the label shown in
// each possible state) — shared between the Home checklist and the
// reminder modal. Water's title stays unit-agnostic ("Drink Water") since
// the actual goal amount is shown in the row's sub-text, formatted in
// whichever unit the patient prefers (see WaterSlider / waterUnit).
export const TASK_DEFS = {
  weight: { id: 'weight', screen: 'weight', label: 'Measure Weight', icon: 'scale', doneSub: 'Completed', notDoneSub: 'Not logged yet' },
  bp: { id: 'bp', screen: 'bp', label: 'Take Blood Pressure', icon: 'activity', doneSub: 'Completed', notDoneSub: 'Not started yet' },
  glucose: { id: 'glucose', screen: 'glucose', label: 'Check Blood Glucose', icon: 'droplets', doneSub: 'Completed', notDoneSub: 'Not started yet' },
  meds: { id: 'meds', screen: 'meds', label: 'Take Medications', icon: 'pill', doneSub: 'Completed', notDoneSub: 'Not taken yet' },
  exercise: { id: 'exercise', screen: 'exercise', label: 'Do Your Exercises', icon: 'dumbbell', doneSub: 'Completed' },
  water: { id: 'water', screen: 'water', label: 'Drink Water', icon: 'droplet', doneSub: 'Completed' },
  meals: { id: 'meals', screen: 'nutrition', label: 'Log Your Meal', icon: 'utensils', doneSub: 'Completed' },
};

export const TASK_LABELS = Object.fromEntries(Object.values(TASK_DEFS).map((t) => [t.id, t.label]));

// Tasks every patient gets, regardless of conditions — a single
// 'any'-time-of-day slot each, same as before.
const BASE_TASK_TEMPLATES = [
  { id: 'weight', timesOfDay: ['any'] },
  { id: 'water', timesOfDay: ['any'] },
  { id: 'meals', timesOfDay: ['any'] },
];

// One task-template list per condition the Provider Portal can flag on a
// patient's plan. More than one condition can assign the same task id
// (hypertension and heart failure both want blood pressure tracked) — see
// buildDailyTasks, which unions their timesOfDay instead of duplicating
// the row.
export const CONDITION_TASK_TEMPLATES = {
  hypertension: [{ id: 'bp', timesOfDay: ['morning', 'evening'] }],
  cardiovascularDisease: [{ id: 'bp', timesOfDay: ['morning', 'evening'] }],
  heartFailure: [{ id: 'bp', timesOfDay: ['morning', 'evening'] }],
  type2Diabetes: [{ id: 'glucose', timesOfDay: ['morning', 'evening'] }],
};

// One task-template list per mobility level — all three currently just
// assign the exercise task (only on a day that actually has videos
// assigned), with the Home label itself adapting to the level (see
// buildDailyTasks).
export const MOBILITY_TASK_TEMPLATES = {
  independent: [{ id: 'exercise', timesOfDay: ['any'] }],
  limited: [{ id: 'exercise', timesOfDay: ['any'] }],
  assisted: [{ id: 'exercise', timesOfDay: ['any'], label: 'Do your gentle mobility exercises' }],
};

/** Builds today's task list as the union of the patient's base tasks,
 * every condition template she matches, and her mobility-level template —
 * deduplicated by task id, so a task two different sources both assign
 * (e.g. blood pressure, from both hypertension and heart failure) becomes
 * ONE row whose timesOfDay is the union of every source that assigned it,
 * not two separate rows. Returned in display order. */
export function buildDailyTasks(plan, videosToday) {
  const templates = [...BASE_TASK_TEMPLATES];
  for (const condition of Object.keys(plan.conditions)) {
    if (plan.conditions[condition] && CONDITION_TASK_TEMPLATES[condition]) {
      templates.push(...CONDITION_TASK_TEMPLATES[condition]);
    }
  }
  if (plan.takesMedication) templates.push({ id: 'meds', timesOfDay: ['morning'] });
  if (videosToday > 0) templates.push(...(MOBILITY_TASK_TEMPLATES[plan.mobilityLevel] || []));

  const byId = new Map();
  for (const t of templates) {
    const existing = byId.get(t.id);
    if (existing) existing.timesOfDay = Array.from(new Set([...existing.timesOfDay, ...t.timesOfDay]));
    else byId.set(t.id, { ...TASK_DEFS[t.id], ...t, timesOfDay: [...t.timesOfDay] });
  }

  const order = ['weight', 'bp', 'glucose', 'meds', 'exercise', 'water', 'meals'];
  return order.filter((id) => byId.has(id)).map((id) => byId.get(id));
}

/** The right time slot for a task being completed right now — single-slot
 * tasks (weight, water, meals, exercise, meds) always use their one slot;
 * twice-daily tasks (blood pressure, glucose) split on the wall clock so
 * logging in the morning and logging again that evening land in different
 * slots instead of overwriting each other. */
/** "10 reps × 2 sets" / "30 sec × 2 sets" / "2 min × 3 sets" — the dose
 * text shown on a single exercise's card and in its player. */
export function formatDose(dose) {
  return `${dose.amount} ${dose.unit} × ${dose.sets} sets`;
}

export function currentTimeSlot(timesOfDay) {
  if (timesOfDay.length <= 1) return timesOfDay[0];
  return new Date().getHours() < 14 ? 'morning' : 'evening';
}

/** A task only counts as fully done once every time-of-day slot it has
 * today is done — a blood-pressure task with only its morning reading
 * taken still has something left to do (the evening one). */
export function isTaskFullyDone(slots) {
  return Object.values(slots).every(Boolean);
}

const SLOT_LABELS = { morning: 'Morning', evening: 'Evening', any: '' };

/** "Morning ✓ · Evening ○" for a twice-daily task — the Home checklist's
 * one-row-two-checks display for a task like blood pressure or glucose
 * that two different condition templates both assigned. */
export function formatSlotStatus(timesOfDay, slots) {
  return timesOfDay.map((slot) => `${SLOT_LABELS[slot]} ${slots[slot] ? '✓' : '○'}`.trim()).join(' · ');
}

// Morning dose, matches what TaskMeds used to show as one plain description
// string — now each medication is its own row the patient can mark taken
// individually, or all at once.
export const MEDICATIONS = [
  { id: 'metformin', name: 'Metformin', dose: '500mg', time: 'Morning dose' },
  { id: 'lisinopril', name: 'Lisinopril', dose: '10mg', time: 'Morning dose' },
];

// The weekly patient check-in — short enough to fill out in under a minute,
// covering the kind of thing a care team actually wants to hear about
// between visits. Answers are sent to the care team as a single submission,
// not scored or graded here (a real build would forward these to whatever
// triages patient-reported outcomes).
export const SURVEY_QUESTIONS = [
  { id: 'mood', type: 'choice', question: 'How are you feeling today, overall?', options: ['Great', 'Good', 'Okay', 'Not great', 'Poor'] },
  {
    id: 'symptoms',
    type: 'multiselect',
    question: 'Are you experiencing any of these today?',
    options: ['Dizziness', 'Fatigue', 'Shortness of breath', 'Swelling', 'Chest pain'],
    noneOption: 'None of these',
  },
  { id: 'energy', type: 'scale', question: 'How would you rate your energy level?', min: 1, max: 5, minLabel: 'Very low', maxLabel: 'Very high' },
  { id: 'meds', type: 'choice', question: 'Did you take your medications as prescribed today?', options: ['Yes', 'No', 'Partially'] },
  { id: 'pain', type: 'choice', question: 'Are you in any pain right now?', options: ['Yes', 'No'] },
  { id: 'notes', type: 'text', question: "Anything else you'd like your care team to know?", optional: true },
];

// Onboarding's question *content* now lives in data/onboardingQuestions.js
// (see buildOnboardingSteps) — the nurse's intake call already covers
// goals, diagnoses, mobility, falls, pain and medications, so the app
// itself only asks the handful of low-risk preference questions the care
// team doesn't already have (see the ONBOARDING.md prompt this replaced).

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

// The nutrition team's meal plan for the period — what each meal is
// supposed to be. The patient can eat exactly this (one tap logs it) or
// log something else entirely; Nutrition shows both against the plan.
export const MEAL_PLAN = {
  breakfast: [
    { name: 'Oatmeal with Berries', calories: 220 },
    { name: 'Scrambled Eggs & Toast', calories: 280 },
  ],
  lunch: [
    { name: 'Grilled Chicken Salad', calories: 380 },
    { name: 'Turkey Sandwich on Whole Wheat', calories: 350 },
  ],
  dinner: [
    { name: 'Baked Salmon with Vegetables', calories: 420 },
    { name: 'Chicken Stir-Fry with Brown Rice', calories: 450 },
  ],
  snack: [
    { name: 'Greek Yogurt with Nuts', calories: 180 },
    { name: 'Apple with Peanut Butter', calories: 200 },
  ],
};

/** Weekday-abbreviation labels for the 7-day window ending today, so Progress
 * charts read correctly no matter what day this is actually opened on. */
export function weekDayLabels() {
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString([], { weekday: 'short' }));
  }
  return labels;
}
