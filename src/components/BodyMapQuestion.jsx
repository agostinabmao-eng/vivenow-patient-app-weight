import Icon from './Icon';

const AREAS = ['Neck', 'Shoulders', 'Back', 'Hips', 'Knees', 'Ankles/Feet', 'Wrists/Hands'];
const SEVERITIES = ['Mild', 'Moderate', 'Severe'];

// A simplified list-based picker — this originally shipped as an SVG body
// silhouette with selectable points; simplified here to a plain area list
// with a severity picker per selected area, which captures the same data
// (affected areas + how bad each one is) without the illustration work.
export default function BodyMapQuestion({ value, onChange }) {
  const entries = value || [];
  const find = (area) => entries.find((e) => e.area === area);

  const toggleArea = (area) => {
    if (find(area)) onChange(entries.filter((e) => e.area !== area));
    else onChange([...entries, { area, severity: 'Mild' }]);
  };
  const setSeverity = (area, severity) => onChange(entries.map((e) => (e.area === area ? { ...e, severity } : e)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
      {AREAS.map((area) => {
        const entry = find(area);
        const active = !!entry;
        return (
          <div key={area} style={{ border: `1.5px solid ${active ? 'var(--teal-500)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', background: active ? 'var(--teal-50)' : '#fff' }}>
            <button
              onClick={() => toggleArea(area)}
              aria-pressed={active}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                background: 'none',
                border: 'none',
                color: active ? 'var(--teal-700)' : 'var(--ink)',
                font: '600 0.9375rem/1.3 var(--font-sans)',
                cursor: 'pointer',
              }}
            >
              {active && <Icon name="check" size={16} color="var(--teal-600)" />}
              {area}
            </button>
            {active && (
              <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px' }}>
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverity(area, s)}
                    aria-pressed={entry.severity === s}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 'var(--radius-pill)',
                      border: `1.5px solid ${entry.severity === s ? 'var(--teal-500)' : 'var(--border-default)'}`,
                      background: entry.severity === s ? 'var(--teal-500)' : '#fff',
                      color: entry.severity === s ? '#fff' : 'var(--text-muted)',
                      font: '600 0.75rem/1 var(--font-sans)',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
