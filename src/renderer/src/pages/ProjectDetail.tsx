import { useEffect, useMemo, useState } from 'react'
import { useProjectsStore } from '@renderer/store/projectsStore'
import { useTasksStore } from '@renderer/store/tasksStore'
import { useKanbanStore } from '@renderer/store/kanbanStore'
import { HeaderActions } from '@renderer/components/HeaderActions'
import { ProjectDescriptionCard } from '@renderer/components/ProjectDescriptionCard'
import { Dropdown } from '@renderer/components/Dropdown'

interface ProjectDetailProps {
  projectId: number
  onBack: () => void
}

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: '#10B981' },
  medium: { label: 'Media', color: '#F59E0B' },
  high: { label: 'Alta', color: '#e63946' }
}

const PRIORITIES: { value: string; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' }
]

type TaskFilter = 'todas' | 'pendientes' | 'enProgreso' | 'completas'

const STATUS_BUCKETS: { value: TaskFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'enProgreso', label: 'En progreso' },
  { value: 'completas', label: 'Completas' }
]

function columnBucket(name = ''): Exclude<TaskFilter, 'todas'> {
  const n = name.toLowerCase()
  if (n === 'done' || n.includes('completad')) return 'completas'
  if (n.includes('progres') || n.includes('review')) return 'enProgreso'
  return 'pendientes' // Backlog and anything else
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: '#10B981' },
  paused: { label: 'Pausado', color: '#F59E0B' },
  completed: { label: 'Completado', color: '#6B7280' }
}

interface TaskFormState {
  title: string
  description: string
  deadline: string
  priority: string
  columnId: string
}

