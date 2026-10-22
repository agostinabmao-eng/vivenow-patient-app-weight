import Icon from './Icon';
import BackIconButton from './BackIconButton';
import Photo from './Photo';

/** Shared chrome for the single-value task screens (Measure Blood Pressure,
 * Weight, Steps, Glucose, Water, Medications) — a back icon-button + icon
 * badge + title + description up top, scrollable content in the middle, and
 * a footer (almost always a single primary Save button) pinned to the
 * bottom above the safe area. */
export default function TaskScreenShell({ icon, photo, title, description, onBack, footer, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 16px 0' }}>
        <BackIconButton onClick={onBack} />
      </div>
      <div
        className="vh-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
      >
        {photo && <Photo name={photo} height={180} style={{ width: '100%', marginTop: 4 }} />}
        {icon && !photo && (
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--sand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
            <Icon name={icon} size={38} color="var(--teal-600)" />
          </div>
        )}
        <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)', marginTop: 18 }}>{title}</div>
        {description && <div style={{ font: '400 1.0625rem/1.5 var(--font-sans)', color: 'var(--text-muted)', marginTop: 8, maxWidth: 340 }}>{description}</div>}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</div>
      </div>
      {footer && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
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
