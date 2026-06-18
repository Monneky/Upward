import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

export interface DropdownItem {
  label: string
  onClick?: () => void
  icon?: ReactNode
  danger?: boolean
}

interface DropdownProps {
  triggerContent: ReactNode
  triggerStyle?: CSSProperties
  triggerAriaLabel?: string
  items?: DropdownItem[]
  children?: ReactNode
  align?: 'left' | 'right'
  menuWidth?: number
}

export function Dropdown({
  triggerContent,
  triggerStyle,
  triggerAriaLabel,
  items,
  children,
  align = 'right',
  menuWidth
}: DropdownProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleMouseDown = (e: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-label={triggerAriaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={triggerStyle}
      >
        {triggerContent}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            minWidth: menuWidth ?? 180,
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-card-border)',
            borderRadius: 8,
            padding: 4,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            zIndex: 50
          }}
        >
          {children ??
            (items && items.length > 0 ? (
              items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    item.onClick?.()
                    setOpen(false)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-selection-bg)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: item.danger ? 'var(--color-primary)' : 'var(--color-text)'
                  }}
                >
                  {item.icon != null && <span aria-hidden>{item.icon}</span>}
                  {item.label}
                </button>
              ))
            ) : (
              <div style={{ padding: '8px 12px', fontSize: 14, color: 'var(--color-muted)' }}>
                Sin acciones
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
