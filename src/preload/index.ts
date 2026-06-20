import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  goals: {
    getAll: () => ipcRenderer.invoke('goals:getAll'),
    create: (data: {
      title: string
      category: string
      target: number
      unit: string
      deadline?: string
      notes?: string
    }) => ipcRenderer.invoke('goals:create', data),
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
    ) => ipcRenderer.invoke('goals:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('goals:delete', id)
  },
  habits: {
    getAll: () => ipcRenderer.invoke('habits:getAll'),
    create: (data: { title: string }) => ipcRenderer.invoke('habits:create', data),
    update: (
      id: number,
      data: Partial<{ title: string; completedDays: number }>
    ) => ipcRenderer.invoke('habits:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('habits:delete', id),
    incrementDay: (id: number) => ipcRenderer.invoke('habits:incrementDay', id)
  },
  notes: {
    getAll: () => ipcRenderer.invoke('notes:getAll'),
    create: (data: { title: string; content?: string }) =>
      ipcRenderer.invoke('notes:create', data),
    update: (id: number, data: Partial<{ title: string; content: string }>) =>
      ipcRenderer.invoke('notes:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('notes:delete', id)
  },
  projects: {
    getAll: () => ipcRenderer.invoke('projects:getAll'),
    create: (data: { name: string; description?: string; status?: string; priority?: string; category?: string; deadline?: string }) =>
      ipcRenderer.invoke('projects:create', data),
    update: (id: number, data: Partial<{ name: string; description: string; status: string; priority: string; category: string; deadline: string }>) =>
      ipcRenderer.invoke('projects:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('projects:delete', id)
  },
  routines: {
    getAll: () => ipcRenderer.invoke('routines:getAll'),
    create: (data: { name: string; emoji?: string; daysOfWeek?: string[]; time?: string; description?: string; color?: string }) =>
      ipcRenderer.invoke('routines:create', data),
    update: (id: number, data: Partial<{ name: string; emoji: string; daysOfWeek: string[]; time: string; description: string; color: string }>) =>
      ipcRenderer.invoke('routines:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('routines:delete', id)
  },
  kanban: {
    getColumns: (projectId: number) => ipcRenderer.invoke('kanban:getColumns', projectId),
    createColumn: (data: { projectId: number; name: string; color?: string }) =>
      ipcRenderer.invoke('kanban:createColumn', data),
    updateColumn: (id: number, data: Partial<{ name: string; color: string }>) =>
      ipcRenderer.invoke('kanban:updateColumn', id, data),
    deleteColumn: (id: number) => ipcRenderer.invoke('kanban:deleteColumn', id),
    reorderColumns: (projectId: number, columnIds: number[]) =>
      ipcRenderer.invoke('kanban:reorderColumns', projectId, columnIds)
  },
  sprints: {
    getAll: (projectId: number) => ipcRenderer.invoke('sprints:getAll', projectId),
    create: (data: { projectId: number; name: string; goal?: string; startDate: string; endDate: string }) =>
      ipcRenderer.invoke('sprints:create', data),
    update: (id: number, data: Partial<{ name: string; goal: string; startDate: string; endDate: string; status: string }>) =>
      ipcRenderer.invoke('sprints:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('sprints:delete', id)
  },
  tasks: {
    getAll: (projectId: number) => ipcRenderer.invoke('tasks:getAll', projectId),
    create: (data: { projectId: number; columnId: number; title: string; description?: string; priority?: string; sprintId?: number; estimatedTime?: number; deadline?: string }) =>
      ipcRenderer.invoke('tasks:create', data),
    update: (id: number, data: Partial<{ title: string; description: string; priority: string; sprintId: number | null; estimatedTime: number | null; trackedTime: number; deadline: string | null }>) =>
      ipcRenderer.invoke('tasks:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('tasks:delete', id),
    move: (taskId: number, newColumnId: number, newOrder: number) =>
      ipcRenderer.invoke('tasks:move', taskId, newColumnId, newOrder),
    reorder: (columnId: number, taskIds: number[]) =>
      ipcRenderer.invoke('tasks:reorder', columnId, taskIds)
  },
  projectNotes: {
    listByProject: (projectId: number) => ipcRenderer.invoke('projectNotes:listByProject', projectId),
    create: (data: { projectId: number; title: string; content?: string }) =>
      ipcRenderer.invoke('projectNotes:create', data),
    update: (id: number, data: Partial<{ title: string; content: string }>) =>
      ipcRenderer.invoke('projectNotes:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('projectNotes:delete', id)
  },
  integrations: {
    getStatus: () =>
      ipcRenderer.invoke('integrations:getStatus') as Promise<{
        googleCalendar: { status: 'connected'; email: string; lastSyncAt: string | null } | { status: 'disconnected' }
        canStoreTokens: boolean
        googleClientIdConfigured: boolean
      }>,
    connectGoogleCalendar: () =>
      ipcRenderer.invoke('integrations:connectGoogleCalendar') as Promise<{ success: boolean; email: string }>,
    disconnectGoogleCalendar: () =>
      ipcRenderer.invoke('integrations:disconnectGoogleCalendar') as Promise<{ success: boolean }>,
    syncGoogleCalendar: () =>
      ipcRenderer.invoke('integrations:syncGoogleCalendar') as Promise<{ success: boolean; lastSyncAt: string | null }>,
    getNextCalendarEvent: () =>
      ipcRenderer.invoke('integrations:getNextCalendarEvent') as Promise<{ title: string; startAt: string; endAt: string } | null>
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
