import type React from 'react'

export type Page = 'routine' | 'settings'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: { id: Page; label: string }[] = [{ id: 'routine', label: 'Routine' }]

export function Sidebar({ currentPage, onNavigate }: SidebarProps): React.JSX.Element {
  const settingsActive = currentPage === 'settings'

  return (
    <>
      <div
        style={{
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <h1
          style={{
            color: 'var(--color-text)',
            fontSize: 20,
            fontWeight: 700
          }}
        >
          🧭 Upward
        </h1>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          title="Ajustes"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 999,
            border: `1px solid ${settingsActive ? 'var(--color-primary)' : 'var(--color-border-subtle)'}`,
            background: settingsActive ? 'var(--color-selection-bg)' : 'var(--color-card-bg)',
            fontSize: 16,
            cursor: 'pointer'
          }}
          aria-label="Ajustes"
        >
          <span aria-hidden>⚙️</span>
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
                background: isActive ? 'var(--color-selection-bg)' : 'transparent',
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
