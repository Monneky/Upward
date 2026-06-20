import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const closeMenu = useCallback(() => {
    setOpen(false)
    setCoords(null)
  }, [])

  // Callback ref on the portaled menu: fires when the element mounts/unmounts.
  // Reading layout (offsetHeight) and calling setCoords here is safe because it
  // happens outside an effect body — React batches the resulting state update.
  const menuCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      menuRef.current = node
      if (!node || !triggerRef.current) return

      const rect = triggerRef.current.getBoundingClientRect()
      const width = menuWidth ?? 180
      const menuHeight = node.offsetHeight

      let left: number
      if (align === 'right') {
        left = rect.right - width
      } else {
        left = rect.left
      }
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8))

      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      let top: number
      if (rect.bottom + 6 + menuHeight > window.innerHeight - 8 && spaceAbove > spaceBelow) {
        top = rect.top - 6 - menuHeight
      } else {
        top = rect.bottom + 6
      }
      top = Math.max(8, top)

      setCoords({ top, left })
    },
    [align, menuWidth]
  )

  useEffect(() => {
    if (!open) return

    const handleMouseDown = (e: MouseEvent): void => {
      const target = e.target as Node
      const insideWrapper = wrapperRef.current?.contains(target) ?? false
      const insideMenu = menuRef.current?.contains(target) ?? false
      if (!insideWrapper && !insideMenu) {
        closeMenu()
      }
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeMenu()
    }
    const handleScrollOrResize = (): void => {
      closeMenu()
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [open, closeMenu])

  const menu = open
    ? createPortal(
        <div
          ref={menuCallbackRef}
          role="menu"
          style={{
            position: 'fixed',
            top: coords?.top ?? -9999,
            left: coords?.left ?? -9999,
            minWidth: menuWidth ?? 180,
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-card-border)',
            borderRadius: 8,
            padding: 4,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            zIndex: 1000,
            visibility: coords ? 'visible' : 'hidden'
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
                    closeMenu()
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
        </div>,
        document.body
      )
    : null

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerAriaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={triggerStyle}
      >
        {triggerContent}
      </button>

      {menu}
    </div>
  )
}
