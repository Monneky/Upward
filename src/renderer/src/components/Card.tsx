import type { CSSProperties, ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function Card({ children, className = '', style, ...rest }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 12,
        ...style
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
