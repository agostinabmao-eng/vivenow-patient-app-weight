import Icon from './Icon';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'progress', label: 'Progress', icon: 'trending-up' },
  { key: 'nutrition', label: 'Nutrition', icon: 'utensils' },
  { key: 'exercise', label: 'Exercise', icon: 'dumbbell' },
  { key: 'learn', label: 'Learn', icon: 'book-open' },
];

/** Bottom tab bar — Home / Progress / Nutrition / Exercise / Learn. SOS
 * lives outside this bar entirely (see SosFab) so it stays reachable no
 * matter which tab is active. In Simple mode, Nutrition, Exercise and
 * Learn drop off the bar — they're still reachable, just from their to-do
 * list row instead of a persistent tab, so there's less to scan at a glance. */
export default function NavBar({ active, onNavigate, simpleMode }) {
  const tabs = simpleMode ? TABS.filter((t) => t.key === 'home' || t.key === 'progress') : TABS;
  return (
    <nav
      style={{
        display: 'flex',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--surface-card)',
        padding: `8px calc(12px + var(--safe-left)) calc(8px + var(--safe-bottom)) calc(12px + var(--safe-right))`,
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const color = isActive ? 'var(--teal-600)' : 'var(--gray-400)';
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              minHeight: 56,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Icon name={tab.icon} size={22} color={color} />
            <span style={{ font: `${isActive ? 600 : 500} 0.6875rem/1 var(--font-sans)`, color: isActive ? 'var(--teal-600)' : 'var(--gray-500)' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
