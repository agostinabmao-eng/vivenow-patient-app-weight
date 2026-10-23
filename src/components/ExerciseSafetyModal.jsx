import { useState } from 'react';
import Icon from './Icon';
import Button from './Button';

function SymptomRow({ label, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        textAlign: 'left',
        background: checked ? 'var(--danger-subtle)' : 'var(--gray-50)',
        border: `1.5px solid ${checked ? 'var(--danger)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 14,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 'var(--radius-xs)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: checked ? 'var(--danger)' : '#fff',
          border: checked ? 'none' : '1.5px solid var(--border-strong)',
        }}
      >
        {checked && <Icon name="check" size={14} color="#fff" />}
      </div>
      <span style={{ font: '600 1rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>{label}</span>
    </button>
  );
}

function ModalShell({ icon, iconTone, title, children }) {
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
          maxWidth: 360,
          maxHeight: '85vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: `var(--${iconTone}-subtle)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={28} color={`var(--${iconTone})`} />
        </div>
        <div style={{ font: '700 1.125rem/1.3 var(--font-display)', color: 'var(--ink)', marginTop: 14 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

/** Pre-exercise safety gate — one modal, three stages, shown in front of the
 * Exercise tab instead of letting a video start outright:
 *  - symptom-check: the plan's own questions (see patientPlan.preExerciseCheck),
 *    asked before every exercise session.
 *  - symptom-caution: a flagged answer whose outcome is 'caution' — lighter
 *    than a pause, the patient can choose to continue.
 *  - high-block: a flagged answer whose outcome is 'pause' (e.g. a fall) —
 *    we recommend skipping exercise for the day and point to the care team,
 *    which is not an emergency service. */
export default function ExerciseSafetyModal({ stage, questions, onSubmitSymptoms, onContactCareTeam, onContinueCaution, onNotNow, onClose }) {
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  if (stage === 'symptom-check') {
    return (
      <ModalShell icon="stethoscope" iconTone="info" title="Before you start — how are you feeling?">
        <div style={{ font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-body)', marginTop: 8 }}>
          Let us know if any of these apply right now.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 16 }}>
          {questions.map((q) => (
            <SymptomRow key={q.id} label={q.question} checked={!!checked[q.id]} onToggle={() => toggle(q.id)} />
          ))}
        </div>
        <div style={{ width: '100%', marginTop: 18 }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => onSubmitSymptoms(Object.keys(checked).filter((id) => checked[id]))}
          >
            Continue
          </Button>
        </div>
      </ModalShell>
    );
  }

  if (stage === 'symptom-caution') {
    return (
      <ModalShell icon="alert-triangle" iconTone="warning" title="Let's be careful today">
        <div style={{ font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-body)', marginTop: 8 }}>
          Based on what you shared, take it easy and stop right away if anything feels wrong.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 20 }}>
          <Button variant="primary" size="lg" fullWidth onClick={onContinueCaution}>
            Continue carefully
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={onContactCareTeam}>
            Contact care team
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={onNotNow}>
            Not now
          </Button>
        </div>
      </ModalShell>
    );
  }

  // stage === 'high-block' — a flagged answer whose outcome is 'pause'
  return (
    <ModalShell icon="alert-triangle" iconTone="warning" title="Let's skip exercise today">
      <div style={{ font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-body)', marginTop: 8 }}>
        Since you&apos;re not feeling well, we recommend skipping your exercises today. Rest, and try again when you feel better.
      </div>
      <div style={{ font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-body)', marginTop: 10 }}>
        You&apos;re welcome to contact your care team, but we&apos;re not an emergency service. If you need immediate help, call 911.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 20 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onContactCareTeam}>
          Contact care team
        </Button>
        <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
          Close
        </Button>
      </div>
    </ModalShell>
  );
}
