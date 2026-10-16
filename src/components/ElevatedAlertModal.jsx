import Icon from './Icon';
import Button from './Button';

/** Calm, non-alarmist modal for an elevated BP reading — offers a moment to
 * rest, with a one-tap path to call the caregiver if it doesn't feel right. */
export default function ElevatedAlertModal({ reading, onCallCaregiver, onContinue }) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7,46,67,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 40,
      }}
    >
      <div
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 24,
          width: '100%',
          maxWidth: 340,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--warning-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="alert-triangle" size={28} color="var(--warning)" />
        </div>
        <div style={{ font: '700 1.125rem/1.3 var(--font-display)', color: 'var(--ink)', marginTop: 14 }}>Your reading was a little high</div>
        <div style={{ font: '600 0.9375rem/1.2 var(--font-sans)', color: 'var(--teal-600)', marginTop: 4 }}>{reading}</div>
        <div style={{ font: '400 0.875rem/1.5 var(--font-sans)', color: 'var(--text-body)', marginTop: 10 }}>
          Take a few minutes to sit down, relax, and breathe slowly. We&apos;ll share this with your care team.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 20 }}>
          <Button variant="danger" size="lg" fullWidth onClick={onCallCaregiver}>
            Call caregiver now
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={onContinue}>
            I&apos;m okay, continue
          </Button>
        </div>
      </div>
    </div>
  );
}
