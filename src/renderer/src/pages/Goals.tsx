import { useEffect, useState } from 'react'
import { useGoalsStore } from '@renderer/store/goalsStore'
import { Card } from '@renderer/components/Card'
import { ProgressBar } from '@renderer/components/ProgressBar'
import { EmptyState } from '@renderer/components/EmptyState'

export function Goals() {
  const { goals, fetchGoals, addGoal } = useGoalsStore()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const targetNum = parseInt(target, 10)
    if (!title.trim()) {
      setError('El título es obligatorio')
      return
    }
    if (!category.trim()) {
      setError('La categoría es obligatoria')
      return
    }
    if (isNaN(targetNum) || targetNum < 1) {
      setError('El objetivo debe ser un número mayor a 0')
      return
    }
    if (!unit.trim()) {
      setError('La unidad es obligatoria')
      return
    }
    setSubmitting(true)
    try {
      await addGoal({
        title: title.trim(),
        category: category.trim(),
        target: targetNum,
        unit: unit.trim(),
        deadline: deadline.trim() || undefined,
        notes: notes.trim() || undefined
      })
      setTitle('')
      setCategory('')
      setTarget('')
      setUnit('')
      setDeadline('')
      setNotes('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el goal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <header
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 4
            }}
          >
            Goals
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Track and complete your objectives
          </p>
        </div>
        <button
          type="button"
          className="btn-cta"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : '+ Añadir goal'}
        </button>
      </header>

      {showForm && (
        <Card style={{ padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <p style={{ color: '#E63946', fontSize: 13 }}>{error}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Leer 12 libros"
                required
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Categoría *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Aprendizaje"
                required
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Objetivo *</label>
                <input
                  type="number"
                  min={1}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="12"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Unidad *</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Ej: libros"
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Fecha límite (opcional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales..."
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="btn-cta" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Crear goal'}
            </button>
          </form>
        </Card>
      )}

      {goals.length === 0 && !showForm ? (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          description="Create a goal to get started."
        />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {goals.map((goal) => {
            const pct =
              goal.target > 0
                ? Math.min(100, (goal.progress / goal.target) * 100)
                : 0
            return (
              <li key={goal.id}>
                <Card style={{ padding: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                      <div>
                        <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                          {goal.title}
                        </span>
                        {goal.category && (
                          <p style={{ marginTop: 4, fontSize: 12, color: 'var(--color-muted)' }}>
                            {goal.category}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>
                        {goal.progress} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <ProgressBar value={pct} />
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
