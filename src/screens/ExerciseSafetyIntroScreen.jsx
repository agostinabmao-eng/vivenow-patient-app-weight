import Icon from '../components/Icon';
import Button from '../components/Button';
import BackIconButton from '../components/BackIconButton';

function Point({ icon, tone, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `var(--${tone}-subtle)`,
        }}
      >
        <Icon name={icon} size={18} color={`var(--${tone})`} />
      </div>
      <div>
        <div style={{ font: '700 0.9375rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{title}</div>
        <div style={{ font: '400 0.84375rem/1.5 var(--font-sans)', color: 'var(--text-muted)', marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
}

/** One-time (reopenable) safety briefing shown before the very first
 * exercise video — the "talk test" for pacing, and the symptoms that mean
 * stop right away. Reachable again any time from a link on the Exercise
 * tab, not just automatically the first time. */
export default function ExerciseSafetyIntroScreen({ onDismiss, dismissLabel = "Got it, let's go", showBack = false }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showBack && (
        <div style={{ padding: 'calc(12px + var(--safe-top)) 12px 0' }}>
          <BackIconButton onClick={onDismiss} />
        </div>
      )}
      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', padding: `${showBack ? '4px' : 'calc(24px + var(--safe-top))'} 24px 20px`, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--teal-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <Icon name="shield" size={30} color="var(--teal-600)" />
          </div>
          <div style={{ font: '700 1.1875rem/1.3 var(--font-display)', color: 'var(--ink)', marginTop: 14 }}>Exercising safely</div>
          <div style={{ font: '400 0.875rem/1.5 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6 }}>
            A couple of things to keep in mind before each session.
          </div>
        </div>

        <Point
          icon="message-circle"
          tone="info"
          title="Use the talk test"
          body="You should be able to hold a conversation while exercising. If you can't talk without gasping for air, slow down or take a break."
        />
        <Point
          icon="alert-triangle"
          tone="warning"
          title="When to stop right away"
          body="Stop and rest if you feel chest pain, dizziness, unusual shortness of breath, or anything that doesn't feel right."
        />
        <Point
          icon="phone-call"
          tone="danger"
          title="When to contact your care team"
          body="If symptoms don't go away after resting — or you're ever unsure — contact your care team using the SOS button."
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: `0 calc(24px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(24px + var(--safe-left))`,
          flexShrink: 0,
        }}
      >
        <Button variant="primary" size="lg" fullWidth onClick={onDismiss} iconLeft={<Icon name="check" size={20} />}>
          {dismissLabel}
        </Button>
      </div>
    </div>
  );
}
