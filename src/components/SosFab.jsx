import Icon from './Icon';

// Height of NavBar's own box (10px top pad + 68px min-height row + 10px
// bottom pad); its safe-area inset is added separately since NavBar pads
// for that itself.
const NAVBAR_HEIGHT = 92;

const buttonStyle = {
  width: 68,
  height: 68,
  borderRadius: '50%',
  background: 'var(--brand)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'var(--shadow-lg)',
  cursor: 'pointer',
  flexShrink: 0,
};

/** Persistent SOS entry point.
 *
 * On screens with a bottom NavBar and no screen-owned footer (Home,
 * Progress, Nutrition), it floats as a true circular FAB — position:
 * absolute, sized to just the button — anchored just above the NavBar, so
 * it never reserves a strip of its own that would eat into the
 * scrollable content's visible area. Those screens add matching
 * padding-bottom to their scroll containers so any row it briefly sits
 * over at rest can still be scrolled fully clear of it. Profile floats
 * the same way despite having no NavBar (`hasNavBar={false}`) — its own
 * footer button is gone (replaced by a header back-icon), so the circle
 * just sits close to the true bottom edge instead of clearing a NavBar
 * that isn't there.
 *
 * On screens that already own a footer reaching the true bottom of the
 * viewport (every task screen — Measure BP, Meds, Walk, Water, …), it
 * instead reserves genuine flex space as a sibling "dock" row between
 * that footer and the safe area, so it can never overlap the footer's
 * own buttons. */
export default function SosFab({ onClick, floating, withSafeBottom, hasNavBar = true }) {
  if (floating) {
    return (
      <button
        onClick={onClick}
        aria-label="Contact your care team"
        style={{
          position: 'absolute',
          right: `calc(16px + var(--safe-right))`,
          bottom: `calc(${hasNavBar ? NAVBAR_HEIGHT : 0}px + var(--safe-bottom) + 14px)`,
          zIndex: 5,
          ...buttonStyle,
        }}
      >
        <Icon name="phone-call" size={26} color="#fff" />
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        flexShrink: 0,
        padding: `8px calc(16px + var(--safe-right)) ${withSafeBottom ? 'calc(8px + var(--safe-bottom))' : '8px'} 16px`,
      }}
    >
      <button onClick={onClick} aria-label="Contact your care team" style={buttonStyle}>
        <Icon name="phone-call" size={24} color="#fff" />
      </button>
    </div>
  );
}
