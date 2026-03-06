import { useEffect } from 'react'
import { useGoalsStore } from '@renderer/store/goalsStore'
import { Card } from '@renderer/components/Card'
import { EmptyState } from '@renderer/components/EmptyState'

export function Habits() {
  const { habits, fetchHabits } = useGoalsStore()

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#F0EAD6',
            marginBottom: 4
          }}
        >
          Habits
        </h1>
        <p style={{ fontSize: 13, color: '#444' }}>
          Daily routines and streaks
        </p>
      </header>

      {habits.length === 0 ? (
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
                  <span style={{ fontWeight: 500, color: '#F0EAD6' }}>
                    {habit.title}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#888',
                      background: '#1f1f1f',
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
