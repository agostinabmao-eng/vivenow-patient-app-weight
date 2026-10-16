import Icon from './Icon';
import BackIconButton from './BackIconButton';

/** Shared chrome for the single-value task screens (Measure Blood Pressure,
 * Weight, Steps, Glucose, Water, Medications) — a back icon-button + icon
 * badge + title + description up top, scrollable content in the middle, and
 * a footer (almost always a single primary Save button) pinned to the
 * bottom above the safe area. */
export default function TaskScreenShell({ icon, title, description, onBack, footer, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 12px 0' }}>
        <BackIconButton onClick={onBack} />
      </div>
      <div
        className="vh-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
      >
        {icon && (
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
            <Icon name={icon} size={26} color="var(--teal-600)" />
          </div>
        )}
        <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)', marginTop: 14 }}>{title}</div>
        {description && <div style={{ font: '400 0.875rem/1.5 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6, maxWidth: 320 }}>{description}</div>}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</div>
      </div>
      {footer && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: `0 calc(24px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(24px + var(--safe-left))`,
            flexShrink: 0,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
