import { create } from 'zustand'
import type { Note } from '@renderer/types'

interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
  selectedNoteId: number | null
  fetchNotes: () => Promise<void>
  addNote: (data: { title: string; content?: string }) => Promise<Note>
  updateNote: (id: number, data: Partial<{ title: string; content: string }>) => Promise<void>
  deleteNote: (id: number) => Promise<void>
  selectNote: (id: number | null) => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  selectedNoteId: null,

  fetchNotes: async () => {
    set({ loading: true, error: null })
    try {
      const notes = await window.api.notes.getAll()
      set({ notes })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch notes' })
    } finally {
      set({ loading: false })
    }
  },

  addNote: async (data) => {
    const note = await window.api.notes.create(data)
    set({ notes: [note, ...get().notes], selectedNoteId: note.id })
    return note
  },

  updateNote: async (id, data) => {
    const updated = await window.api.notes.update(id, data)
    set({ notes: get().notes.map((n) => (n.id === id ? updated : n)) })
  },

  deleteNote: async (id) => {
    await window.api.notes.delete(id)
    set({
      notes: get().notes.filter((n) => n.id !== id),
      selectedNoteId: get().selectedNoteId === id ? null : get().selectedNoteId
    })
  },

  selectNote: (id) => set({ selectedNoteId: id })
}))
