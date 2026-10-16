// Blood-pressure safety gating shared by the standalone BP task and the
// pre-exercise safety check (see useAppState's exercise-gate logic).
// "Most severe wins" when systolic and diastolic fall in different bands —
// each is checked independently against both thresholds, high first.
export function bpSeverity(reading, thresholds) {
  if (!reading) return null;
  const { sys, dia } = reading;
  if (sys >= thresholds.high.sys || dia >= thresholds.high.dia) return 'high';
  if (sys >= thresholds.moderate.sys || dia >= thresholds.moderate.dia) return 'moderate';
  return 'normal';
}

/** Only a reading taken within the last `withinHours` counts toward the
 * pre-exercise safety check — an old reading doesn't reflect how the
 * patient is doing right now. */
export function isReadingRecent(takenAt, withinHours = 24) {
  if (!takenAt) return false;
  return Date.now() - new Date(takenAt).getTime() < withinHours * 60 * 60 * 1000;
}
