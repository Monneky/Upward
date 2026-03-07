import { ipcMain } from 'electron'
import { db, sqlite } from './database'
import { goals, habits, notes, calendarEventsCache } from '@shared/schema'
import { eq, desc, and, gt } from 'drizzle-orm'
import { runGoogleCalendarOAuth } from './oauth/googleCalendar'
import { saveGoogleCalendarTokens } from './services/tokenStorage'
import { getGoogleCalendarIntegration, deleteGoogleCalendarIntegration, canStoreTokensSecurely } from './services/tokenStorage'
import { syncGoogleCalendarToCache } from './services/googleCalendarApi'
import { getGoogleClientId, isGoogleClientIdConfigured } from './config/integrationsConfig'

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
    db.delete(goals).where(eq(goals.id, id)).run()
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
    db.delete(habits).where(eq(habits.id, id)).run()
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
    db.insert(notes)
      .values({
        title: data.title,
        content: data.content ?? '',
        createdAt: now,
        updatedAt: now
      })
      .run()

    const row = sqlite.prepare('SELECT last_insert_rowid() as id').get() as { id: number }
    const note = db.select().from(notes).where(eq(notes.id, row.id)).get()
    if (!note) throw new Error('No se pudo crear la nota')
    return note
  })

  ipcMain.handle(
    'notes:update',
    async (_, id: number, data: Partial<{ title: string; content: string }>) => {
      const updated = db
        .update(notes)
        .set({
          ...data,
          updatedAt: new Date().toISOString()
        })
        .where(eq(notes.id, id))
        .returning()
        .get()

      if (updated != null) return updated

      const fallback = db.select().from(notes).where(eq(notes.id, id)).get()
      if (fallback) return fallback

      throw new Error('No se pudo actualizar la nota')
    }
  )

  ipcMain.handle('notes:delete', async (_, id: number) => {
    const idNum = typeof id === 'string' ? parseInt(id, 10) : Number(id)
    if (Number.isNaN(idNum)) throw new Error('Invalid note id')
    db.delete(notes).where(eq(notes.id, idNum)).run()
    return { success: true }
  })

  // Integrations (Google Calendar)
  ipcMain.handle('integrations:getStatus', async () => {
    const canStore = canStoreTokensSecurely()
    const google = getGoogleCalendarIntegration()
    const googleClientIdConfigured = isGoogleClientIdConfigured()
    return {
      googleCalendar: google
        ? { status: 'connected' as const, email: google.email, lastSyncAt: google.lastSyncAt }
        : { status: 'disconnected' as const },
      canStoreTokens: canStore,
      googleClientIdConfigured
    }
  })

  ipcMain.handle('integrations:connectGoogleCalendar', async () => {
    const clientId = getGoogleClientId()
    if (!canStoreTokensSecurely()) throw new Error('Encryption not available. Cannot store tokens securely.')
    const { tokens, email } = await runGoogleCalendarOAuth(clientId)
    saveGoogleCalendarTokens(email, tokens)
    try {
      await syncGoogleCalendarToCache()
    } catch (_) {
      // First sync optional; connection is still saved
    }
    return { success: true, email }
  })

  ipcMain.handle('integrations:disconnectGoogleCalendar', async () => {
    deleteGoogleCalendarIntegration()
    return { success: true }
  })

  ipcMain.handle('integrations:syncGoogleCalendar', async () => {
    await syncGoogleCalendarToCache()
    const integration = getGoogleCalendarIntegration()
    return { success: true, lastSyncAt: integration?.lastSyncAt ?? null }
  })

  ipcMain.handle('integrations:getNextCalendarEvent', async () => {
    const integration = getGoogleCalendarIntegration()
    if (!integration) return null
    const now = new Date().toISOString()
    const row = db
      .select()
      .from(calendarEventsCache)
      .where(
        and(
          eq(calendarEventsCache.integrationId, integration.id),
          gt(calendarEventsCache.startAt, now)
        )
      )
      .orderBy(calendarEventsCache.startAt)
      .limit(1)
      .get()
    if (!row) return null
    return { title: row.title, startAt: row.startAt, endAt: row.endAt }
  })
}
