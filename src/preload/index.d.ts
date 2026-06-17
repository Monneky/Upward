import { ElectronAPI } from '@electron-toolkit/preload'
import type { Goal, Habit, Note, Project, KanbanColumn, Sprint, Task, Routine } from '@shared/schema'

export interface UpwardAPI {
  goals: {
    getAll: () => Promise<Goal[]>
    create: (data: {
      title: string
      category: string
      target: number
      unit: string
      deadline?: string
      notes?: string
    }) => Promise<Goal>
    update: (
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
    ) => Promise<Goal>
    delete: (id: number) => Promise<{ success: boolean }>
  }
  habits: {
    getAll: () => Promise<Habit[]>
    create: (data: { title: string }) => Promise<Habit>
    update: (
      id: number,
      data: Partial<{ title: string; completedDays: number }>
    ) => Promise<Habit>
    delete: (id: number) => Promise<{ success: boolean }>
    incrementDay: (id: number) => Promise<Habit | null>
  }
  notes: {
    getAll: () => Promise<Note[]>
    create: (data: { title: string; content?: string }) => Promise<Note>
    update: (id: number, data: Partial<{ title: string; content: string }>) => Promise<Note>
    delete: (id: number) => Promise<{ success: boolean }>
  }
  projects: {
    getAll: () => Promise<Project[]>
    create: (data: { name: string; description?: string; status?: string; priority?: string; category?: string; deadline?: string }) => Promise<Project>
    update: (id: number, data: Partial<{ name: string; description: string; status: string; priority: string; category: string; deadline: string }>) => Promise<Project>
    delete: (id: number) => Promise<{ success: boolean }>
  }
  routines: {
    getAll: () => Promise<Routine[]>
    create: (data: { name: string; emoji?: string; daysOfWeek?: string[]; time?: string; description?: string; color?: string }) => Promise<Routine>
    update: (id: number, data: Partial<{ name: string; emoji: string; daysOfWeek: string[]; time: string; description: string; color: string }>) => Promise<Routine>
    delete: (id: number) => Promise<{ success: boolean }>
  }
  kanban: {
    getColumns: (projectId: number) => Promise<KanbanColumn[]>
    createColumn: (data: { projectId: number; name: string; color?: string }) => Promise<KanbanColumn>
    updateColumn: (id: number, data: Partial<{ name: string; color: string }>) => Promise<KanbanColumn>
    deleteColumn: (id: number) => Promise<{ success: boolean }>
    reorderColumns: (projectId: number, columnIds: number[]) => Promise<{ success: boolean }>
  }
  sprints: {
    getAll: (projectId: number) => Promise<Sprint[]>
    create: (data: { projectId: number; name: string; goal?: string; startDate: string; endDate: string }) => Promise<Sprint>
    update: (id: number, data: Partial<{ name: string; goal: string; startDate: string; endDate: string; status: string }>) => Promise<Sprint>
    delete: (id: number) => Promise<{ success: boolean }>
  }
  tasks: {
    getAll: (projectId: number) => Promise<Task[]>
    create: (data: { projectId: number; columnId: number; title: string; description?: string; priority?: string; sprintId?: number; estimatedTime?: number; deadline?: string }) => Promise<Task>
    update: (id: number, data: Partial<{ title: string; description: string; priority: string; sprintId: number | null; estimatedTime: number | null; trackedTime: number; deadline: string | null }>) => Promise<Task>
    delete: (id: number) => Promise<{ success: boolean }>
    move: (taskId: number, newColumnId: number, newOrder: number) => Promise<Task>
    reorder: (columnId: number, taskIds: number[]) => Promise<{ success: boolean }>
  }
  integrations: {
    getStatus: () => Promise<{
      googleCalendar:
        | { status: 'connected'; email: string; lastSyncAt: string | null }
        | { status: 'disconnected' }
      canStoreTokens: boolean
      googleClientIdConfigured: boolean
    }>
    connectGoogleCalendar: () => Promise<{ success: boolean; email: string }>
    disconnectGoogleCalendar: () => Promise<{ success: boolean }>
    syncGoogleCalendar: () => Promise<{ success: boolean; lastSyncAt: string | null }>
    getNextCalendarEvent: () => Promise<{
      title: string
      startAt: string
      endAt: string
    } | null>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: UpwardAPI
  }
}
