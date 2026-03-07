import { GoogleCalendarCard } from '@renderer/components/integrations/GoogleCalendarCard'

export function ConnectionsTab(): React.JSX.Element {
  return (
    <div>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: 16
        }}
      >
        Conexiones
      </h2>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 24 }}>
        Conecta tu cuenta de Google Calendar para ver el próximo evento en el Dashboard.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GoogleCalendarCard />
      </div>
    </div>
  )
}
