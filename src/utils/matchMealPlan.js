function words(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Tries to reconcile a patient's freeform meal-log text against the care
 * team's static meal plan for that meal — if what she typed shares enough
 * words with a prescribed item ("eggs and toast" vs "Scrambled Eggs &
 * Toast"), the diary treats it as that plan item instead of an off-plan
 * entry. Returns the matching plan item, or null when nothing clears the
 * bar. Pure word-overlap, no fuzzy spelling — good enough for a short meal
 * description, not meant to be a real NLP matcher. */
export function matchMealPlan(text, planItems) {
  if (!text || !planItems?.length) return null;
  const inputWords = new Set(words(text));
  if (inputWords.size === 0) return null;

  let best = null;
  let bestScore = 0;
  for (const item of planItems) {
    const itemWords = words(item.name);
    const overlap = itemWords.filter((w) => inputWords.has(w)).length;
    const score = overlap / itemWords.length;
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return bestScore >= 0.5 ? best : null;
}
