/** A labeled on/off toggle (Profile's "Simple mode" row). */
export default function Switch({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        background: checked ? 'var(--teal-500)' : 'var(--gray-300)',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background var(--dur-fast) var(--ease-standard)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--dur-fast) var(--ease-standard)',
        }}
      />
    </button>
  );
}
