import { useEffect } from 'react'
import { useGoalsStore } from '@renderer/store/goalsStore'

export function Goals() {
  const { goals, fetchGoals } = useGoalsStore()

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return (
    <div className="flex flex-1 flex-col p-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-100">Goals</h2>
      {goals.length === 0 ? (
        <p className="text-gray-400">No goals yet.</p>
      ) : (
        <ul className="space-y-2">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className="rounded-lg border border-gray-700 bg-gray-800 p-4"
            >
              <span className="font-medium text-gray-100">{goal.title}</span>
              <span className="ml-2 text-sm text-gray-400">
                {goal.progress}/{goal.target} {goal.unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
