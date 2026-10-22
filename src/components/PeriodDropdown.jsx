import { useState } from 'react';
import Icon from './Icon';

const PRESETS = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom Range' },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** The period picker driving Progress's summary cards/charts — a dropdown
 * of presets (This Week / This Month) plus a custom date range, instead of
 * a bare native date input. */
export default function PeriodDropdown({ period, customRange, onChange }) {
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(customRange?.start || todayStr());
  const [draftEnd, setDraftEnd] = useState(customRange?.end || todayStr());

  const label = PRESETS.find((p) => p.key === period)?.label || 'This Period';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          font: '600 1rem/1 var(--font-sans)',
          color: 'var(--ink)',
          cursor: 'pointer',
        }}
      >
        <Icon name="calendar" size={16} color="var(--teal-600)" />
        {label}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color="var(--gray-500)" />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 6,
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: 10,
            zIndex: 15,
            width: 240,
          }}
        >
          {PRESETS.filter((p) => p.key !== 'custom').map((p) => (
            <button
              key={p.key}
              onClick={() => {
                onChange(p.key, null);
                setOpen(false);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 8px',
                background: period === p.key ? 'var(--teal-50)' : 'none',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                font: '600 1rem/1 var(--font-sans)',
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 6, paddingTop: 10 }}>
            <div style={{ font: '600 1rem/1 var(--font-sans)', color: 'var(--text-muted)', marginBottom: 6 }}>Custom range</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="date"
                value={draftStart}
                max={draftEnd}
                onChange={(e) => setDraftStart(e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', font: '400 1rem/1 var(--font-sans)' }}
              />
              <input
                type="date"
                value={draftEnd}
                min={draftStart}
                max={todayStr()}
                onChange={(e) => setDraftEnd(e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', font: '400 1rem/1 var(--font-sans)' }}
              />
            </div>
            <button
              onClick={() => {
                onChange('custom', { start: draftStart, end: draftEnd });
                setOpen(false);
              }}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '9px 0',
                background: 'var(--teal-500)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                font: '600 1rem/1 var(--font-sans)',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
