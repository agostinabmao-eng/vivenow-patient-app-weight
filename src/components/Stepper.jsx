import Icon from './Icon';

function CircleButton({ label, onClick, disabled, icon }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 80,
        height: 80,
        flexShrink: 0,
        borderRadius: '50%',
        border: 'none',
        background: disabled ? 'var(--ice-100)' : 'var(--teal-600)',
        color: disabled ? 'var(--gray-500)' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : 'var(--shadow-brand)',
        transition: 'transform var(--dur-fast) var(--ease-standard)',
      }}
      onPointerDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.94)')}
      onPointerUp={(e) => (e.currentTarget.style.transform = '')}
      onPointerLeave={(e) => (e.currentTarget.style.transform = '')}
    >
      <Icon name={icon} size={30} strokeWidth={3} />
    </button>
  );
}

/** Oversized − / + adjuster around an editable number — for patients with
 * tremor or low vision who can't reliably hit a small spinner or type on a
 * tiny keyboard. `value` and `onChange` are strings (matching the app's
 * existing input state); typing a number directly still works. */
export default function Stepper({ label, value, onChange, step = 1, min = 0, max = 99999, decimals = 0, unit, placeholder, inputMode }) {
  const num = parseFloat(value);
  const current = Number.isFinite(num) ? num : null;
  const apply = (delta) => {
    const base = current ?? (Number.isFinite(parseFloat(placeholder)) ? parseFloat(placeholder) : 0);
    const next = Math.min(max, Math.max(min, base + delta));
    onChange(next.toFixed(decimals));
  };
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{ font: '600 1.0625rem/1.2 var(--font-sans)', color: 'var(--ink)', textAlign: 'center', marginBottom: 14 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <CircleButton label={`Decrease ${label || ''}`.trim()} icon="minus" onClick={() => apply(-step)} disabled={current !== null && current <= min} />
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          <input
            type="number"
            inputMode={inputMode || (decimals ? 'decimal' : 'numeric')}
            aria-label={label}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              borderBottom: '3px solid var(--teal-200)',
              borderRadius: 0,
              background: 'transparent',
              textAlign: 'center',
              font: '700 2.6rem/1.1 var(--font-display)',
              color: 'var(--ink)',
              padding: '4px 0',
              MozAppearance: 'textfield',
            }}
          />
          {unit && <div style={{ font: '600 1.0625rem/1.2 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6 }}>{unit}</div>}
        </div>
        <CircleButton label={`Increase ${label || ''}`.trim()} icon="plus" onClick={() => apply(step)} disabled={current !== null && current >= max} />
      </div>
    </div>
  );
}
