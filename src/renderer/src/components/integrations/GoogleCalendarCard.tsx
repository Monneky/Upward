import { useEffect } from 'react'
import { Card } from '@renderer/components/Card'
import { useConnectionsStore } from '@renderer/store/connectionsStore'

export function GoogleCalendarCard(): React.JSX.Element {
  const {
    googleCalendarStatus,
    googleCalendarEmail,
    googleCalendarLastSyncAt,
    error,
    canStoreTokens,
    fetchStatus,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncGoogleCalendar,
    clearError
  } = useConnectionsStore()

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const loading = googleCalendarStatus === 'loading'
  const connected = googleCalendarStatus === 'connected'
  const isError = googleCalendarStatus === 'error'

  const lastSyncText = googleCalendarLastSyncAt
    ? `Última sincronización: ${new Date(googleCalendarLastSyncAt).toLocaleString()}`
    : null

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: 4
              }}
            >
              Google Calendar
            </h3>
            {connected && googleCalendarEmail && (
              <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                Conectado como {googleCalendarEmail}
              </p>
            )}
            {!connected && !isError && (
              <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                No conectado
              </p>
            )}
            {lastSyncText && (
              <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>
                {lastSyncText}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {connected && (
              <>
                <button
                  type="button"
                  onClick={() => syncGoogleCalendar()}
                  disabled={loading}
                  style={{
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-primary)',
                    background: 'transparent',
                    border: '1px solid var(--color-primary)',
                    borderRadius: 8,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  Sincronizar ahora
                </button>
                <button
                  type="button"
                  onClick={() => disconnectGoogleCalendar()}
                  disabled={loading}
                  style={{
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-muted)',
                    background: 'transparent',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 8,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  Desconectar
                </button>
              </>
            )}
            {!connected && (
              <button
                type="button"
                className="btn-cta"
                disabled={loading || !canStoreTokens}
                onClick={() => connectGoogleCalendar()}
                style={{ opacity: loading || !canStoreTokens ? 0.8 : 1 }}
              >
                {loading ? 'Conectando…' : 'Conectar'}
              </button>
            )}
            {isError && (
              <button
                type="button"
                className="btn-cta"
                disabled={loading}
                onClick={() => { clearError(); connectGoogleCalendar() }}
              >
                Reconectar
              </button>
            )}
          </div>
        </div>
        {error && (
          <p
            style={{
              fontSize: 13,
              color: 'var(--color-error, #dc2626)',
              margin: 0
            }}
          >
            {error}
          </p>
        )}
        {!canStoreTokens && !connected && (
          <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
            El cifrado no está disponible en este sistema. No se pueden guardar tokens de forma segura.
          </p>
        )}
      </div>
    </Card>
  )
}
