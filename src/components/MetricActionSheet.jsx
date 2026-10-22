import Icon from './Icon';

/** A small bottom sheet opened by tapping a Today's Summary card on Home —
 * "See progress" jumps to that metric's trend on the Progress tab, "Log
 * data" opens whatever screen actually records that metric. */
export default function MetricActionSheet({ metric, onClose, onSeeProgress, onLogData }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(7,46,67,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 30 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          padding: `20px 20px calc(20px + var(--safe-bottom))`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={metric.icon} size={18} color="var(--teal-600)" />
          </div>
          <div style={{ font: '700 1rem/1.3 var(--font-display)', color: 'var(--ink)' }}>{metric.label}</div>
        </div>
        <button
          onClick={onSeeProgress}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 4px',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid var(--border-subtle)',
            font: '600 1rem/1 var(--font-sans)',
            color: 'var(--ink)',
            cursor: 'pointer',
          }}
        >
          <Icon name="trending-up" size={18} color="var(--teal-600)" />
          See progress
        </button>
        <button
          onClick={onLogData}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 4px',
            background: 'none',
            border: 'none',
            font: '600 1rem/1 var(--font-sans)',
            color: 'var(--ink)',
            cursor: 'pointer',
          }}
        >
          <Icon name="pencil" size={18} color="var(--teal-600)" />
          Log data
        </button>
      </div>
    </div>
  );
}
