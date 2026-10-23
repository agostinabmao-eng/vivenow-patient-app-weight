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
 * matter which tab is active. */
export default function NavBar({ active, onNavigate }) {
  const tabs = TABS;
  return (
    <nav
      style={{
        display: 'flex',
        gap: 4,
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        boxShadow: '0 -6px 24px rgba(28, 51, 70, 0.08)',
        padding: `10px calc(10px + var(--safe-left)) calc(10px + var(--safe-bottom)) calc(10px + var(--safe-right))`,
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const color = isActive ? 'var(--teal-700)' : 'var(--gray-500)';
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
              gap: 4,
              minHeight: 68,
              minWidth: 0,
              background: isActive ? 'var(--teal-50)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
            }}
          >
            <Icon name={tab.icon} size={24} color={color} strokeWidth={isActive ? 2.4 : 2} />
            <span style={{ font: `${isActive ? 700 : 600} 0.8rem/1 var(--font-sans)`, color: isActive ? 'var(--teal-700)' : 'var(--text-muted)' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
