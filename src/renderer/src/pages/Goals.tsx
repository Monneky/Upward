import { useEffect } from 'react'
import { useGoalsStore } from '@renderer/store/goalsStore'
import { Card } from '@renderer/components/Card'
import { ProgressBar } from '@renderer/components/ProgressBar'
import { EmptyState } from '@renderer/components/EmptyState'

export function Goals() {
  const { goals, fetchGoals } = useGoalsStore()

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

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
          Goals
        </h1>
        <p style={{ fontSize: 13, color: '#444' }}>
          Track and complete your objectives
        </p>
      </header>

      {goals.length === 0 ? (
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
                        <span style={{ fontWeight: 500, color: '#F0EAD6' }}>
                          {goal.title}
                        </span>
                        {goal.category && (
                          <p style={{ marginTop: 4, fontSize: 12, color: '#444' }}>
                            {goal.category}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 14, color: '#888' }}>
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
