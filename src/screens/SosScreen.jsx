import Icon from '../components/Icon';
import Button from '../components/Button';
import BackIconButton from '../components/BackIconButton';
import Photo from '../components/Photo';
import { careTeamPhone } from '../data/sampleData';

export default function SosScreen({ onCancel }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 16px 0' }}>
        <BackIconButton onClick={onCancel} />
      </div>
      <div className="vh-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '4px 24px 16px', textAlign: 'center' }}>
        <Photo name="sos" alt="An older woman checking her phone at the kitchen table" height={180} style={{ width: '100%' }} />
        <div style={{ font: '700 var(--fs-title)/1.05 var(--font-display)', color: 'var(--ink)', marginTop: 12 }}>Need to reach your care team?</div>
        <div style={{ font: '400 1.0625rem/1.5 var(--font-sans)', color: 'var(--text-body)' }}>
          Call or send a text and we&apos;ll get back to you as soon as we can. We&apos;re not available 24/7.
        </div>
        <div style={{ font: '400 1.0625rem/1.5 var(--font-sans)', color: 'var(--text-body)' }}>
          If you&apos;re not feeling well, we recommend resting and skipping your exercises today.
        </div>
        <div style={{ font: '700 1.0625rem/1.4 var(--font-sans)', color: 'var(--ink)', marginTop: 8, textWrap: 'balance' }}>If you need immediate help, call 911</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: `0 calc(20px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(20px + var(--safe-left))`,
        }}
      >
        <Button variant="primary" size="lg" fullWidth href={`tel:${careTeamPhone.tel}`} iconLeft={<Icon name="phone-call" size={20} color="#fff" />}>
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
