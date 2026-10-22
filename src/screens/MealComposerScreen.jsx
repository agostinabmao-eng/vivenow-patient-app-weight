import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import Button from '../components/Button';
import BackIconButton from '../components/BackIconButton';
import useSpeechToText from '../hooks/useSpeechToText';
import { estimateMealCalories } from '../utils/estimateCalories';

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

/** Meal-entry composer — its own screen (like Measure Blood Pressure or
 * Walk) rather than a sub-view nested inside the Nutrition tab, so it gets
 * the same focused, nav-bar-free chrome instead of showing the tab bar
 * underneath its own Save/Back footer. Reached from the Nutrition diary
 * (tap a meal) or straight from Home's "Log Your Meal" checklist item. */
export default function MealComposerScreen({ mealType, existingText, isEditing, onSave, onBack }) {
  const [text, setText] = useState(existingText || '');
  const { supported: voiceSupported, listening, start, stop } = useSpeechToText((transcript) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });
  const estimate = useMemo(() => estimateMealCalories(text, mealType), [text, mealType]);
  const saveDisabled = text.trim() === '';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BackIconButton onClick={onBack} />
          <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>{isEditing ? `Edit ${MEAL_LABELS[mealType]} Entry` : `Log ${MEAL_LABELS[mealType]}`}</div>
        </div>
        <div style={{ font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6 }}>
          Tell us what you ate — we&apos;ll estimate the calories.
        </div>
      </div>

      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`What did you have for ${MEAL_LABELS[mealType].toLowerCase()}? e.g. "Two eggs, toast, and coffee"`}
            rows={4}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              resize: 'vertical',
              border: '1.5px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 52px 12px 14px',
              font: '400 1rem/1.5 var(--font-sans)',
              color: 'var(--ink)',
              background: '#fff',
            }}
          />
          <button
            onClick={listening ? stop : start}
            disabled={!voiceSupported}
            aria-label={listening ? 'Stop recording' : 'Record with voice'}
            title={voiceSupported ? undefined : "Voice input isn't supported in this browser"}
            className={listening ? 'vh-mic-pulse' : undefined}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: voiceSupported ? 'pointer' : 'not-allowed',
              background: listening ? 'var(--danger)' : 'var(--teal-50)',
              opacity: voiceSupported ? 1 : 0.4,
            }}
          >
            <Icon name="mic" size={17} color={listening ? '#fff' : 'var(--teal-600)'} />
          </button>
        </div>
        {listening && <div style={{ font: '600 1rem/1.3 var(--font-sans)', color: 'var(--danger)', marginTop: -8 }}>Listening…</div>}

        <div style={{ background: 'var(--teal-50)', borderRadius: 'var(--radius-md)', padding: 14 }}>
          {text.trim() === '' ? (
            <div style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)' }}>
              Type or record what you ate — calories are calculated automatically as you go.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ font: '700 1.5rem/1 var(--font-display)', color: 'var(--ink)' }}>~{estimate.total}</span>
                <span style={{ font: '600 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>kcal estimated</span>
              </div>
              {estimate.isFallback ? (
                <div style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6 }}>
                  We didn&apos;t recognize specific foods, so this is a typical {MEAL_LABELS[mealType].toLowerCase()} estimate.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {estimate.matches.map((m, i) => (
                    <span
                      key={i}
                      style={{
                        font: '600 1rem/1 var(--font-sans)',
                        color: 'var(--teal-700)',
                        background: '#fff',
                        border: '1px solid var(--teal-200)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '5px 10px',
                      }}
                    >
                      {m.label} · {m.calories}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: `0 calc(24px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(24px + var(--safe-left))`,
          flexShrink: 0,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={saveDisabled}
          onClick={() => onSave(mealType, text.trim(), estimate.total)}
          iconLeft={<Icon name="check" size={20} />}
        >
          {isEditing ? 'OK, save changes' : `OK, log ${MEAL_LABELS[mealType].toLowerCase()}`}
        </Button>
      </div>
    </div>
  );
}
