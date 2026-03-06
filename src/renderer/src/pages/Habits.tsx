import { useEffect, useState } from 'react'
import { useGoalsStore } from '@renderer/store/goalsStore'
import { Card } from '@renderer/components/Card'
import { EmptyState } from '@renderer/components/EmptyState'

export function Habits() {
  const { habits, fetchHabits, addHabit } = useGoalsStore()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim()) {
      setError('El título es obligatorio')
      return
    }
    setSubmitting(true)
    try {
      await addHabit({ title: title.trim() })
      setTitle('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el hábito')
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
            Habits
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Daily routines and streaks
          </p>
        </div>
        <button
          type="button"
          className="btn-cta"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : '+ Añadir hábito'}
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
                placeholder="Ej: Meditar 10 minutos"
                required
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="btn-cta" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Crear hábito'}
            </button>
          </form>
        </Card>
      )}

      {habits.length === 0 && !showForm ? (
        <EmptyState
          icon="✨"
          title="No habits yet"
          description="Add a habit to build consistency."
        />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {habits.map((habit) => (
            <li key={habit.id}>
              <Card style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                    {habit.title}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--color-muted)',
                      background: 'var(--color-card-bg)',
                      padding: '4px 10px',
                      borderRadius: 6
                    }}
                  >
                    {habit.completedDays} days
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
