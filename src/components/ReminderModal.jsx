import { useState } from 'react';
import Icon from './Icon';
import Button from './Button';

/** Set (or clear) a daily reminder time for one task — opened from the bell
 * icon on a to-do row. "Apply to all" is a shortcut for setting the same
 * time across every task at once, not a separate feature. */
export default function ReminderModal({ taskLabel, initialTime, onSave, onClose }) {
  const [time, setTime] = useState(initialTime || '09:00');
  const [applyToAll, setApplyToAll] = useState(false);

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(7,46,67,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 40 }}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 24, width: '100%', maxWidth: 340 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bell" size={18} color="var(--teal-600)" />
          </div>
          <div style={{ font: '700 1.0625rem/1.3 var(--font-display)', color: 'var(--ink)' }}>Remind me</div>
        </div>
        <div style={{ font: '400 1rem/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 6 }}>{taskLabel}</div>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            marginTop: 16,
            minHeight: 60,
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border-default)',
            background: 'var(--surface-card)',
            colorScheme: 'light',
            font: '700 1.25rem/1 var(--font-display)',
            color: 'var(--ink)',
            textAlign: 'center',
          }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            style={{ width: 26, height: 26, margin: 0, flexShrink: 0, accentColor: 'var(--teal-600)', colorScheme: 'light', cursor: 'pointer' }}
          />
          <span style={{ font: '500 1rem/1.3 var(--font-sans)', color: 'var(--text-body)' }}>Use this time for every task</span>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <Button variant="primary" size="lg" fullWidth onClick={() => onSave(time, applyToAll)} iconLeft={<Icon name="check" size={20} />}>
            Save reminder
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
