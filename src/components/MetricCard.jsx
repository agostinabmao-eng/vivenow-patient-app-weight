import Icon from './Icon';
import ProgressWheel from './ProgressWheel';

function sparklinePoints(trend, width = 120, height = 24, pad = 2) {
  if (!trend || trend.length < 2) return '';
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const span = max - min || 1;
  const stepX = width / (trend.length - 1);
  return trend
    .map((v, i) => {
      const x = i * stepX;
      const y = height - pad - ((v - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function MetricCard({ metric, onClick }) {
  const hasWheel = typeof metric.goal === 'number' && metric.goal > 0 && typeof metric.valueNum === 'number';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      style={{
        flex: '0 0 148px',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: 14,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={metric.icon} size={16} color="var(--teal-600)" />
        </div>
        <div style={{ font: '600 0.75rem/1.2 var(--font-sans)', color: 'var(--text-muted)' }}>{metric.label}</div>
      </div>

      {hasWheel ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <ProgressWheel value={metric.valueNum} max={metric.goal} size={82} strokeWidth={7} centerValue={metric.value} centerLabel={metric.unit} />
        </div>
      ) : (
        <>
          <div style={{ marginTop: 10, font: '700 1.375rem/1.1 var(--font-display)', color: 'var(--ink)' }}>{metric.value}</div>
          <div style={{ marginTop: 2, font: '500 0.75rem/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>{metric.unit}</div>
          {metric.hasTrend && (
            <svg width="100%" height="24" viewBox="0 0 120 24" preserveAspectRatio="none" style={{ marginTop: 6, display: 'block' }}>
              <polyline points={sparklinePoints(metric.trend)} fill="none" stroke="var(--teal-500)" strokeWidth="2" />
            </svg>
          )}
        </>
      )}
    </div>
  );
}
