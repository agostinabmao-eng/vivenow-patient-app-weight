import { hasWeightManagementCondition } from './sampleData';

// Step 2 of onboarding, per the care team's redesign: the nurse's intake
// call (step 1, outside the app) already covers goals, diagnoses, the
// mobility check, falls, pain, injuries, assistive devices and food
// allergies — none of that is asked again here. These are the low-risk
// preference questions the care team doesn't already have, used only to
// personalize (see data/rules.js), never to gate anything clinical.

// Shared with every patient, regardless of condition — always asked in
// this order. `images` (equipment/activities only) maps an option's label
// to an OptionImage id; `tip` (outcomes only) is a short encouragement
// shown under the question, not itself a field to answer.
export const SHARED_ONBOARDING_QUESTIONS = [
  {
    id: 'equipment',
    type: 'multiselect',
    question: 'Do you have any equipment?',
    options: ['Resistance bands', 'Light dumbbells (1-3 lb)', 'Small ball', 'Step box or sturdy step'],
    images: {
      'Resistance bands': 'resistance-band',
      'Light dumbbells (1-3 lb)': 'dumbbells',
      'Small ball': 'ball',
      'Step box or sturdy step': 'step-box',
    },
    noneOption: 'None',
    otherOption: 'Other',
    otherPlaceholder: 'Tell us what you have…',
  },
  {
    id: 'activities',
    type: 'multiselect',
    question: 'Which activities would you enjoy?',
    options: ['Walking', 'Swimming', 'Biking', 'Dancing', 'Seated exercises', 'Strength exercises'],
    images: {
      Walking: 'walking',
      Swimming: 'swimming',
      Biking: 'biking',
      Dancing: 'dancing',
      'Seated exercises': 'seated-exercise',
      'Strength exercises': 'strength-exercise',
    },
    otherOption: 'Other',
  },
  {
    id: 'readingsTime',
    type: 'multiselect',
    question: 'When do you prefer to weigh yourself?',
    options: ['Morning', 'Afternoon', 'Evening'],
  },
  {
    id: 'exerciseTime',
    type: 'multiselect',
    question: 'When do you prefer to exercise?',
    options: ['Morning', 'Afternoon', 'Evening'],
  },
  {
    id: 'outcomes',
    type: 'multiselect',
    question: 'What would you like to achieve with the care plan?',
    options: ['Have more energy', 'Have less stress', 'Sleep better', 'Feel more confident', 'Have more mobility', 'Feel stronger', 'Live more independently'],
    otherOption: 'Other',
    otherPlaceholder: 'e.g., be able to pick up my grandkids in my arms',
    tip: 'Try to make it personal — write something that resonates with you and motivates you to keep trying, day by day.',
  },
  {
    id: 'barriers',
    type: 'multiselect',
    question: 'What do you find more challenging when trying to lose weight?',
    options: ['Time', 'Motivation', 'Cost', 'Not sure where to start'],
  },
];

// One short block per condition the Provider Portal can flag on a
// patient's plan — only asked for conditions this patient actually has
// (see buildOnboardingSteps). `weightManagement` isn't a key in
// patientPlan.conditions (that object is the four Portal-tracked
// conditions); it's matched separately via hasWeightManagementCondition,
// since overweight and every obesity class share this one block.
// hypertension and type2Diabetes have no block of their own anymore —
// their old questions (preferred reading time, salty food, meal times)
// were either folded into the shared readingsTime question above or
// dropped as duplicative.
export const CONDITION_ONBOARDING_BLOCKS = {
  weightManagement: [
    {
      id: 'eatingBarrier',
      type: 'multiselect',
      question: 'What do you find more challenging when trying to improve your eating habits?',
      options: ['Evening snacks', 'Stress eating', 'Social events', 'Control portion sizes'],
    },
  ],
};

// Condition blocks are assembled in this fixed order — only the ones the
// patient actually matches are included (see buildOnboardingSteps).
const CONDITION_BLOCK_ORDER = ['weightManagement'];

/** Every onboarding question this patient sees, in order: the shared
 * questions first, then one short block per condition she matches —
 * merged so a question id that more than one block might ask is only
 * ever asked once. */
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
