import { Card } from '@renderer/components/Card'

type ThemeMode = 'light' | 'dark' | 'system'

interface SettingsProps {
  themeMode: ThemeMode
  onChangeThemeMode: (mode: ThemeMode) => void
}

const THEME_OPTIONS: { value: ThemeMode; icon: string; label: string; description: string }[] = [
  { value: 'light', icon: '☀️', label: 'Claro', description: 'Siempre usa el tema claro' },
  { value: 'dark', icon: '🌙', label: 'Oscuro', description: 'Siempre usa el tema oscuro' },
  {
    value: 'system',
    icon: '💻',
    label: 'Sistema',
    description: 'Sigue la configuración de tu computadora'
  }
]

export function Settings({ themeMode, onChangeThemeMode }: SettingsProps): React.JSX.Element {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>Ajustes</h1>
        <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>
          Personaliza tu experiencia
        </p>
      </header>

      <section>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-muted)',
            marginBottom: 12
          }}
        >
          Apariencia
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {THEME_OPTIONS.map((option) => {
            const isActive = themeMode === option.value
            return (
              <Card
                key={option.value}
                role="button"
                tabIndex={0}
                onClick={() => onChangeThemeMode(option.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChangeThemeMode(option.value)
                  }
                }}
                style={{
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-card-border)',
                  background: isActive ? 'var(--color-selection-bg)' : 'var(--color-card-bg)'
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1 }} aria-hidden>
                  {option.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text)'
                    }}
                  >
                    {option.label}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>
                    {option.description}
                  </p>
                </div>
                <span
                  aria-hidden
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    flexShrink: 0,
                    border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-card-border)'}`,
                    background: isActive ? 'var(--color-primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 12
                  }}
                >
                  {isActive ? '✓' : ''}
                </span>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
