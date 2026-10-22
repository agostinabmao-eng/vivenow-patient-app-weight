import Icon from '../components/Icon';
import BackIconButton from '../components/BackIconButton';
import Button from '../components/Button';
import { careTeamPhone } from '../data/sampleData';

/** Reusable redirect for anything risk-related that isn't the nurse's job
 * to collect through the app — falls, pain, new symptoms, medication
 * questions, device trouble. Onboarding never asks about any of this (the
 * nurse's intake call already does); if it comes up anywhere else in the
 * app, it lands here instead of a form. Reached today from Profile's
 * "Report a fall, pain, or new symptom" row. */
export default function NurseWillDiscussNotice({ onBack }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 'calc(12px + var(--safe-top)) 12px 0' }}>
        <BackIconButton onClick={onBack} />
      </div>
      <div
        className="vh-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="stethoscope" size={34} color="var(--teal-600)" />
        </div>
        <div style={{ font: '700 var(--fs-title)/1.2 var(--font-display)', color: 'var(--ink)' }}>
          Your nurse will talk about this on your next call
        </div>
        <div style={{ font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-body)' }}>
          Things like falls, pain, new symptoms, or your medications are best discussed directly with your care team —
          not through the app. If this feels urgent, please call them now.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
          <Button variant="primary" size="lg" fullWidth href={`tel:${careTeamPhone.tel}`} iconLeft={<Icon name="phone-call" size={18} />}>
            Call {careTeamPhone.display}
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
