import { create } from 'zustand'
import type { Goal, Habit } from '@renderer/types'

interface GoalsState {
  goals: Goal[]
  habits: Habit[]
  loading: boolean
  error: string | null
  fetchGoals: () => Promise<void>
  fetchHabits: () => Promise<void>
  addGoal: (data: {
    title: string
    category: string
    target: number
    unit: string
    deadline?: string
    notes?: string
  }) => Promise<void>
  updateGoal: (
    id: number,
    data: Partial<{
      title: string
      category: string
      target: number
      unit: string
      progress: number
      deadline: string
      notes: string
    }>
  ) => Promise<void>
  deleteGoal: (id: number) => Promise<void>
  addHabit: (data: { title: string }) => Promise<void>
  updateHabit: (
    id: number,
    data: Partial<{ title: string; completedDays: number }>
  ) => Promise<void>
  deleteHabit: (id: number) => Promise<void>
  incrementHabitDay: (id: number) => Promise<void>
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  habits: [],
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true, error: null })
    try {
      const goals = await window.api.goals.getAll()
      set({ goals })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch goals' })
    } finally {
      set({ loading: false })
    }
  },

  fetchHabits: async () => {
    set({ loading: true, error: null })
    try {
      const habits = await window.api.habits.getAll()
      set({ habits })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch habits' })
    } finally {
      set({ loading: false })
    }
  },

  addGoal: async (data) => {
    try {
      const goal = await window.api.goals.create(data)
      set({ goals: [...get().goals, goal] })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add goal' })
    }
  },

  updateGoal: async (id, data) => {
    try {
      const updated = await window.api.goals.update(id, data)
      set({
        goals: get().goals.map((g) => (g.id === id ? updated : g))
      })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update goal' })
    }
  },

  deleteGoal: async (id) => {
    try {
      await window.api.goals.delete(id)
      set({ goals: get().goals.filter((g) => g.id !== id) })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete goal' })
    }
  },

  addHabit: async (data) => {
    try {
      const habit = await window.api.habits.create(data)
      set({ habits: [...get().habits, habit] })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add habit' })
    }
  },

  updateHabit: async (id, data) => {
    try {
      const updated = await window.api.habits.update(id, data)
      set({
        habits: get().habits.map((h) => (h.id === id ? updated : h))
      })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update habit' })
    }
  },

  deleteHabit: async (id) => {
    try {
      await window.api.habits.delete(id)
      set({ habits: get().habits.filter((h) => h.id !== id) })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete habit' })
    }
  },

  incrementHabitDay: async (id) => {
    try {
      const updated = await window.api.habits.incrementDay(id)
      if (updated) {
        set({
          habits: get().habits.map((h) => (h.id === id ? updated : h))
        })
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to increment habit'
      })
    }
  }
}))
