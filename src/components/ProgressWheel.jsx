/** A circular 0-to-goal progress ring (Steps/Calories/Exercises on Home) —
 * the big-number equivalent of HeroProgressCard's bar, for a metric compact
 * enough to live inside the Today's Summary carousel tile. */
export default function ProgressWheel({ value, max, size = 82, strokeWidth = 7, centerValue, centerLabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--teal-50)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--teal-500)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset var(--dur-med) var(--ease-standard)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 4,
        }}
      >
        <span style={{ font: '700 1rem/1.1 var(--font-display)', color: 'var(--ink)' }}>{centerValue}</span>
        {centerLabel && <span style={{ font: '500 0.625rem/1.2 var(--font-sans)', color: 'var(--text-muted)', marginTop: 2 }}>{centerLabel}</span>}
      </div>
    </div>
  );
}
