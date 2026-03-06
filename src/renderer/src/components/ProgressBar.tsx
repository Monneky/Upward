interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const pct = Math.min(
    100,
    Math.max(0, typeof value === 'number' ? (value <= 1 ? value * 100 : value) : 0)
  )
  return (
    <div
      className={className}
      style={{
        height: 6,
        overflow: 'hidden',
        borderRadius: 9999,
        background: '#1f1f1f'
      }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 9999,
          background: 'linear-gradient(90deg, #E63946, #FF6B6B)',
          transition: 'width 0.5s ease-out'
        }}
      />
    </div>
  )
}
