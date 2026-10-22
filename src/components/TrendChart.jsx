import { useRef, useState } from 'react';

const WIDTH = 300;
const HEIGHT = 120;
const PAD_X = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 22;

function scaleY(v, min, max) {
  const span = max - min || 1;
  return PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * (1 - (v - min) / span);
}

function pathFor(values, min, max) {
  const stepX = values.length > 1 ? (WIDTH - PAD_X * 2) / (values.length - 1) : 0;
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(PAD_X + i * stepX).toFixed(1)},${scaleY(v, min, max).toFixed(1)}`)
    .join(' ');
}

/** A small multi-series line chart for one vital over the selected period —
 * 2px lines, a light area wash under the (first) series, an end-dot + value
 * label on the most recent point of each series, and a dashed reference
 * line when the metric has a fixed daily goal. Two series (e.g. systolic /
 * diastolic) share one y-axis, never a dual-axis chart, with a legend since
 * color alone can't carry identity for more than one line.
 *
 * `onScrub(index | null)` — optional: touching or dragging across the chart
 * reports the nearest day's index so the caller (ExpandedMetricCard) can
 * swap its headline number from the period average to that specific day's
 * reading; releasing reports `null` so it reverts to the average. This
 * component only reports the index and draws the guide line/dots — it
 * doesn't know or care how the caller formats the value.
 *
 * `refLines` — optional array of `{ value, label, color? }` constant
 * reference lines (e.g. a weight goal + baseline), distinct from `goal`
 * (which is the single dashed "daily goal" line several other metrics use). */
export default function TrendChart({ series, xLabels, unit = '', goal, goalLabel, refLines, onScrub }) {
  const allValues = series.flatMap((s) => s.data);
  if (goal != null) allValues.push(goal);
  if (refLines) allValues.push(...refLines.map((r) => r.value));
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const span = rawMax - rawMin || 1;
  const min = rawMin - span * 0.15;
  const max = rawMax + span * 0.15;

  const dataLen = series[0].data.length;
  const stepX = dataLen > 1 ? (WIDTH - PAD_X * 2) / (dataLen - 1) : 0;

  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [scrubIndex, setScrubIndex] = useState(null);

  const indexFromClientX = (clientX) => {
    const svg = svgRef.current;
    if (!svg || dataLen < 2) return null;
    const rect = svg.getBoundingClientRect();
    const xInViewBox = ((clientX - rect.left) / rect.width) * WIDTH;
    const idx = Math.round((xInViewBox - PAD_X) / stepX);
    return Math.min(dataLen - 1, Math.max(0, idx));
  };
  const scrubTo = (clientX) => {
    const idx = indexFromClientX(clientX);
    if (idx == null) return;
    setScrubIndex(idx);
    onScrub && onScrub(idx);
  };
  const endScrub = () => {
    setDragging(false);
    setScrubIndex(null);
    onScrub && onScrub(null);
  };

  return (
    <div>
      {series.length > 1 && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 6 }}>
          {series.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ font: '500 1rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
      <svg
        ref={svgRef}
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        style={{ display: 'block', overflow: 'visible', touchAction: onScrub ? 'none' : undefined, cursor: onScrub ? 'pointer' : undefined }}
        onPointerDown={
          onScrub
            ? (e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragging(true);
                scrubTo(e.clientX);
              }
            : undefined
        }
        onPointerMove={onScrub ? (e) => dragging && scrubTo(e.clientX) : undefined}
        onPointerUp={onScrub ? endScrub : undefined}
        onPointerCancel={onScrub ? endScrub : undefined}
      >
        <line x1={PAD_X} y1={HEIGHT - PAD_BOTTOM} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_BOTTOM} stroke="var(--border-subtle)" strokeWidth="1" />

        {goal != null && (
          <>
            <line
              x1={PAD_X}
              y1={scaleY(goal, min, max)}
              x2={WIDTH - PAD_X}
              y2={scaleY(goal, min, max)}
              stroke="var(--gray-300)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text x={WIDTH - PAD_X} y={scaleY(goal, min, max) - 4} textAnchor="end" style={{ font: '500 8px var(--font-sans)', fill: 'var(--text-muted)' }}>
              {goalLabel || `goal ${goal}`}
            </text>
          </>
        )}

        {refLines &&
          refLines.map((r) => (
            <g key={r.label}>
              <line
                x1={PAD_X}
                y1={scaleY(r.value, min, max)}
                x2={WIDTH - PAD_X}
                y2={scaleY(r.value, min, max)}
                stroke={r.color || 'var(--gray-300)'}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text x={PAD_X} y={scaleY(r.value, min, max) - 4} style={{ font: '500 8px var(--font-sans)', fill: r.color || 'var(--text-muted)' }}>
                {r.label}
              </text>
            </g>
          ))}

        {series.map((s, si) => (
          <path
            key={s.label}
            d={`${pathFor(s.data, min, max)} L${(WIDTH - PAD_X).toFixed(1)},${(HEIGHT - PAD_BOTTOM).toFixed(1)} L${PAD_X},${(HEIGHT - PAD_BOTTOM).toFixed(1)} Z`}
            fill={si === 0 ? s.color : 'none'}
            fillOpacity={si === 0 ? 0.1 : 0}
            stroke="none"
          />
        ))}
        {series.map((s) => (
          <path key={s.label} d={pathFor(s.data, min, max)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {scrubIndex == null &&
          series.map((s) => {
            const lastX = PAD_X + (s.data.length - 1) * stepX;
            const lastY = scaleY(s.data[s.data.length - 1], min, max);
            return (
              <g key={s.label}>
                <circle cx={lastX} cy={lastY} r="5" fill={s.color} stroke="var(--surface-card)" strokeWidth="2" />
                <text
                  x={Math.min(lastX, WIDTH - 4)}
                  y={lastY - 10 < PAD_TOP ? lastY + 16 : lastY - 10}
                  textAnchor="end"
                  style={{ font: '700 10px var(--font-display)', fill: 'var(--ink)' }}
                >
                  {s.data[s.data.length - 1]}
                  {unit}
                </text>
              </g>
            );
          })}

        {scrubIndex != null && (
          <g>
            <line
              x1={PAD_X + scrubIndex * stepX}
              y1={PAD_TOP}
              x2={PAD_X + scrubIndex * stepX}
              y2={HEIGHT - PAD_BOTTOM}
              stroke="var(--text-muted)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {series.map((s) => (
              <circle
                key={s.label}
                cx={PAD_X + scrubIndex * stepX}
                cy={scaleY(s.data[scrubIndex], min, max)}
                r="5"
                fill={s.color}
                stroke="var(--surface-card)"
                strokeWidth="2"
              />
            ))}
          </g>
        )}

        {xLabels && (
          <>
            <text x={PAD_X} y={HEIGHT - 6} style={{ font: '500 9px var(--font-sans)', fill: 'var(--text-muted)' }}>
              {xLabels[0]}
            </text>
            <text x={WIDTH - PAD_X} y={HEIGHT - 6} textAnchor="end" style={{ font: '500 9px var(--font-sans)', fill: 'var(--text-muted)' }}>
              {xLabels[xLabels.length - 1]}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
