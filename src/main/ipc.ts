import { ipcMain } from 'electron'
import { db, sqlite } from './database'
import { goals, habits, notes, calendarEventsCache, projects, kanbanColumns, sprints, tasks, routines } from '@shared/schema'
import { eq, desc, and, gt, max } from 'drizzle-orm'
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

  // Projects
  ipcMain.handle('projects:getAll', async () => {
    return db.select().from(projects).orderBy(desc(projects.updatedAt)).all()
  })

  ipcMain.handle('projects:create', async (_, data: { name: string; description?: string; status?: string; priority?: string; category?: string; deadline?: string }) => {
    const now = new Date().toISOString()
    db.insert(projects)
      .values({
        name: data.name,
        description: data.description ?? '',
        status: data.status ?? 'active',
        priority: data.priority ?? 'medium',
        category: data.category ?? null,
        deadline: data.deadline ?? null,
        createdAt: now,
        updatedAt: now
      })
      .run()

    const row = sqlite.prepare('SELECT last_insert_rowid() as id').get() as { id: number }
    const projectId = row.id

    const defaultColumns = [
      { name: 'Backlog', color: '#94A3B8', order: 0, isDefault: false },
      { name: 'In Progress', color: '#3B82F6', order: 1, isDefault: false },
      { name: 'In Review', color: '#F59E0B', order: 2, isDefault: false },
      { name: 'Done', color: '#10B981', order: 3, isDefault: true }
    ]
    for (const col of defaultColumns) {
      db.insert(kanbanColumns)
        .values({ projectId, name: col.name, order: col.order, color: col.color, isDefault: col.isDefault })
        .run()
    }

    const project = db.select().from(projects).where(eq(projects.id, projectId)).get()
    if (!project) throw new Error('Failed to create project')
    return project
  })

  ipcMain.handle('projects:update', async (_, id: number, data: Partial<{ name: string; description: string; status: string; priority: string; category: string; deadline: string }>) => {
    const updated = db
      .update(projects)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, id))
      .returning()
      .get()
    if (updated != null) return updated
    const fallback = db.select().from(projects).where(eq(projects.id, id)).get()
    if (fallback) return fallback
    throw new Error('Failed to update project')
  })

  ipcMain.handle('projects:delete', async (_, id: number) => {
    db.delete(projects).where(eq(projects.id, id)).run()
    return { success: true }
  })

  // Routines
  ipcMain.handle('routines:getAll', async () => {
    return db.select().from(routines).orderBy(desc(routines.updatedAt)).all()
  })

  ipcMain.handle('routines:create', async (_, data: { name: string; emoji?: string; daysOfWeek?: string[]; time?: string; description?: string; color?: string }) => {
    const now = new Date().toISOString()
    db.insert(routines)
      .values({
        name: data.name,
        emoji: data.emoji ?? '🎯',
        daysOfWeek: JSON.stringify(data.daysOfWeek ?? []),
        time: data.time ?? null,
        description: data.description ?? '',
        color: data.color ?? '#6366f1',
        createdAt: now,
        updatedAt: now
      })
      .run()

    const row = sqlite.prepare('SELECT last_insert_rowid() as id').get() as { id: number }
    const routine = db.select().from(routines).where(eq(routines.id, row.id)).get()
    if (!routine) throw new Error('Failed to create routine')
    return routine
  })

  ipcMain.handle('routines:update', async (_, id: number, data: Partial<{ name: string; emoji: string; daysOfWeek: string[]; time: string; description: string; color: string }>) => {
    const { daysOfWeek, ...rest } = data
    const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date().toISOString() }
    if (daysOfWeek !== undefined) updateData.daysOfWeek = JSON.stringify(daysOfWeek)
    const updated = db.update(routines).set(updateData).where(eq(routines.id, id)).returning().get()
    if (updated != null) return updated
    const fallback = db.select().from(routines).where(eq(routines.id, id)).get()
    if (fallback) return fallback
    throw new Error('Failed to update routine')
  })

  ipcMain.handle('routines:delete', async (_, id: number) => {
    db.delete(routines).where(eq(routines.id, id)).run()
    return { success: true }
  })

  // Kanban Columns
  ipcMain.handle('kanban:getColumns', async (_, projectId: number) => {
    return db.select().from(kanbanColumns).where(eq(kanbanColumns.projectId, projectId)).orderBy(kanbanColumns.order).all()
  })

  ipcMain.handle('kanban:createColumn', async (_, data: { projectId: number; name: string; color?: string }) => {
    const maxOrderRow = db
      .select({ maxOrder: max(kanbanColumns.order) })
      .from(kanbanColumns)
      .where(eq(kanbanColumns.projectId, data.projectId))
      .get()
    const nextOrder = (maxOrderRow?.maxOrder ?? -1) + 1

    db.insert(kanbanColumns)
      .values({ projectId: data.projectId, name: data.name, order: nextOrder, color: data.color ?? '#94A3B8', isDefault: false })
      .run()

    const row = sqlite.prepare('SELECT last_insert_rowid() as id').get() as { id: number }
    const col = db.select().from(kanbanColumns).where(eq(kanbanColumns.id, row.id)).get()
    if (!col) throw new Error('Failed to create column')
    return col
  })

  ipcMain.handle('kanban:updateColumn', async (_, id: number, data: Partial<{ name: string; color: string }>) => {
    db.update(kanbanColumns).set(data).where(eq(kanbanColumns.id, id)).run()
    const col = db.select().from(kanbanColumns).where(eq(kanbanColumns.id, id)).get()
    if (!col) throw new Error('Column not found')
    return col
  })

  ipcMain.handle('kanban:deleteColumn', async (_, id: number) => {
    const col = db.select().from(kanbanColumns).where(eq(kanbanColumns.id, id)).get()
    if (!col) throw new Error('Column not found')
    if (col.isDefault) throw new Error('Cannot delete default column')
    db.delete(kanbanColumns).where(eq(kanbanColumns.id, id)).run()
    return { success: true }
  })

  ipcMain.handle('kanban:reorderColumns', async (_, projectId: number, columnIds: number[]) => {
    for (let i = 0; i < columnIds.length; i++) {
      db.update(kanbanColumns).set({ order: i }).where(and(eq(kanbanColumns.id, columnIds[i]), eq(kanbanColumns.projectId, projectId))).run()
    }
    return { success: true }
  })

  // Sprints
  ipcMain.handle('sprints:getAll', async (_, projectId: number) => {
    return db.select().from(sprints).where(eq(sprints.projectId, projectId)).orderBy(desc(sprints.startDate)).all()
  })

  ipcMain.handle('sprints:create', async (_, data: { projectId: number; name: string; goal?: string; startDate: string; endDate: string }) => {
    const now = new Date().toISOString()
    db.insert(sprints)
      .values({
        projectId: data.projectId,
        name: data.name,
        goal: data.goal ?? '',
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'planning',
        createdAt: now
      })
      .run()
    const row = sqlite.prepare('SELECT last_insert_rowid() as id').get() as { id: number }
    const sprint = db.select().from(sprints).where(eq(sprints.id, row.id)).get()
    if (!sprint) throw new Error('Failed to create sprint')
    return sprint
  })

  ipcMain.handle('sprints:update', async (_, id: number, data: Partial<{ name: string; goal: string; startDate: string; endDate: string; status: string }>) => {
    db.update(sprints).set(data).where(eq(sprints.id, id)).run()
    const sprint = db.select().from(sprints).where(eq(sprints.id, id)).get()
    if (!sprint) throw new Error('Sprint not found')
    return sprint
  })

  ipcMain.handle('sprints:delete', async (_, id: number) => {
    db.delete(sprints).where(eq(sprints.id, id)).run()
    return { success: true }
  })

  // Tasks
  ipcMain.handle('tasks:getAll', async (_, projectId: number) => {
    return db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(tasks.order).all()
  })

  ipcMain.handle('tasks:create', async (_, data: { projectId: number; columnId: number; title: string; description?: string; priority?: string; sprintId?: number; estimatedTime?: number; deadline?: string }) => {
    const now = new Date().toISOString()
    const maxOrderRow = db
      .select({ maxOrder: max(tasks.order) })
      .from(tasks)
      .where(eq(tasks.columnId, data.columnId))
      .get()
    const nextOrder = (maxOrderRow?.maxOrder ?? -1) + 1

    db.insert(tasks)
      .values({
        projectId: data.projectId,
        columnId: data.columnId,
        title: data.title,
        description: data.description ?? '',
        priority: data.priority ?? 'medium',
        sprintId: data.sprintId ?? null,
        estimatedTime: data.estimatedTime ?? null,
        trackedTime: 0,
        deadline: data.deadline ?? null,
        order: nextOrder,
        createdAt: now,
        updatedAt: now
      })
      .run()

    const row = sqlite.prepare('SELECT last_insert_rowid() as id').get() as { id: number }
    const task = db.select().from(tasks).where(eq(tasks.id, row.id)).get()
    if (!task) throw new Error('Failed to create task')
    return task
  })

  ipcMain.handle('tasks:update', async (_, id: number, data: Partial<{ title: string; description: string; priority: string; sprintId: number | null; estimatedTime: number | null; trackedTime: number; deadline: string | null }>) => {
    db.update(tasks).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(tasks.id, id)).run()
    const task = db.select().from(tasks).where(eq(tasks.id, id)).get()
    if (!task) throw new Error('Task not found')
    return task
  })

  ipcMain.handle('tasks:delete', async (_, id: number) => {
    db.delete(tasks).where(eq(tasks.id, id)).run()
    return { success: true }
  })

  ipcMain.handle('tasks:move', async (_, taskId: number, newColumnId: number, newOrder: number) => {
    db.update(tasks)
      .set({ columnId: newColumnId, order: newOrder, updatedAt: new Date().toISOString() })
      .where(eq(tasks.id, taskId))
      .run()
    const task = db.select().from(tasks).where(eq(tasks.id, taskId)).get()
    if (!task) throw new Error('Task not found')
    return task
  })

  ipcMain.handle('tasks:reorder', async (_, columnId: number, taskIds: number[]) => {
    for (let i = 0; i < taskIds.length; i++) {
      db.update(tasks).set({ order: i }).where(and(eq(tasks.id, taskIds[i]), eq(tasks.columnId, columnId))).run()
    }
    return { success: true }
  })
}
