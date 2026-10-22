import { useState } from 'react';
import Icon from './Icon';
import OptionImage from './OptionImage';

/** Whether a question has been answered well enough to move on — optional
 * questions always pass; required ones check the shape appropriate to
 * their type (a non-empty string for choice/text, a non-empty array for
 * multiselect, a number for scale). */
export function isAnswered(step, value) {
  if (step.optional) return true;
  if (step.type === 'multiselect') return Array.isArray(value) && value.length > 0;
  if (step.type === 'scale') return typeof value === 'number';
  if (step.type === 'meal-pattern' || step.type === 'body-map') return true;
  return value != null && value !== '';
}

// Full-width, one option per line — easier to scan and tap reliably than a
// wrapped row of pills, especially for longer option text. The check mark
// (when selected) sits at the far right, auto-spaced from the label by
// justify-content — label (+ optional image) stays grouped at the left.
const optionButtonStyle = (active) => ({
  width: '100%',
  boxSizing: 'border-box',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '18px 20px',
  minHeight: 76,
  borderRadius: 'var(--radius-lg)',
  boxShadow: active ? 'none' : 'var(--shadow-xs)',
  border: `2px solid ${active ? 'var(--teal-600)' : 'var(--border-default)'}`,
  background: active ? 'var(--teal-50)' : '#fff',
  color: active ? 'var(--teal-700)' : 'var(--ink)',
  font: '600 1.0625rem/1.3 var(--font-sans)',
  cursor: 'pointer',
});

function OptionLabel({ opt, image }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      {image && <OptionImage id={image} />}
      <span>{opt}</span>
    </span>
  );
}

export function ChoiceQuestion({ options, images, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} aria-pressed={active} style={optionButtonStyle(active)}>
            <OptionLabel opt={opt} image={images?.[opt]} />
            {active && <Icon name="check" size={20} color="var(--teal-600)" style={{ flexShrink: 0 }} />}
          </button>
        );
      })}
    </div>
  );
}

export function MultiSelectQuestion({ options, images, noneOption, otherOption, otherPlaceholder, layout, value, onChange }) {
  const selected = Array.isArray(value) ? value : [];
  const [otherText, setOtherText] = useState(selected.find((v) => v.startsWith?.('Something else:'))?.slice(16) || '');
  const otherSelected = selected.some((v) => v === otherOption || v.startsWith?.('Something else:'));

  const toggle = (opt) => {
    if (opt === noneOption) {
      onChange(selected.includes(noneOption) ? [] : [noneOption]);
      return;
    }
    const withoutNone = selected.filter((v) => v !== noneOption);
    if (selected.includes(opt)) onChange(withoutNone.filter((v) => v !== opt));
    else onChange([...withoutNone, opt]);
  };

  const toggleOther = () => {
    if (otherSelected) {
      onChange(selected.filter((v) => v !== otherOption && !v.startsWith?.('Something else:')));
    } else {
      onChange([...selected.filter((v) => v !== noneOption), otherOption]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: layout === 'list' ? 'column' : 'row', flexWrap: layout === 'list' ? undefined : 'wrap', gap: 10, marginTop: 20 }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button key={opt} onClick={() => toggle(opt)} aria-pressed={active} style={optionButtonStyle(active)}>
            <OptionLabel opt={opt} image={images?.[opt]} />
            {active && <Icon name="check" size={20} color="var(--teal-600)" style={{ flexShrink: 0 }} />}
          </button>
        );
      })}
      {otherOption && (
        // Full width, like every other option — a plain sibling in the
        // same flex flow rather than its own column-flex wrapper, which
        // used to shrink both this button and the input below the
        // minimum-content width of the row instead of filling it.
        <>
          <button onClick={toggleOther} aria-pressed={otherSelected} style={{ ...optionButtonStyle(otherSelected), width: '100%' }}>
            <OptionLabel opt={otherOption} />
            {otherSelected && <Icon name="check" size={20} color="var(--teal-600)" style={{ flexShrink: 0 }} />}
          </button>
          {otherSelected && (
            <input
              value={otherText}
              onChange={(e) => {
                setOtherText(e.target.value);
                const withoutOld = selected.filter((v) => v !== otherOption && !v.startsWith?.('Something else:'));
                onChange([...withoutOld, `Something else:${e.target.value}`]);
              }}
              placeholder={otherPlaceholder || 'Tell us more…'}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-default)',
                font: '400 1rem/1.3 var(--font-sans)',
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export function ScaleQuestion({ min = 1, max = 5, minLabel, maxLabel, value, onChange }) {
  const options = [];
  for (let i = min; i <= max; i++) options.push(i);
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        {options.map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              aria-pressed={active}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${active ? 'var(--teal-500)' : 'var(--border-default)'}`,
                background: active ? 'var(--teal-500)' : '#fff',
                color: active ? '#fff' : 'var(--ink)',
                font: '700 1rem/1 var(--font-display)',
                cursor: 'pointer',
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      {(minLabel || maxLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, font: '500 1rem/1.2 var(--font-sans)', color: 'var(--text-muted)' }}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

export function TextQuestion({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Type your answer…'}
      rows={4}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        marginTop: 20,
        resize: 'vertical',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--border-default)',
        font: '400 1rem/1.5 var(--font-sans)',
        color: 'var(--ink)',
      }}
    />
  );
}
