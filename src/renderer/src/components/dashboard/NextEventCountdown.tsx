import { useEffect, useState } from 'react'
import { Card } from '@renderer/components/Card'
import { EmptyState } from '@renderer/components/EmptyState'
import { formatCountdown } from '@renderer/utils/countdown'
import type { NextEvent } from '@renderer/store/connectionsStore'

interface NextEventCountdownProps {
  event: NextEvent | null
  hasConnection: boolean
}

export function NextEventCountdown({ event, hasConnection }: NextEventCountdownProps): React.JSX.Element | null {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (!event) return
    const update = (): void => {
      const text = formatCountdown(event.startAt, event.endAt)
      setCountdown(text)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [event])

  if (!hasConnection) return null

  if (event && countdown) {
    return (
      <Card style={{ padding: 20, marginBottom: 24 }}>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-muted)',
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          Próximo evento
        </h3>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 4
          }}
        >
          {event.title}
        </p>
        <p style={{ fontSize: 14, color: 'var(--color-primary)' }}>{countdown}</p>
      </Card>
    )
  }

  if (event && !countdown) {
    return null
  }

  return (
    <Card style={{ padding: 20, marginBottom: 24 }}>
      <EmptyState
        title="No hay juntas próximas"
        description="No tienes eventos futuros en tu calendario o sincroniza en Settings."
      />
    </Card>
  )
}
