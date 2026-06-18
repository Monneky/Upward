import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '@renderer/types'
import { useProjectsStore } from '@renderer/store/projectsStore'
import { SectionCard } from '@renderer/components/SectionCard'

interface ProjectDescriptionCardProps {
  project: Project
}

const textareaStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-card-border)',
  background: 'var(--color-input-bg)',
  color: 'var(--color-text)',
  fontSize: 14,
  minHeight: 120,
  resize: 'vertical',
  fontFamily: 'inherit'
}

const primaryButtonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--color-primary)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer'
}

const secondaryButtonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid var(--color-card-border)',
  background: 'transparent',
  color: 'var(--color-muted)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer'
}

export function ProjectDescriptionCard({
  project
}: ProjectDescriptionCardProps): React.JSX.Element {
  const updateProject = useProjectsStore((s) => s.updateProject)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(project.description)
  const [saving, setSaving] = useState(false)

  const startEditing = (): void => {
    setDraft(project.description)
    setEditing(true)
  }

  const cancelEditing = (): void => {
    setDraft(project.description)
    setEditing(false)
  }

  const save = async (): Promise<void> => {
    setSaving(true)
    await updateProject(project.id, { description: draft })
    setSaving(false)
    setEditing(false)
  }

  const editButton = !editing && (
    <button
      type="button"
      onClick={startEditing}
      aria-label="Editar descripción"
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--color-muted)',
        fontSize: 16,
        cursor: 'pointer',
        padding: 4,
        lineHeight: 1
      }}
    >
      ✏️
    </button>
  )

  return (
    <SectionCard title="Descripción del proyecto" action={editButton}>
      {editing ? (
        <div>
          <textarea
            style={textareaStyle}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Describe tu proyecto…"
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={save} disabled={saving} style={primaryButtonStyle}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              style={secondaryButtonStyle}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--color-selection-bg)',
            borderRadius: 8,
            padding: 16,
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            color: project.description ? 'var(--color-text)' : 'var(--color-muted)'
          }}
        >
          {project.description || 'Sin descripción todavía.'}
        </div>
      )}
    </SectionCard>
  )
}
