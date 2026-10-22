import { useCallback, useRef, useState } from 'react';

/** A horizontal fill bar the patient drags (or taps a spot on) to set a
 * value, instead of tapping +/- one increment at a time. Pointer Events
 * unify mouse and touch, and pointer capture keeps the drag tracking the
 * finger even once it moves outside the track. */
export default function DragSlider({ value, max, step = 1, onChange, height = 24, fillColor = 'var(--teal-500)', trackColor = 'var(--ice-100)' }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback(
    (clientX) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const snapped = Math.round((ratio * max) / step) * step;
      onChange(Math.min(max, Math.max(0, snapped)));
    },
    [max, step, onChange],
  );

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromClientX(e.clientX);
  };
  const handlePointerMove = (e) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };
  const endDrag = () => setDragging(false);

  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const thumbSize = height + 20;

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="slider"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          onChange(Math.min(max, value + step));
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          onChange(Math.max(0, value - step));
        }
      }}
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-pill)',
        background: trackColor,
        cursor: 'pointer',
        touchAction: 'none',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${pct}%`,
          borderRadius: 'var(--radius-pill)',
          background: fillColor,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: thumbSize,
          height: thumbSize,
          borderRadius: '50%',
          background: '#fff',
          border: `4px solid ${fillColor}`,
          boxShadow: 'var(--shadow-sm)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
