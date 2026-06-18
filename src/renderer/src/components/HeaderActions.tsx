import type { CSSProperties } from 'react'
import { Dropdown } from '@renderer/components/Dropdown'
import type { DropdownItem } from '@renderer/components/Dropdown'

interface HeaderActionsProps {
  moreItems?: DropdownItem[]
  addItems?: DropdownItem[]
  className?: string
  style?: CSSProperties
}

const moreButtonStyle: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid var(--color-card-border)',
  background: 'transparent',
  color: 'var(--color-text)',
  cursor: 'pointer',
  fontSize: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const addButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--color-primary)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer'
}

export function HeaderActions({
  moreItems,
  addItems,
  className = '',
  style
}: HeaderActionsProps): React.JSX.Element {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <Dropdown
        triggerContent="…"
        triggerStyle={moreButtonStyle}
        triggerAriaLabel="Más acciones"
        items={moreItems}
        align="right"
      />
      <Dropdown
        triggerContent={
          <>
            <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>
              +
            </span>
            Agregar
          </>
        }
        triggerStyle={addButtonStyle}
        triggerAriaLabel="Agregar"
        items={addItems}
        align="right"
      />
    </div>
  )
}
