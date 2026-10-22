import Icon from './Icon';
import IconButton from './IconButton';

export default function TodoRow({ icon, label, sub, done, reminderSet, onClick, onSetReminder }) {
  return (
    <div
      onClick={onClick}
      role="checkbox"
      aria-checked={done}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 16,
        minHeight: 88,
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: done ? 'var(--success-subtle)' : 'var(--sand-50)',
        }}
      >
        <Icon name={icon} size={24} color={done ? 'var(--success)' : 'var(--teal-600)'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '700 1.0625rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{label}</div>
        <div style={{ font: '500 1rem/1.3 var(--font-sans)', color: done ? 'var(--success)' : 'var(--text-muted)' }}>{sub}</div>
      </div>
      <IconButton
        variant="ghost"
        size="sm"
        label={`Set reminder for ${label}`}
        title="Set reminder"
        onClick={(e) => {
          e.stopPropagation();
          onSetReminder();
        }}
        style={reminderSet ? { background: 'var(--gold-100)', borderColor: 'transparent' } : { border: 'none' }}
      >
        <Icon name="bell" color={reminderSet ? 'var(--teal-600)' : 'var(--gray-500)'} />
      </IconButton>
    </div>
  );
}
