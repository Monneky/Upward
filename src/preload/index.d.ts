import { ElectronAPI } from '@electron-toolkit/preload'
import type { Goal, Habit } from '@shared/schema'

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
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: UpwardAPI
  }
}
