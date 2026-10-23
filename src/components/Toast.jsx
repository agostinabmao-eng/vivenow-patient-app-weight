import Icon from './Icon';

/** A transient confirmation pill after an inline save (Weight/BP/Walk on
 * Home) — green so it reads as a success, not an alert. Renders nothing
 * when there's no message, so callers can mount it unconditionally. */
export default function Toast({ message, bottom = 120 }) {
  if (!message) return null;
  return (
    <div
      role="status"
      style={{
        position: 'absolute',
        left: '50%',
        bottom,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#17794a',
        color: '#fff',
        borderRadius: 'var(--radius-pill)',
        padding: '16px 22px',
        width: 'max-content',
        maxWidth: 'calc(100% - 32px)',
        textAlign: 'left',
        boxShadow: 'var(--shadow-lg)',
        font: '600 1.0625rem/1.35 var(--font-sans)',
        zIndex: 10,
      }}
    >
      <Icon name="check" size={18} color="#fff" strokeWidth={3} />
      <span>{message}</span>
    </div>
  );
}
