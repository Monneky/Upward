import type { CSSProperties, ReactNode } from 'react'
import { Card } from '@renderer/components/Card'

interface SectionCardProps {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function SectionCard({
  title,
  action,
  children,
  className = '',
  style
}: SectionCardProps): React.JSX.Element {
  return (
    <Card className={className} style={{ padding: 20, ...style }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  )
}
