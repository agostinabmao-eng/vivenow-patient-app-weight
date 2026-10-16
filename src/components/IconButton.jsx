import { useState } from 'react';

const sizes = {
  sm: 36,
  md: 44,
};

const palette = {
  outline: { bg: 'transparent', bgHover: 'var(--teal-50)', fg: 'var(--ink)', border: 'var(--border-default)' },
  ghost: { bg: 'transparent', bgHover: 'var(--gray-50)', fg: 'var(--ink)', border: 'transparent' },
  solid: { bg: 'var(--teal-500)', bgHover: 'var(--teal-600)', fg: '#fff', border: 'transparent' },
};

/** A square-ish, icon-only tap target — the header back/profile buttons,
 * reminder bells on a to-do row, etc. `label` sets the accessible name
 * (there's rarely visible text next to these), `title` is the optional
 * mouse tooltip. */
export default function IconButton({ children, variant = 'outline', size = 'md', label, title, onClick, disabled = false, style = {}, className, ...rest }) {
  const dim = sizes[size] || sizes.md;
  const p = palette[variant] || palette.outline;
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        width: dim,
        height: dim,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        background: disabled ? 'var(--gray-100)' : hover ? p.bgHover : p.bg,
        border: `1.5px solid ${disabled ? 'var(--border-subtle)' : p.border}`,
        color: p.fg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
