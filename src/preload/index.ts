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
