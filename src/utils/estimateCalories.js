// A small on-device keyword → calorie table, standing in for a real food
// database — good enough to make the "calories are calculated automatically
// as you go" promise feel real for common foods, not meant to be accurate
// nutrition data. Keys are matched as whole words against the logged text.
const FOOD_TABLE = [
  { keyword: 'egg', label: 'Eggs', calories: 90 },
  { keyword: 'eggs', label: 'Eggs', calories: 90 },
  { keyword: 'toast', label: 'Toast', calories: 80 },
  { keyword: 'bread', label: 'Bread', calories: 80 },
  { keyword: 'oatmeal', label: 'Oatmeal', calories: 150 },
  { keyword: 'cereal', label: 'Cereal', calories: 140 },
  { keyword: 'bacon', label: 'Bacon', calories: 110 },
  { keyword: 'sausage', label: 'Sausage', calories: 150 },
  { keyword: 'yogurt', label: 'Yogurt', calories: 120 },
  { keyword: 'berries', label: 'Berries', calories: 50 },
  { keyword: 'banana', label: 'Banana', calories: 105 },
  { keyword: 'apple', label: 'Apple', calories: 95 },
  { keyword: 'orange', label: 'Orange', calories: 65 },
  { keyword: 'coffee', label: 'Coffee', calories: 5 },
  { keyword: 'juice', label: 'Juice', calories: 110 },
  { keyword: 'milk', label: 'Milk', calories: 100 },
  { keyword: 'chicken', label: 'Chicken', calories: 220 },
  { keyword: 'salmon', label: 'Salmon', calories: 230 },
  { keyword: 'fish', label: 'Fish', calories: 200 },
  { keyword: 'turkey', label: 'Turkey', calories: 180 },
  { keyword: 'salad', label: 'Salad', calories: 150 },
  { keyword: 'sandwich', label: 'Sandwich', calories: 320 },
  { keyword: 'rice', label: 'Rice', calories: 200 },
  { keyword: 'pasta', label: 'Pasta', calories: 220 },
  { keyword: 'soup', label: 'Soup', calories: 160 },
  { keyword: 'vegetables', label: 'Vegetables', calories: 60 },
  { keyword: 'potato', label: 'Potato', calories: 160 },
  { keyword: 'nuts', label: 'Nuts', calories: 170 },
  { keyword: 'cheese', label: 'Cheese', calories: 110 },
  { keyword: 'peanut', label: 'Peanut butter', calories: 190 },
  { keyword: 'pizza', label: 'Pizza', calories: 280 },
  { keyword: 'burger', label: 'Burger', calories: 350 },
  { keyword: 'cookie', label: 'Cookie', calories: 150 },
];

// A typical-meal fallback when nothing in the table matched anything in the
// logged text — keeps the diary from showing 0 kcal for a real meal just
// because the patient described it in unfamiliar words.
const FALLBACK_BY_MEAL = { breakfast: 350, lunch: 450, dinner: 550, snack: 180 };

export function estimateMealCalories(text, mealType) {
  const lower = (text || '').toLowerCase();
  const seen = new Set();
  const matches = [];
  for (const food of FOOD_TABLE) {
    if (seen.has(food.label)) continue;
    const re = new RegExp(`\\b${food.keyword}\\b`, 'i');
    if (re.test(lower)) {
      matches.push({ label: food.label, calories: food.calories });
      seen.add(food.label);
    }
  }

  if (matches.length === 0) {
    return { total: FALLBACK_BY_MEAL[mealType] ?? 350, isFallback: true, matches: [] };
  }
  const total = matches.reduce((sum, m) => sum + m.calories, 0);
  return { total, isFallback: false, matches };
}
