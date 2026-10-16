import { useState } from 'react';

const sizes = {
  sm: { padding: '8px 14px', fontSize: 14, height: 36, radius: 'var(--radius-sm)' },
  md: { padding: '11px 20px', fontSize: 15, height: 44, radius: 'var(--radius-md)' },
  lg: { padding: '14px 26px', fontSize: 17, height: 56, radius: 'var(--radius-md)' },
};

const palette = {
  primary: { bg: 'var(--brand)', bgHover: 'var(--brand-hover)', bgActive: 'var(--brand-active)', fg: '#fff', border: 'transparent' },
  secondary: { bg: 'var(--navy-500)', bgHover: 'var(--navy-600)', bgActive: 'var(--navy-700)', fg: '#fff', border: 'transparent' },
  outline: { bg: 'transparent', bgHover: 'var(--teal-50)', bgActive: 'var(--teal-100)', fg: 'var(--teal-700)', border: 'var(--teal-500)' },
  ghost: { bg: 'transparent', bgHover: 'var(--gray-50)', bgActive: 'var(--gray-100)', fg: 'var(--ink)', border: 'transparent' },
  danger: { bg: 'var(--danger)', bgHover: '#cf2d00', bgActive: '#b52700', fg: '#fff', border: 'transparent' },
};

/** Vive Health primary action button. size="lg" is 56px tall — the minimum
 * touch target the RPM spec calls for so elderly patients can reliably tap it. */
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
  const fg = disabled ? 'var(--gray-400)' : p.fg;
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
        gap: 8,
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: s.fontSize,
        lineHeight: 1,
        padding: s.padding,
        minHeight: s.height,
        width: fullWidth ? '100%' : 'auto',
        background: bg,
        color: fg,
        border: `1.5px solid ${disabled ? 'transparent' : p.border}`,
        borderRadius: s.radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast)',
        boxShadow: variant === 'primary' && !disabled && hover ? 'var(--shadow-brand)' : 'none',
        whiteSpace: 'nowrap',
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
