import { useEffect, useMemo } from 'react'
import { useGoalsStore } from '@renderer/store/goalsStore'
import { useConnectionsStore } from '@renderer/store/connectionsStore'
import { Card } from '@renderer/components/Card'
import { ProgressBar } from '@renderer/components/ProgressBar'
import { CircularProgress } from '@renderer/components/CircularProgress'
import { EmptyState } from '@renderer/components/EmptyState'
import { NextEventCountdown } from '@renderer/components/dashboard/NextEventCountdown'

export function Dashboard() {
  const { goals, fetchGoals, fetchHabits } = useGoalsStore()
  const {
    googleCalendarStatus,
    nextEvent,
    fetchStatus,
    fetchNextEvent
  } = useConnectionsStore()

  useEffect(() => {
    fetchGoals()
    fetchHabits()
  }, [fetchGoals, fetchHabits])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (googleCalendarStatus === 'connected') {
      fetchNextEvent()
    }
  }, [googleCalendarStatus, fetchNextEvent])

  const completedCount = useMemo(
    () => goals.filter((g) => g.progress >= g.target).length,
    [goals]
  )
  const inProgressCount = useMemo(
    () => goals.filter((g) => g.progress < g.target).length,
    [goals]
  )
  const overallPct = useMemo(() => {
    if (goals.length === 0) return 0
    const sum = goals.reduce((s, g) => {
      if (!g.target) return s
      return s + (g.progress / g.target) * 100
    }, 0)
    return Math.round(sum / goals.length)
  }, [goals])

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof goals>()
    for (const g of goals) {
      const key = g.category || 'Uncategorized'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(g)
    }
    return Array.from(map.entries())
  }, [goals])

  const categoryProgress = (items: typeof goals) => {
    if (items.length === 0) return 0
    const sum = items.reduce((s, g) => {
      if (!g.target) return s
      return s + (g.progress / g.target) * 100
    }, 0)
    return sum / items.length
  }

  const statCards = [
    { label: 'Total Goals', value: goals.length },
    { label: 'Completed', value: completedCount },
    { label: 'In Progress', value: inProgressCount },
    { label: 'Overall %', value: `${overallPct}%` }
  ]

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
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          Overview of your goals and progress
        </p>
      </header>

      {googleCalendarStatus === 'connected' && (
        <NextEventCountdown
          event={nextEvent}
          hasConnection={true}
        />
      )}

      <section
        className="dashboard-stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 40
        }}
      >
        {statCards.map(({ label, value }) => (
          <Card key={label} style={{ padding: '20px 24px' }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                marginBottom: 8
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#E63946'
              }}
            >
              {value}
            </p>
          </Card>
        ))}
      </section>

      {byCategory.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: 16
            }}
          >
            By category
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 16
            }}
          >
            {byCategory.map(([category, items]) => (
              <Card key={category} style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <CircularProgress
                    value={categoryProgress(items)}
                    size={88}
                    label={category}
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 16
          }}
        >
          All goals
        </h2>
        {goals.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No goals yet"
            description="Add your first goal to see it here."
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
                        <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                          {goal.title}
                        </span>
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
      </section>
    </div>
  )
}
