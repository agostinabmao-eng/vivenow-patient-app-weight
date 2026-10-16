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
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: 14,
        minHeight: 56,
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: done ? 'var(--success-subtle)' : 'var(--teal-50)',
        }}
      >
        <Icon name={icon} size={18} color={done ? 'var(--success)' : 'var(--teal-600)'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 0.9375rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{label}</div>
        <div style={{ font: '400 0.78125rem/1.3 var(--font-sans)', color: done ? 'var(--success)' : 'var(--text-muted)' }}>{sub}</div>
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
        style={reminderSet ? { background: 'var(--teal-50)' } : undefined}
      >
        <Icon name="bell" color={reminderSet ? 'var(--teal-600)' : 'var(--gray-400)'} />
      </IconButton>
      <Icon name="chevron-right" size={20} color="var(--gray-400)" />
    </div>
  );
}
