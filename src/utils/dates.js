/** "2026-11-10" → "11/10/2026". Built by hand instead of toLocaleDateString
 * so the format stays numeric and short regardless of the phone's language
 * (a Spanish-locale phone otherwise gets "10 de noviembre de 2026"). */
export function formatNumericDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
