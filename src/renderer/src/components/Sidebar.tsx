export type Page = 'dashboard' | 'goals' | 'habits' | 'calendar' | 'projects'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'goals', label: 'Goals' },
  { id: 'habits', label: 'Habits' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'projects', label: 'Projects' }
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <>
      <div style={{ padding: 24 }}>
        <h1
          style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: 700
          }}
        >
          🧭 Upward
        </h1>
      </div>
      <div
        style={{
          height: 1,
          background: '#1f1f1f',
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
                color: isActive ? '#E63946' : '#555',
                borderLeft: `3px solid ${isActive ? '#E63946' : 'transparent'}`,
                transition: 'color 0.15s, background 0.15s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#888'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#555'
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
          borderTop: '1px solid #1f1f1f',
          color: '#333',
          fontSize: 11
        }}
      >
        2026 · Done is better than perfect
      </div>
    </>
  )
}
