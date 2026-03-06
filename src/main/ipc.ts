import { ipcMain } from 'electron'
import { db } from './database'
import { goals, habits, notes } from '@shared/schema'
import { eq, desc } from 'drizzle-orm'

export function registerIpcHandlers(): void {
  // Goals
  ipcMain.handle('goals:getAll', async () => {
    return db.select().from(goals).all()
  })

  ipcMain.handle(
    'goals:create',
    async (
      _,
      data: {
        title: string
        category: string
        target: number
        unit: string
        deadline?: string
        notes?: string
      }
    ) => {
      const result = db
        .insert(goals)
        .values({
          ...data,
          progress: 0,
          createdAt: new Date().toISOString()
        })
        .returning()
      return result[0]
    }
  )

  ipcMain.handle(
    'goals:update',
    async (
      _,
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
    ) => {
      const result = db.update(goals).set(data).where(eq(goals.id, id)).returning()
      return result[0]
    }
  )

  ipcMain.handle('goals:delete', async (_, id: number) => {
    db.delete(goals).where(eq(goals.id, id))
    return { success: true }
  })

  // Habits
  ipcMain.handle('habits:getAll', async () => {
    return db.select().from(habits).all()
  })

  ipcMain.handle(
    'habits:create',
    async (_, data: { title: string }) => {
      const result = db
        .insert(habits)
        .values({
          title: data.title,
          completedDays: 0,
          createdAt: new Date().toISOString()
        })
        .returning()
      return result[0]
    }
  )

  ipcMain.handle(
    'habits:update',
    async (
      _,
      id: number,
      data: Partial<{ title: string; completedDays: number }>
    ) => {
      const result = db.update(habits).set(data).where(eq(habits.id, id)).returning()
      return result[0]
    }
  )

  ipcMain.handle('habits:delete', async (_, id: number) => {
    db.delete(habits).where(eq(habits.id, id))
    return { success: true }
  })

  ipcMain.handle('habits:incrementDay', async (_, id: number) => {
    const habit = db.select().from(habits).where(eq(habits.id, id)).get()
    if (!habit) return null
    const result = db
      .update(habits)
      .set({ completedDays: habit.completedDays + 1 })
      .where(eq(habits.id, id))
      .returning()
    return result[0]
  })

  // Notes
  ipcMain.handle('notes:getAll', async () => {
    return db.select().from(notes).orderBy(desc(notes.updatedAt)).all()
  })

  ipcMain.handle('notes:create', async (_, data: { title: string; content?: string }) => {
    const now = new Date().toISOString()
    const result = db
      .insert(notes)
      .values({
        title: data.title,
        content: data.content || '',
        createdAt: now,
        updatedAt: now
      })
      .returning()
    return result[0]
  })

  ipcMain.handle(
    'notes:update',
    async (_, id: number, data: Partial<{ title: string; content: string }>) => {
      const result = db
        .update(notes)
        .set({
          ...data,
          updatedAt: new Date().toISOString()
        })
        .where(eq(notes.id, id))
        .returning()
      return result[0]
    }
  )

  ipcMain.handle('notes:delete', async (_, id: number) => {
    db.delete(notes).where(eq(notes.id, id))
    return { success: true }
  })
}
