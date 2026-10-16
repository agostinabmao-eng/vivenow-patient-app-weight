export const LBS_PER_KG = 2.20462;

/** Weight is always stored in lbs (the vitals device's native unit) —
 * these only convert at the display/entry boundary, keyed by the
 * patient's weightUnit preference (see useAppState / Profile). */
export function formatWeight(lbs, unit, decimals = 1) {
  const value = unit === 'kg' ? lbs / LBS_PER_KG : lbs;
  return `${value.toFixed(decimals)} ${unit}`;
}

export function weightFromLbs(lbs, unit) {
  return unit === 'kg' ? lbs / LBS_PER_KG : lbs;
}

export function weightToLbs(value, unit) {
  return unit === 'kg' ? value * LBS_PER_KG : value;
}
