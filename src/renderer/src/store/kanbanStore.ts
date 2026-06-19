import { create } from 'zustand'
import type { KanbanColumn } from '@renderer/types'

interface KanbanState {
  columns: KanbanColumn[]
  loading: boolean
  error: string | null
  fetchColumns: (projectId: number) => Promise<void>
}

export const useKanbanStore = create<KanbanState>((set) => ({
  columns: [],
  loading: false,
  error: null,

  fetchColumns: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const columns = await window.api.kanban.getColumns(projectId)
      set({ columns, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  }
}))
