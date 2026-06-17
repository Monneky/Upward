import { useEffect, useState } from 'react'
import { useRoutinesStore } from '@renderer/store/routinesStore'
import { Card } from '@renderer/components/Card'
import { EmptyState } from '@renderer/components/EmptyState'
import type { Routine } from '@renderer/types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DEFAULT_COLOR = '#6366f1'

interface FormState {
  name: string
  emoji: string
  daysOfWeek: string[]
  time: string
  description: string
  color: string
}

const emptyForm: FormState = {
  name: '',
  emoji: '🎯',
  daysOfWeek: [],
  time: '',
  description: '',
  color: DEFAULT_COLOR
}

function parseDays(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function Routines(): React.JSX.Element {
  const { routines, fetchRoutines, addRoutine, updateRoutine, deleteRoutine } = useRoutinesStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    fetchRoutines()
  }, [fetchRoutines])

  const openCreate = (): void => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (routine: Routine): void => {
    setEditingId(routine.id)
    setForm({
      name: routine.name,
      emoji: routine.emoji,
      daysOfWeek: parseDays(routine.daysOfWeek),
      time: routine.time ?? '',
      description: routine.description,
      color: routine.color
    })
    setShowForm(true)
  }

  const closeForm = (): void => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const toggleDay = (day: string): void => {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter((d) => d !== day)
        : [...f.daysOfWeek, day]
    }))
  }

  const handleSubmit = async (): Promise<void> => {
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(),
      emoji: form.emoji.trim() || '🎯',
      daysOfWeek: form.daysOfWeek,
      time: form.time || undefined,
      description: form.description.trim(),
      color: form.color
    }
    if (editingId != null) {
      await updateRoutine(editingId, payload)
    } else {
      await addRoutine(payload)
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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>Routine</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>
            Tus metas convertidas en hábitos.
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
            + Nueva rutina
          </button>
        )}
      </div>

      {showForm && (
        <Card style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 80 }}>
              <label style={labelStyle}>Emoji</label>
              <input
                style={{ ...inputStyle, textAlign: 'center', fontSize: 22 }}
                value={form.emoji}
                maxLength={4}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Nombre</label>
              <input
                style={inputStyle}
                value={form.name}
                placeholder="Ej. Salir a correr"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Días</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DAYS.map((day) => {
                const active = form.daysOfWeek.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 999,
                      border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-card-border)'}`,
                      background: active ? 'var(--color-primary)' : 'transparent',
                      color: active ? '#fff' : 'var(--color-muted)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 140 }}>
              <label style={labelStyle}>Hora</label>
              <input
                type="time"
                style={inputStyle}
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
            </div>
            <div style={{ width: 100 }}>
              <label style={labelStyle}>Color</label>
              <input
                type="color"
                style={{ ...inputStyle, padding: 4, height: 42, cursor: 'pointer' }}
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Descripción / meta</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical', fontFamily: 'inherit' }}
              value={form.description}
              placeholder="¿Qué quieres lograr con esta rutina?"
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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
              {editingId != null ? 'Guardar' : 'Crear rutina'}
            </button>
          </div>
        </Card>
      )}

      {routines.length === 0 && !showForm ? (
        <EmptyState
          icon="🔁"
          title="Aún no tienes rutinas"
          description="Crea tu primera rutina para empezar a construir el hábito."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {routines.map((routine) => {
            const days = parseDays(routine.daysOfWeek)
            return (
              <Card
                key={routine.id}
                style={{
                  padding: 16,
                  borderLeft: `4px solid ${routine.color}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden>
                  {routine.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>
                      {routine.name}
                    </h3>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => openEdit(routine)}
                        style={iconButtonStyle}
                        aria-label="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRoutine(routine.id)}
                        style={iconButtonStyle}
                        aria-label="Borrar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {routine.description && (
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>
                      {routine.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexWrap: 'wrap',
                      marginTop: 10
                    }}
                  >
                    {DAYS.map((day) => {
                      const active = days.includes(day)
                      return (
                        <span
                          key={day}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 999,
                            background: active ? routine.color : 'transparent',
                            color: active ? '#fff' : 'var(--color-muted)',
                            border: `1px solid ${active ? routine.color : 'var(--color-card-border)'}`,
                            opacity: active ? 1 : 0.5
                          }}
                        >
                          {day}
                        </span>
                      )
                    })}
                    {routine.time && (
                      <span style={{ fontSize: 12, color: 'var(--color-muted)', marginLeft: 4 }}>
                        🕒 {routine.time}
                      </span>
                    )}
                  </div>
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
