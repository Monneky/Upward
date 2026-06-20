import { create } from 'zustand'
import type { ProjectNote } from '@renderer/types'

interface ProjectNotesState {
  notes: ProjectNote[]
  loading: boolean
  error: string | null
  fetchNotes: (projectId: number) => Promise<void>
  addNote: (data: {
    projectId: number
    title: string
    content?: string
  }) => Promise<ProjectNote | null>
  updateNote: (id: number, data: Partial<{ title: string; content: string }>) => Promise<void>
  deleteNote: (id: number) => Promise<void>
  clearError: () => void
}

export const useProjectNotesStore = create<ProjectNotesState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,

  fetchNotes: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const notes = await window.api.projectNotes.listByProject(projectId)
      set({ notes, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  addNote: async (data) => {
    set({ error: null })
    try {
      const note = await window.api.projectNotes.create(data)
      set({ notes: [...get().notes, note] })
      return note
    } catch (e) {
      set({ error: (e as Error).message })
      return null
    }
  },

  updateNote: async (id, data) => {
    set({ error: null })
    try {
      const note = await window.api.projectNotes.update(id, data)
      set({ notes: get().notes.map((n) => (n.id === id ? note : n)) })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteNote: async (id) => {
    try {
      await window.api.projectNotes.delete(id)
      set({ notes: get().notes.filter((n) => n.id !== id) })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))
