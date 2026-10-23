import Icon from './Icon';
import Button from './Button';
import { MEDICATIONS } from '../data/sampleData';

function MedRow({ med, taken, onToggle }) {
  return (
    <div
      onClick={onToggle}
      role="checkbox"
      aria-checked={taken}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 0',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: taken ? 'var(--success)' : 'transparent',
          border: taken ? 'none' : '2px solid var(--border-strong)',
        }}
      >
        {taken && <Icon name="check" size={16} color="#fff" strokeWidth={3} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '700 1.0625rem/1.3 var(--font-sans)', color: 'var(--ink)' }}>
          {med.name} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{med.dose}</span>
        </div>
        <div style={{ font: '400 1rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>{med.time}</div>
      </div>
    </div>
  );
}

/** Each medication is its own checkbox (rather than one yes/no for "did you
 * take your meds") so a patient who only took one of several can say
 * exactly that — "Mark all taken" is a shortcut for the common case, not
 * the only way to do it. Shared between the dedicated Take Medications
 * screen and Home's Simple-mode inline row. */
export default function MedicationList({ medsTaken, onToggleMed, onMarkAllTaken, showMarkAll = true }) {
  const allTaken = MEDICATIONS.every((m) => medsTaken[m.id]);
  return (
    <div>
      <div>
        {MEDICATIONS.map((med) => (
          <MedRow key={med.id} med={med} taken={!!medsTaken[med.id]} onToggle={() => onToggleMed(med.id)} />
        ))}
      </div>
      {showMarkAll && !allTaken && (
        <Button variant="outline" size="md" fullWidth onClick={onMarkAllTaken} style={{ marginTop: 12 }} iconLeft={<Icon name="check" size={16} />}>
          Mark all taken
        </Button>
      )}
    </div>
  );
}
