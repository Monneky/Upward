import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        textAlign: 'center',
          background: 'var(--color-card-bg)',
          border: '1px dashed var(--color-card-border)',
        borderRadius: 12
      }}
    >
      {icon && (
        <span style={{ marginBottom: 16, fontSize: 40, opacity: 0.6 }} aria-hidden>
          {icon}
        </span>
      )}
      <p style={{ fontWeight: 500, color: 'var(--color-muted)' }}>{title}</p>
      {description && (
        <p style={{ marginTop: 4, fontSize: 13, color: 'var(--color-muted)', maxWidth: 280 }}>
          {description}
        </p>
      )}
    </div>
  )
}
