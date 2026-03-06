export type Page = 'dashboard' | 'goals' | 'habits' | 'calendar' | 'projects'

type Theme = 'light' | 'dark'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  theme: Theme
  onToggleTheme: () => void
}

const navItems: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'goals', label: 'Goals' },
  { id: 'habits', label: 'Habits' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'projects', label: 'Projects' }
]

export function Sidebar({ currentPage, onNavigate, theme, onToggleTheme }: SidebarProps) {
  return (
    <>
      <div
        style={{
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <h1
          style={{
            color: 'var(--color-text)',
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          🧭 Upward
        </h1>
        <button
          type="button"
          onClick={onToggleTheme}
          style={{
            fontSize: 11,
            padding: '6px 10px',
            borderRadius: 999,
            border: `1px solid var(--color-border-subtle)`,
            background: 'var(--color-card-bg)',
            color: 'var(--color-muted)',
          }}
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
      <div
        style={{
          height: 1,
          background: 'var(--color-nav-divider)',
          margin: '0 16px'
        }}
      />
      <nav
        style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                textAlign: 'left',
                background: isActive ? '#1a0a0a' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                borderLeft: `3px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                transition: 'color 0.15s, background 0.15s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--color-text)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--color-muted)'
                }
              }}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
      <div
        style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--color-nav-divider)',
          color: 'var(--color-footer-text)',
          fontSize: 11
        }}
      >
        2026 · Done is better than perfect
      </div>
    </>
  )
}
