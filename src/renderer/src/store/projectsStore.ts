import { create } from 'zustand'
import type { Project } from '@renderer/types'

type ProjectCreate = {
  name: string
  description?: string
  status?: string
  priority?: string
  category?: string
  deadline?: string
}

type ProjectUpdate = Partial<{
  name: string
  description: string
  status: string
  priority: string
  category: string
  deadline: string
}>

interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  addProject: (data: ProjectCreate) => Promise<void>
  updateProject: (id: number, data: ProjectUpdate) => Promise<void>
  deleteProject: (id: number) => Promise<void>
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const projects = await window.api.projects.getAll()
      set({ projects, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  addProject: async (data) => {
    try {
      const project = await window.api.projects.create(data)
      set({ projects: [project, ...get().projects] })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  updateProject: async (id, data) => {
    try {
      const updated = await window.api.projects.update(id, data)
      set({ projects: get().projects.map((p) => (p.id === id ? updated : p)) })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteProject: async (id) => {
    try {
      await window.api.projects.delete(id)
      set({ projects: get().projects.filter((p) => p.id !== id) })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  }
}))
