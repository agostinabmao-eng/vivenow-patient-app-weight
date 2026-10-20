import { hasWeightManagementCondition } from './sampleData';

// Step 2 of onboarding, per the care team's redesign: the nurse's intake
// call (step 1, outside the app) already covers goals, diagnoses, the
// mobility check, falls, pain, injuries, assistive devices and food
// allergies — none of that is asked again here. These are the low-risk
// preference questions the care team doesn't already have, used only to
// personalize (see data/rules.js), never to gate anything clinical.

// Shared with every patient, regardless of condition — always asked in
// this order, 6 questions total.
export const SHARED_ONBOARDING_QUESTIONS = [
  {
    id: 'equipment',
    type: 'multiselect',
    question: 'Which of these do you have at home?',
    options: ['Resistance bands', 'Light dumbbells (1-3 lb)', 'Small ball', 'Step box or sturdy step'],
    noneOption: 'None of these',
  },
  {
    id: 'activities',
    type: 'multiselect',
    question: 'Which activities would you enjoy?',
    options: ['Walking', 'Swimming', 'Biking', 'Dancing', 'Chair or strength exercises'],
    otherOption: 'Other',
  },
  {
    id: 'preferredTimes',
    type: 'multiselect',
    question: 'When is it easiest for you to do your daily tasks?',
    options: ['Morning', 'Afternoon', 'Evening'],
  },
  {
    id: 'foodsToKeep',
    type: 'text',
    optional: true,
    question: 'Which foods do you enjoy and want to keep in your meals?',
  },
  {
    id: 'outcomes',
    type: 'multiselect',
    question: 'What would change for you if you reach your goals?',
    options: ['More energy', 'Less stress', 'Better sleep', 'Feeling confident', 'Time with family'],
    otherOption: 'Other',
  },
  {
    id: 'barriers',
    type: 'multiselect',
    question: 'What could get in the way?',
    options: ['Time', 'Motivation', 'Cost', 'Not sure where to start'],
  },
];

// One short block (1-3 questions) per condition the Provider Portal can
// flag on a patient's plan — only asked for conditions this patient
// actually has (see buildOnboardingSteps). `weightManagement` isn't a key
// in patientPlan.conditions (that object is the four Portal-tracked
// conditions); it's matched separately via hasWeightManagementCondition,
// since overweight and every obesity class share this one block.
export const CONDITION_ONBOARDING_BLOCKS = {
  hypertension: [
    { id: 'bpTime', type: 'choice', question: 'When is it easiest to take your readings?', options: ['Morning', 'Evening', 'Both'] },
    { id: 'saltyFood', type: 'choice', question: 'How often do you eat salty or processed food?', options: ['Rarely', 'Sometimes', 'Often'] },
  ],
  type2Diabetes: [{ id: 'mealTimes', type: 'text', question: 'What times do you usually eat your meals?' }],
  weightManagement: [
    {
      id: 'weightAttempts',
      type: 'multiselect',
      question: 'What have you tried before to manage your weight?',
      options: ['Diet', 'Exercise', 'Medication', 'A program or coach', 'Nothing yet'],
    },
    {
      id: 'eatingBarrier',
      type: 'multiselect',
      question: 'When is it hardest to follow your eating plan?',
      options: ['Evenings', 'When stressed', 'Social events', 'Skipping meals', 'Portion sizes'],
    },
    { id: 'readiness', type: 'choice', question: 'How ready do you feel to make changes?', options: ['Just thinking about it', 'Ready to start', 'Already started'] },
  ],
};

// Condition blocks are assembled in this fixed order — only the ones the
// patient actually matches are included (see buildOnboardingSteps).
const CONDITION_BLOCK_ORDER = ['hypertension', 'type2Diabetes', 'cardiovascularDisease', 'heartFailure', 'weightManagement'];

/** Every onboarding question this patient sees, in order: the 6 shared
 * questions first, then one short block per condition she matches —
 * merged so a question id that more than one block might ask (none do
 * today, but a future condition could) is only ever asked once. */
export function buildOnboardingSteps(plan) {
  const seen = new Set();
  const steps = [];
  const add = (q) => {
    if (seen.has(q.id)) return;
    seen.add(q.id);
    steps.push(q);
  };
  SHARED_ONBOARDING_QUESTIONS.forEach(add);
  for (const key of CONDITION_BLOCK_ORDER) {
    const matches = key === 'weightManagement' ? hasWeightManagementCondition(plan) : !!plan.conditions[key];
    if (matches && CONDITION_ONBOARDING_BLOCKS[key]) CONDITION_ONBOARDING_BLOCKS[key].forEach(add);
  }
  return steps;
}

/** Which block each question id belongs to ('shared' or a condition key) —
 * stored alongside the raw answers so the data sent to the Portal is
 * grouped the way the care team asked for, not just a flat id→value map
 * (see useAppState.submitOnboarding). */
export function buildQuestionBlockMap(plan) {
  const map = {};
  for (const q of SHARED_ONBOARDING_QUESTIONS) map[q.id] = 'shared';
  for (const key of CONDITION_BLOCK_ORDER) {
    const matches = key === 'weightManagement' ? hasWeightManagementCondition(plan) : !!plan.conditions[key];
    if (matches && CONDITION_ONBOARDING_BLOCKS[key]) {
      for (const q of CONDITION_ONBOARDING_BLOCKS[key]) if (!map[q.id]) map[q.id] = key;
    }
  }
  return map;
}
