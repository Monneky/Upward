import { create } from 'zustand'
import type { Routine } from '@renderer/types'

type RoutineCreate = {
  name: string
  emoji?: string
  daysOfWeek?: string[]
  time?: string
  description?: string
  color?: string
}

type RoutineUpdate = Partial<{
  name: string
  emoji: string
  daysOfWeek: string[]
  time: string
  description: string
  color: string
}>

interface RoutinesState {
  routines: Routine[]
  loading: boolean
  error: string | null
  fetchRoutines: () => Promise<void>
  addRoutine: (data: RoutineCreate) => Promise<void>
  updateRoutine: (id: number, data: RoutineUpdate) => Promise<void>
  deleteRoutine: (id: number) => Promise<void>
}

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  routines: [],
  loading: false,
  error: null,

  fetchRoutines: async () => {
    set({ loading: true, error: null })
    try {
      const routines = await window.api.routines.getAll()
      set({ routines, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  addRoutine: async (data) => {
    try {
      const routine = await window.api.routines.create(data)
      set({ routines: [routine, ...get().routines] })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  updateRoutine: async (id, data) => {
    try {
      const updated = await window.api.routines.update(id, data)
      set({ routines: get().routines.map((r) => (r.id === id ? updated : r)) })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteRoutine: async (id) => {
    try {
      await window.api.routines.delete(id)
      set({ routines: get().routines.filter((r) => r.id !== id) })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  }
}))
