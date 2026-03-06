import { useId } from 'react'

interface CircularProgressProps {
  value: number
  size?: number
  label?: string
}

export function CircularProgress({
  value,
  size = 64,
  label
}: CircularProgressProps) {
  const id = useId().replace(/:/g, '')
  const gradientId = `norteRedGradient-${id}`
  const pct = Math.min(100, Math.max(0, value))
  const stroke = 4
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1f1f1f"
            strokeWidth={stroke}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s' }}
          />
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#E63946" />
              <stop offset="100%" stopColor="#FF6B6B" />
            </linearGradient>
          </defs>
        </svg>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.22,
            fontWeight: 600,
            color: '#F0EAD6'
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: 2,
            color: '#444',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