const emptyTaskForm: TaskFormState = {
  title: '',
  description: '',
  deadline: '',
  priority: 'medium',
  columnId: ''
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps): React.JSX.Element {
  const { projects, fetchProjects } = useProjectsStore()
  const { tasks, fetchTasks, addTask } = useTasksStore()
  const { columns, fetchColumns } = useKanbanStore()

  const [activeTab, setActiveTab] = useState<'resumen' | 'tareas' | 'archivos'>('resumen')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyTaskForm)
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('todas')
  const [taskSearch, setTaskSearch] = useState('')
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set())

  const project = projects.find((p) => p.id === projectId)

  useEffect(() => {
    if (projects.length === 0) fetchProjects()
  }, [projects.length, fetchProjects])

  useEffect(() => {
    fetchColumns(projectId)
    fetchTasks(projectId)
  }, [projectId, fetchColumns, fetchTasks])

  const projectColumns = useMemo(
    () => columns.filter((c) => c.projectId === projectId),
    [columns, projectId]
  )
  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === projectId),
    [tasks, projectId]
  )

  const filteredTasks = useMemo(() => {
    const query = taskSearch.trim().toLowerCase()
    return projectTasks.filter((task) => {
      if (query && !task.title.toLowerCase().includes(query)) return false
      if (taskFilter === 'todas') return true
      const column = projectColumns.find((c) => c.id === task.columnId)
      return columnBucket(column?.name) === taskFilter
    })
  }, [projectTasks, projectColumns, taskSearch, taskFilter])

  const allFilteredSelected =
    filteredTasks.length > 0 && filteredTasks.every((t) => selectedTaskIds.has(t.id))

  const toggleAll = (): void => {
    setSelectedTaskIds((prev) => {
      if (filteredTasks.length > 0 && filteredTasks.every((t) => prev.has(t.id))) {
        return new Set()
      }
      return new Set(filteredTasks.map((t) => t.id))
    })
  }

  const toggleOne = (id: number): void => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openTaskModal = (): void => {
    setTaskForm({ ...emptyTaskForm, columnId: projectColumns[0]?.id.toString() ?? '' })
    setShowTaskModal(true)
  }

  const closeTaskModal = (): void => {
    setShowTaskModal(false)
    setTaskForm(emptyTaskForm)
  }

  const handleCreateTask = async (): Promise<void> => {
    if (!taskForm.title.trim() || !taskForm.columnId) return
    await addTask({
      projectId,
      columnId: Number(taskForm.columnId),
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || undefined,
      priority: taskForm.priority,
      deadline: taskForm.deadline || undefined
    })
    closeTaskModal()
  }

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
  const status = STATUS_META[project.status] ?? STATUS_META.active
  const canSubmit = taskForm.title.trim().length > 0 && taskForm.columnId !== ''

  return (
    <div>
      <button type="button" onClick={onBack} style={backButtonStyle}>
        ← Volver a proyectos
      </button>

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}
      >
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 20
        }}
      >
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
          <span
            style={{
              fontSize: 13,
              color: 'var(--color-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ fontSize: 14 }}>📅</span> Fecha limite: {project.deadline}
          </span>
        )}
        <span
          style={{
            fontSize: 13,
            color: 'var(--color-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: status.color,
              display: 'inline-block'
            }}
          />
          Estado: {status.label}
        </span>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid var(--color-card-border)',
          marginBottom: 24
        }}
      >
        {(['resumen', 'tareas', 'archivos'] as const).map((tab) => {
          const isActive = activeTab === tab
          const icons = { resumen: '📋', tareas: '☑️', archivos: '📎' }
          const labels = { resumen: 'Resumen', tareas: 'Tareas', archivos: 'Archivos' }
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

      {activeTab === 'resumen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ProjectDescriptionCard project={project} />
        </div>
      )}

      {activeTab === 'tareas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Tareas
            </h2>
            <button
              type="button"
              onClick={openTaskModal}
              style={{
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
              }}
            >
              <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>
                +
              </span>
              Nueva tarea
            </button>
          </div>

          {/* Filter + search row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {STATUS_BUCKETS.map((bucket) => {
                const isActive = taskFilter === bucket.value
                return (
                  <button
                    key={bucket.value}
                    type="button"
                    onClick={() => setTaskFilter(bucket.value)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: isActive ? 'var(--color-primary)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--color-muted)',
                      border: isActive
                        ? '1px solid var(--color-primary)'
                        : '1px solid var(--color-card-border)'
                    }}
                  >
                    {bucket.label}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                style={{ ...inputStyle, width: 220 }}
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="🔍  Buscar tarea…"
              />
              <Dropdown
                triggerContent={<span aria-hidden>⋯</span>}
                triggerStyle={iconButtonStyle}
                triggerAriaLabel="Opciones de búsqueda"
              />
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--color-card-border)',
              borderRadius: 12,
              overflow: 'hidden'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--color-card-bg)' }}>
                  <th style={{ ...thStyle, width: 44, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                      aria-label="Seleccionar todas las tareas"
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={thStyle}>Tarea</th>
                  <th style={thStyle}>Prioridad</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Fecha límite</th>
                  <th style={{ ...thStyle, width: 50, textAlign: 'right' }}>⋯</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: '20px 14px',
                        textAlign: 'center',
                        color: 'var(--color-muted)'
                      }}
                    >
                      {projectTasks.length === 0
                        ? 'Aún no hay tareas. Crea la primera con “Nueva tarea”.'
                        : 'No hay tareas que coincidan.'}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const tp = PRIORITY_META[task.priority] ?? PRIORITY_META.medium
                    const column = projectColumns.find((c) => c.id === task.columnId)
                    return (
                      <tr key={task.id} style={{ borderTop: '1px solid var(--color-card-border)' }}>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.has(task.id)}
                            onChange={() => toggleOne(task.id)}
                            aria-label={`Seleccionar ${task.title}`}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                            {task.title}
                          </span>
                          {task.description && (
                            <span
                              style={{
                                display: 'block',
                                fontSize: 12,
                                color: 'var(--color-muted)',
                                marginTop: 2
                              }}
                            >
                              {task.description}
                            </span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: 999,
                              background: tp.color,
                              color: '#fff'
                            }}
                          >
                            {tp.label}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {column ? (
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
                              {column.name}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--color-muted)' }}>
                          {task.deadline ? `📅 ${task.deadline}` : '—'}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <Dropdown
                            triggerContent={<span aria-hidden>⋯</span>}
                            triggerStyle={iconButtonStyle}
                            triggerAriaLabel={`Acciones de ${task.title}`}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'archivos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} />
      )}

      {showTaskModal && (
        <div style={overlayStyle} onClick={closeTaskModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: '0 0 20px'
              }}
            >
              Nueva tarea
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre</label>
              <input
                style={inputStyle}
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="¿Qué hay que hacer?"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Descripción</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
                value={taskForm.description}
                onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detalles de la tarea (opcional)"
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Prioridad</label>
                <select
                  style={inputStyle}
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
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
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Etapa</label>
              <select
                style={inputStyle}
                value={taskForm.columnId}
                onChange={(e) => setTaskForm((f) => ({ ...f, columnId: e.target.value }))}
              >
                {projectColumns.length === 0 && <option value="">Sin etapas disponibles</option>}
                {projectColumns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={closeTaskModal}
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
                onClick={handleCreateTask}
                disabled={!canSubmit}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  opacity: canSubmit ? 1 : 0.5
                }}
              >
                Crear tarea
              </button>
            </div>
          </div>
        </div>
      )}
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
  justifyContent: 'center',
  flexShrink: 0
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--color-muted)'
}

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  color: 'var(--color-text)',
  verticalAlign: 'middle'
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
  fontSize: 14,
  boxSizing: 'border-box'
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1000
}

const modalStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 520,
  background: 'var(--color-bg)',
  border: '1px solid var(--color-card-border)',
  borderRadius: 14,
  padding: 24,
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
}
