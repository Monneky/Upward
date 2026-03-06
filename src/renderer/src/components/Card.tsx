import type { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: '#111',
        border: '1px solid #1f1f1f',
        borderRadius: 12,
        ...style
      }}
    >
      {children}
    </div>
  )
}
