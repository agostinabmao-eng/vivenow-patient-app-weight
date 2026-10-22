import Icon from './Icon';

/** A transient confirmation pill after an inline save (Weight/BP/Walk on
 * Home) — green so it reads as a success, not an alert. Renders nothing
 * when there's no message, so callers can mount it unconditionally. */
export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 120,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#17794a',
        color: '#fff',
        borderRadius: 'var(--radius-pill)',
        padding: '16px 26px',
        boxShadow: 'var(--shadow-lg)',
        font: '600 1.0625rem/1 var(--font-sans)',
        zIndex: 10,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon name="check" size={16} color="#fff" />
      {message}
    </div>
  );
}
