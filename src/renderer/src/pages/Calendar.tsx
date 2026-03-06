import { useEffect, useMemo, useState } from 'react'
import { useGoalsStore } from '@renderer/store/goalsStore'
import { Card } from '@renderer/components/Card'
import type { Goal } from '@renderer/types'

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseDeadline(deadline: string | null): string | null {
  if (!deadline || !deadline.trim()) return null
  const d = new Date(deadline)
  if (isNaN(d.getTime())) return null
  return toDateKey(d)
}

export function Calendar() {
  const { goals, fetchGoals } = useGoalsStore()
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const goalsByDeadline = useMemo(() => {
    const map = new Map<string, Goal[]>()
    for (const g of goals) {
      const key = parseDeadline(g.deadline)
      if (key) {
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(g)
      }
    }
    return map
  }, [goals])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const prevMonth = () => setViewDate(new Date(year, month - 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1))
  const today = () => setViewDate(new Date())

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: 4
          }}
        >
          Calendario
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          Deadlines de tus goals
        </p>
      </header>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-text)'
            }}
          >
            {MONTHS[month]} {year}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={prevMonth}
              style={{
                padding: '6px 12px',
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 8,
                color: 'var(--color-muted)',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={today}
              style={{
                padding: '6px 12px',
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 8,
                color: 'var(--color-muted)',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={nextMonth}
              style={{
                padding: '6px 12px',
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 8,
                color: 'var(--color-muted)',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              →
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4
          }}
        >
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              style={{
                padding: 8,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-muted)',
                textAlign: 'center'
              }}
            >
              {day}
            </div>
          ))}
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} />
            }
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const hasDeadline = goalsByDeadline.has(dateKey)
            const isSelected = selectedDate === dateKey
            const isToday =
              toDateKey(new Date()) === dateKey

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                style={{
                  padding: 10,
                  background: isSelected ? '#1a0a0a' : 'transparent',
                  border: `1px solid ${isToday ? '#E63946' : 'transparent'}`,
                  borderRadius: 8,
                  color: hasDeadline ? 'var(--color-text)' : 'var(--color-muted)',
                  fontSize: 14,
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {day}
                {hasDeadline && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      background: '#E63946'
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {selectedDate && goalsByDeadline.has(selectedDate) && (
        <Card style={{ padding: 24 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
                  color: 'var(--color-muted)',
              marginBottom: 12
            }}
          >
            Goals con deadline el {selectedDate}
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goalsByDeadline.get(selectedDate)!.map((goal) => (
              <li
                key={goal.id}
                style={{
                  padding: 12,
                  background: 'var(--color-card-bg)',
                  borderRadius: 8,
                  border: '1px solid var(--color-card-border)'
                }}
              >
                <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                  {goal.title}
                </span>
                <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--color-muted)' }}>
                  {goal.progress} / {goal.target} {goal.unit}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {goals.filter((g) => g.deadline).length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          No hay goals con deadline. Añade fechas límite en Goals para verlas aquí.
        </p>
      )}
    </div>
  )
}
