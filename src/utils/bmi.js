// BMI-based clinical classification used for the Profile badge — codes
// verified against the nursing team's Weight Management ICD-10 reference
// (E66.x diagnosis ladder + Z68 BMI-tracking codes). The diagnosis codes
// below assume the default "due to excess calories" etiology per class;
// the alternate E66 codes (drug-induced, other, unspecified) depend on a
// clinician's actual chart documentation and aren't inferable from BMI
// alone, so they're not auto-assigned here.
export const BMI_LEVELS = [
  { key: 'overweight', label: 'Overweight', bmiMin: 25.0, bmiMax: 29.9, icd10: 'E66.3' },
  { key: 'obesity-1', label: 'Obesity Class 1', bmiMin: 30.0, bmiMax: 34.9, icd10: 'E66.811' },
  { key: 'obesity-2', label: 'Obesity Class 2', bmiMin: 35.0, bmiMax: 39.9, icd10: 'E66.812' },
  { key: 'obesity-3', label: 'Obesity Class 3', bmiMin: 40.0, bmiMax: Infinity, icd10: 'E66.813' },
];

export function calculateBmi(weightLbs, heightIn) {
  return (weightLbs / (heightIn * heightIn)) * 703;
}

export function classifyBmi(bmi) {
  return BMI_LEVELS.find((level) => bmi >= level.bmiMin && bmi <= level.bmiMax) ?? null;
}

// Z68 BMI-tracking code — Z68.25–Z68.29 and Z68.30–Z68.39 are one code per
// whole BMI point; BMI 40+ collapses into 5 wider bands (Z68.41–Z68.45).
export function z68Code(bmi) {
  const whole = Math.floor(bmi);
  if (whole < 25) return null;
  if (whole <= 39) return `Z68.${whole}`;
  if (bmi < 45) return 'Z68.41';
  if (bmi < 50) return 'Z68.42';
  if (bmi < 60) return 'Z68.43';
  if (bmi < 70) return 'Z68.44';
  return 'Z68.45';
}
