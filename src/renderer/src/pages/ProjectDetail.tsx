import { useEffect, useState } from 'react'
import { useProjectsStore } from '@renderer/store/projectsStore'
import { HeaderActions } from '@renderer/components/HeaderActions'

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

  const [activeTab, setActiveTab] = useState<'resumen' | 'tareas'>('resumen')
  const prio = PRIORITY_META[project.priority] ?? PRIORITY_META.medium

  const STATUS_META: Record<string, { label: string; color: string }> = {
    active: { label: 'Activo', color: '#10B981' },
    paused: { label: 'Pausado', color: '#F59E0B' },
    completed: { label: 'Completado', color: '#6B7280' }
  }
  const status = STATUS_META[project.status] ?? STATUS_META.active

  return (
    <div>
      <button type="button" onClick={onBack} style={backButtonStyle}>
        ← Volver a proyectos
      </button>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 42, lineHeight: 1 }} aria-hidden>
            📁
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            {project.name}
          </h1>
        </div>
        <HeaderActions />
      </div>

      {/* Info row: priority, deadline, status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 999,
            background: prio.color,
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          Prioridad: {prio.label}
        </span>
        {project.deadline && (
          <span style={{ fontSize: 13, color: 'var(--color-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>📅</span> Fecha limite: {project.deadline}
          </span>
        )}
        <span style={{ fontSize: 13, color: 'var(--color-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: status.color, display: 'inline-block' }} />
          Estado: {status.label}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-card-border)', marginBottom: 24 }}>
        {(['resumen', 'tareas'] as const).map((tab) => {
          const isActive = activeTab === tab
          const icons = { resumen: '📋', tareas: '☑️' }
          const labels = { resumen: 'Resumen', tareas: 'Tareas' }
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-text)' : 'var(--color-muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-text)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{ fontSize: 14 }}>{icons[tab]}</span>
              {labels[tab]}
            </button>
          )
        })}
      </div>

      <div style={{ minHeight: 200 }} />
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
