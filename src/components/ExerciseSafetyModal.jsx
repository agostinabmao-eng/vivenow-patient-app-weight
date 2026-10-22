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

/** Pre-exercise safety gate — one modal, five stages, shown in front of the
 * Exercise tab instead of letting a video start outright:
 *  - symptom-check: the plan's own questions (see patientPlan.preExerciseCheck),
 *    asked before every exercise session, regardless of BP.
 *  - need-reading: blocks a moderate-intensity video until BP is on file
 *    from the last 24h (only reachable for patients whose plan tracks BP).
 *  - moderate-warning: today's BP reading is elevated but not severely so.
 *  - symptom-caution: a flagged answer whose outcome is 'caution' — lighter
 *    than a pause, the patient can choose to continue.
 *  - high-block: today's BP reading is severely elevated, or a flagged
 *    answer's outcome is 'pause' (e.g. a fall) — exercise is off the table
 *    for the rest of the day. */
export default function ExerciseSafetyModal({ stage, questions, onSubmitSymptoms, onMeasureNow, onContactCareTeam, onGentleMobility, onContinueCaution, onNotNow, onClose }) {
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
          <Button variant="danger" size="lg" fullWidth onClick={onContactCareTeam}>
            Contact care team
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={onNotNow}>
            Not now
          </Button>
        </div>
      </ModalShell>
    );
  }

  if (stage === 'need-reading') {
    return (
      <ModalShell icon="activity" iconTone="warning" title="Please measure your blood pressure before you start">
        <div style={{ font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-body)', marginTop: 8 }}>
          We don&apos;t have a reading from the last 24 hours, and this exercise is moderate intensity.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 20 }}>
          <Button variant="primary" size="lg" fullWidth onClick={onMeasureNow}>
            Measure now
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={onNotNow}>
            Not now
          </Button>
        </div>
      </ModalShell>
    );
  }

  if (stage === 'moderate-warning') {
    return (
      <ModalShell icon="alert-triangle" iconTone="warning" title="Your blood pressure is higher than usual today">
        <div style={{ font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-body)', marginTop: 8 }}>
          Please check with your care team before exercising.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 20 }}>
          <Button variant="danger" size="lg" fullWidth onClick={onContactCareTeam}>
            Contact care team
          </Button>
          <Button variant="outline" size="lg" fullWidth onClick={onGentleMobility}>
            Do gentle mobility instead
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={onNotNow}>
            Not now
          </Button>
        </div>
      </ModalShell>
    );
  }

  // stage === 'high-block'
  return (
    <ModalShell icon="alert-triangle" iconTone="danger" title="Let's skip exercise today">
      <div style={{ font: '400 1rem/1.5 var(--font-sans)', color: 'var(--text-body)', marginTop: 8 }}>
        Your care team has been notified.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 20 }}>
        <Button variant="danger" size="lg" fullWidth onClick={onContactCareTeam}>
          Contact care team
        </Button>
        <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
          Close
        </Button>
      </div>
    </ModalShell>
  );
}
