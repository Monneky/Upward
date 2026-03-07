import { useState } from 'react'
import { ConnectionsTab } from '@renderer/pages/settings/ConnectionsTab'

type SettingsTab = 'general' | 'connections'

export function Settings(): React.JSX.Element {
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('general')

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: 4
          }}
        >
          Configuración
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          Preferencias y conexiones
        </p>
      </header>

      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: 0
        }}
      >
        <button
          type="button"
          onClick={() => setSettingsTab('general')}
          style={{
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: settingsTab === 'general' ? 'var(--color-primary)' : 'var(--color-muted)',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${settingsTab === 'general' ? 'var(--color-primary)' : 'transparent'}`,
            marginBottom: -1,
            cursor: 'pointer'
          }}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab('connections')}
          style={{
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: settingsTab === 'connections' ? 'var(--color-primary)' : 'var(--color-muted)',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${settingsTab === 'connections' ? 'var(--color-primary)' : 'transparent'}`,
            marginBottom: -1,
            cursor: 'pointer'
          }}
        >
          Conexiones
        </button>
      </div>

      {settingsTab === 'general' && (
        <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          Opciones generales (próximamente).
        </div>
      )}

      {settingsTab === 'connections' && <ConnectionsTab />}
    </div>
  )
}
