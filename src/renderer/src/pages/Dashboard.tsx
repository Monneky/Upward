import { useEffect } from 'react'
import { useGoalsStore } from '@renderer/store/goalsStore'

export function Dashboard() {
  const { goals, habits, fetchGoals, fetchHabits } = useGoalsStore()

  useEffect(() => {
    fetchGoals()
    fetchHabits()
  }, [fetchGoals, fetchHabits])

  return (
    <div className="flex flex-1 flex-col p-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-100">Dashboard</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h3 className="mb-2 text-sm font-medium text-gray-400">Goals</h3>
          <p className="text-3xl font-bold text-gray-100">{goals.length}</p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h3 className="mb-2 text-sm font-medium text-gray-400">Habits</h3>
          <p className="text-3xl font-bold text-gray-100">{habits.length}</p>
        </div>
      </div>
    </div>
  )
}
