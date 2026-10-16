import Icon from '../components/Icon';
import Button from '../components/Button';
import { careTeamPhone } from '../data/sampleData';

export default function SosScreen({ onCancel }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        style={{
          padding: `calc(16px + var(--safe-top)) calc(20px + var(--safe-right)) 12px calc(20px + var(--safe-left))`,
          font: '700 1.375rem/1.2 var(--font-display)',
          color: 'var(--ink)',
        }}
      >
        SOS Call
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '20px 32px 0', textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="phone-call" size={40} color="var(--danger)" />
        </div>
        <div style={{ font: '700 1.25rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Contact your care team now?</div>
        <div style={{ font: '400 0.90625rem/1.5 var(--font-sans)', color: 'var(--text-body)' }}>Call for immediate help, or send a text if you can&apos;t talk right now.</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: `0 calc(20px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(20px + var(--safe-left))`,
        }}
      >
        <Button variant="danger" size="lg" fullWidth href={`tel:${careTeamPhone.tel}`} iconLeft={<Icon name="phone-call" size={20} color="#fff" />}>
          Call {careTeamPhone.display}
        </Button>
        <Button variant="outline" size="lg" fullWidth href={`sms:${careTeamPhone.tel}`} iconLeft={<Icon name="message-circle" size={20} />}>
          Send a Text
        </Button>
        <Button variant="ghost" size="lg" fullWidth onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
