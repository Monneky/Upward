import { useEffect } from 'react'
import { useGoalsStore } from '@renderer/store/goalsStore'

export function Habits() {
  const { habits, fetchHabits } = useGoalsStore()

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  return (
    <div className="flex flex-1 flex-col p-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-100">Habits</h2>
      {habits.length === 0 ? (
        <p className="text-gray-400">No habits yet.</p>
      ) : (
        <ul className="space-y-2">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="rounded-lg border border-gray-700 bg-gray-800 p-4"
            >
              <span className="font-medium text-gray-100">{habit.title}</span>
              <span className="ml-2 text-sm text-gray-400">
                {habit.completedDays} days
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
