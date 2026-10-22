import { useState } from 'react';

const sizes = {
  sm: { padding: '10px 20px', fontSize: '1rem', height: 52, radius: 'var(--radius-pill)' },
  md: { padding: '14px 26px', fontSize: '1.0625rem', height: 60, radius: 'var(--radius-pill)' },
  lg: { padding: '18px 32px', fontSize: '1.1875rem', height: 68, radius: 'var(--radius-pill)' },
};

const palette = {
  primary: { bg: 'var(--brand)', bgHover: 'var(--brand-hover)', bgActive: 'var(--brand-active)', fg: '#fff', border: 'transparent' },
  secondary: { bg: 'var(--gold-300)', bgHover: '#f4cd6c', bgActive: '#efc255', fg: 'var(--ink)', border: 'transparent' },
  outline: { bg: '#fff', bgHover: 'var(--teal-50)', bgActive: 'var(--teal-100)', fg: 'var(--teal-700)', border: 'var(--teal-600)' },
  ghost: { bg: 'transparent', bgHover: 'var(--ice-50)', bgActive: 'var(--ice-100)', fg: 'var(--ink)', border: 'transparent' },
  danger: { bg: '#d6420f', bgHover: '#bd3a0c', bgActive: '#a43209', fg: '#fff', border: 'transparent' },
};

/** Vive Health primary action button — a full pill, 52/60/68px tall, so even
 * the smallest size clears the 48px touch-target guideline by a wide margin
 * for patients with tremor or reduced vision. */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  type = 'button',
  href,
  onClick,
  style = {},
  ...rest
}) {
  const s = sizes[size] || sizes.md;
  const p = palette[variant] || palette.primary;
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const bg = disabled ? 'var(--gray-200)' : active ? p.bgActive : hover ? p.bgHover : p.bg;
  const fg = disabled ? 'var(--gray-500)' : p.fg;
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={href}
      type={href ? undefined : type}
      disabled={href ? undefined : disabled}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: s.fontSize,
        lineHeight: 1,
        padding: s.padding,
        minHeight: s.height,
        width: fullWidth ? '100%' : 'auto',
        background: bg,
        color: fg,
        border: `2px solid ${disabled ? 'transparent' : p.border}`,
        borderRadius: s.radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast)',
        boxShadow: variant === 'primary' && !disabled ? 'var(--shadow-brand)' : 'none',
        whiteSpace: 'normal',
        textAlign: 'center',
        textDecoration: 'none',
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </Tag>
  );
}
