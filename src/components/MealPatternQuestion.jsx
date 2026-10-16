import { useState } from 'react';
import { MEAL_TYPES } from '../data/sampleData';

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' };
const PRESETS = {
  breakfast: ['☕ Just coffee', '🥣 Cereal or oatmeal', '🍳 Eggs & toast', '🚫 I skip breakfast'],
  lunch: ['🥗 Salad', '🥪 Sandwich', '🍝 Leftovers', '🍔 Fast food'],
  dinner: ['🍗 Meat & vegetables', '🍝 Pasta or rice dish', '🥡 Takeout', '🍲 Soup or stew'],
  snack: ['🍎 Fruit', '🥨 Chips or crackers', '🍫 Something sweet', '🚫 I don’t usually snack'],
};

/** Grouped by meal instead of one blank text box — a tap per meal is
 * faster to answer than free text, and the resulting shape mirrors
 * MEAL_PLAN (breakfast/lunch/dinner/snack) so it's easy for the care team
 * to compare against the prescribed plan later. Each meal also takes a
 * free-text "something else" in case none of the presets fit. */
export default function MealPatternQuestion({ value, onChange }) {
  const answers = value || {};
  const [customText, setCustomText] = useState({});

  const setMeal = (meal, text) => onChange({ ...answers, [meal]: text });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
      {MEAL_TYPES.map((meal) => (
        <div key={meal}>
          <div style={{ font: '700 0.875rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{MEAL_LABELS[meal]}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            {PRESETS[meal].map((opt) => {
              const active = answers[meal] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setMeal(meal, opt)}
                  aria-pressed={active}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '14px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${active ? 'var(--teal-500)' : 'var(--border-default)'}`,
                    background: active ? 'var(--teal-50)' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ font: '24px/1 sans-serif' }}>{opt.split(' ')[0]}</span>
                  <span style={{ font: '600 0.75rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{opt.slice(opt.indexOf(' ') + 1)}</span>
                </button>
              );
            })}
          </div>
          <input
            value={customText[meal] ?? (PRESETS[meal].includes(answers[meal]) ? '' : answers[meal] || '')}
            onChange={(e) => {
              setCustomText((c) => ({ ...c, [meal]: e.target.value }));
              setMeal(meal, e.target.value);
            }}
            placeholder="Or describe it yourself…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              marginTop: 8,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-default)',
              font: '400 0.84375rem/1.3 var(--font-sans)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
