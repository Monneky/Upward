import { create } from 'zustand'
import type { Task } from '@renderer/types'

type TaskCreate = {
  projectId: number
  columnId: number
  title: string
  description?: string
  priority?: string
  sprintId?: number
  estimatedTime?: number
  deadline?: string
}

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: (projectId: number) => Promise<void>
  addTask: (data: TaskCreate) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  updateTask: (
    id: number,
    data: Partial<{
      title: string
      description: string
      priority: string
      deadline: string | null
    }>,
    columnId?: number
  ) => Promise<void>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const tasks = await window.api.tasks.getAll(projectId)
      set({ tasks, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  addTask: async (data) => {
    try {
      const task = await window.api.tasks.create(data)
      set({ tasks: [...get().tasks, task] })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteTask: async (id) => {
    try {
      await window.api.tasks.delete(id)
      set({ tasks: get().tasks.filter((t) => t.id !== id) })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  updateTask: async (id, data, columnId) => {
    try {
      const existing = get().tasks.find((t) => t.id === id)
      let task = await window.api.tasks.update(id, data)
      if (columnId != null && existing && columnId !== existing.columnId) {
        task = await window.api.tasks.move(id, columnId, existing.order)
      }
      set({ tasks: get().tasks.map((t) => (t.id === id ? task : t)) })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  }
}))
