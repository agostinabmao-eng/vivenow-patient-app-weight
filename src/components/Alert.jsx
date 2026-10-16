import Icon from './Icon';

const TONES = {
  warning: { bg: 'var(--warning-subtle)', border: 'var(--warning)', icon: 'alert-triangle', iconColor: 'var(--warning)' },
  danger: { bg: 'var(--danger-subtle)', border: 'var(--danger)', icon: 'alert-triangle', iconColor: 'var(--danger)' },
  info: { bg: 'var(--info-subtle)', border: 'var(--info)', icon: 'wifi-off', iconColor: 'var(--teal-600)' },
};

/** An inline banner (offline notice, etc) — icon + title + body, tinted by
 * tone rather than relying on color alone to carry meaning. */
export default function Alert({ tone = 'info', title, children }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 'var(--radius-md)',
        padding: 12,
      }}
    >
      <Icon name={t.icon} size={18} color={t.iconColor} style={{ marginTop: 1 }} />
      <div>
        <div style={{ font: '700 0.84375rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{title}</div>
        <div style={{ font: '400 0.8125rem/1.4 var(--font-sans)', color: 'var(--text-body)', marginTop: 2 }}>{children}</div>
      </div>
    </div>
  );
}
