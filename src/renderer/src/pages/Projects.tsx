import { useEffect, useState } from 'react'
import { useProjectsStore } from '@renderer/store/projectsStore'
import { Card } from '@renderer/components/Card'
import { EmptyState } from '@renderer/components/EmptyState'
import type { Project } from '@renderer/types'

interface ProjectsProps {
  onOpenProject: (id: number) => void
}

interface FormState {
  name: string
  description: string
  priority: string
  category: string
  deadline: string
}

const emptyForm: FormState = {
  name: '',
  description: '',
  priority: 'medium',
  category: '',
  deadline: ''
}

const PRIORITIES: { value: string; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' }
]

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: '#10B981' },
  medium: { label: 'Media', color: '#F59E0B' },
  high: { label: 'Alta', color: '#e63946' }
}

export function Projects({ onOpenProject }: ProjectsProps): React.JSX.Element {
  const { projects, fetchProjects, addProject, updateProject, deleteProject } = useProjectsStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const openCreate = (): void => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (project: Project): void => {
    setEditingId(project.id)
    setForm({
      name: project.name,
      description: project.description,
      priority: project.priority,
      category: project.category ?? '',
      deadline: project.deadline ?? ''
    })
    setShowForm(true)
  }

  const closeForm = (): void => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (): Promise<void> => {
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      priority: form.priority,
      category: form.category.trim() || undefined,
      deadline: form.deadline || undefined
    }
    if (editingId != null) {
      await updateProject(editingId, payload)
    } else {
      await addProject(payload)
    }
    closeForm()
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-muted)',
    marginBottom: 6,
    display: 'block'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--color-card-border)',
    background: 'var(--color-card-bg)',
    color: 'var(--color-text)',
    fontSize: 14
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>Proyectos</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>
            Organiza tu trabajo por proyecto
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Nuevo proyecto
          </button>
        )}
      </div>

      {showForm && (
        <Card style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nombre</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Mi proyecto"
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Descripción</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="¿De qué trata este proyecto?"
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Prioridad</label>
              <select
                style={inputStyle}
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Fecha límite (opcional)</label>
              <input
                type="date"
                style={inputStyle}
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Categoría</label>
            <input
              style={inputStyle}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Opcional (ej. Trabajo, Personal)"
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={closeForm}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid var(--color-card-border)',
                background: 'transparent',
                color: 'var(--color-muted)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: form.name.trim() ? 'pointer' : 'not-allowed',
                opacity: form.name.trim() ? 1 : 0.5
              }}
            >
              {editingId != null ? 'Guardar' : 'Crear proyecto'}
            </button>
          </div>
        </Card>
      )}

      {projects.length === 0 && !showForm ? (
        <EmptyState
          icon="📁"
          title="Aún no hay proyectos"
          description="Crea tu primer proyecto para empezar a organizar tu trabajo."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 14
          }}
        >
          {projects.map((project) => {
            const prio = PRIORITY_META[project.priority] ?? PRIORITY_META.medium
            return (
              <Card
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                style={{
                  padding: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8
                  }}
                >
                  <span style={{ fontSize: 32, lineHeight: 1 }} aria-hidden>
                    📁
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(project)
                      }}
                      style={iconButtonStyle}
                      aria-label="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(project.id)
                      }}
                      style={iconButtonStyle}
                      aria-label="Borrar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {project.name}
                </h3>

                {project.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--color-muted)',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {project.description}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
                    {prio.label}
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
                    <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                      📅 {project.deadline}
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

const iconButtonStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid var(--color-card-border)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
