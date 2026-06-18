import { useEffect } from 'react'
import { useProjectsStore } from '@renderer/store/projectsStore'

interface ProjectDetailProps {
  projectId: number
  onBack: () => void
}

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: '#10B981' },
  medium: { label: 'Media', color: '#F59E0B' },
  high: { label: 'Alta', color: '#e63946' }
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps): React.JSX.Element {
  const { projects, fetchProjects } = useProjectsStore()
  const project = projects.find((p) => p.id === projectId)

  useEffect(() => {
    if (projects.length === 0) fetchProjects()
  }, [projects.length, fetchProjects])

  if (!project) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button type="button" onClick={onBack} style={backButtonStyle}>
          ← Volver a proyectos
        </button>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Cargando proyecto…</p>
      </div>
    )
  }

  const prio = PRIORITY_META[project.priority] ?? PRIORITY_META.medium

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <button type="button" onClick={onBack} style={backButtonStyle}>
        ← Volver a proyectos
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <span style={{ fontSize: 40, lineHeight: 1 }} aria-hidden>
          📁
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
          {project.name}
        </h1>
      </div>

      <div
        style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 999,
            background: prio.color,
            color: '#fff'
          }}
        >
          Prioridad: {prio.label}
        </span>
        {project.category && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 999,
              background: 'transparent',
              color: 'var(--color-muted)',
              border: '1px solid var(--color-card-border)'
            }}
          >
            {project.category}
          </span>
        )}
        {project.deadline && (
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>📅 {project.deadline}</span>
        )}
      </div>

    </div>
  )
}

const backButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--color-muted)',
  fontSize: 14,
  cursor: 'pointer',
  padding: 0,
  marginBottom: 20
}
