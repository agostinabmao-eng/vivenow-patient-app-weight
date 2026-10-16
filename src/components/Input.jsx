/** A labeled text/number input in the Vive Health style — big enough to hit
 * the RPM spec's touch-target minimum and read clearly for elderly patients. */
export default function Input({ label, containerStyle, style, ...rest }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...containerStyle }}>
      {label && <span style={{ font: '600 0.8125rem/1.2 var(--font-sans)', color: 'var(--text-muted)' }}>{label}</span>}
      <input
        {...rest}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--border-default)',
          background: '#fff',
          font: '600 1rem/1.3 var(--font-sans)',
          color: 'var(--ink)',
          ...style,
        }}
      />
    </label>
  );
}
