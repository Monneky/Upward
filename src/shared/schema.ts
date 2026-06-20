import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export const goals = sqliteTable('goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  target: integer('target').notNull(),
  unit: text('unit').notNull(),
  progress: integer('progress').notNull().default(0),
  deadline: text('deadline'),
  notes: text('notes'),
  createdAt: text('created_at').notNull()
})

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  completedDays: integer('completed_days').notNull().default(0),
  createdAt: text('created_at').notNull()
})

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const integrations = sqliteTable('integrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider: text('provider').notNull(),
  email: text('email').notNull().default(''),
  encryptedTokens: text('encrypted_tokens').notNull(),
  lastSyncAt: text('last_sync_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('active'),
  priority: text('priority').notNull().default('medium'),
  category: text('category'),
  deadline: text('deadline'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const kanbanColumns = sqliteTable('kanban_columns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  order: integer('order').notNull(),
  color: text('color'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false)
})

export const sprints = sqliteTable('sprints', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  goal: text('goal').notNull().default(''),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').notNull().default('planning'),
  createdAt: text('created_at').notNull()
})

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sprintId: integer('sprint_id').references(() => sprints.id, { onDelete: 'set null' }),
  columnId: integer('column_id').notNull().references(() => kanbanColumns.id),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  priority: text('priority').notNull().default('medium'),
  estimatedTime: integer('estimated_time'),
  trackedTime: integer('tracked_time').notNull().default(0),
  deadline: text('deadline'),
  order: integer('order').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const projectNotes = sqliteTable('project_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const routines = sqliteTable('routines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  emoji: text('emoji').notNull().default('🎯'),
  daysOfWeek: text('days_of_week').notNull().default('[]'),
  time: text('time'),
  description: text('description').notNull().default(''),
  color: text('color').notNull().default('#6366f1'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const calendarEventsCache = sqliteTable('calendar_events_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  integrationId: integer('integration_id').notNull().references(() => integrations.id, { onDelete: 'cascade' }),
  eventId: text('event_id').notNull(),
  title: text('title').notNull(),
  startAt: text('start_at').notNull(),
  endAt: text('end_at').notNull(),
  syncedAt: text('synced_at').notNull()
})

export type Goal = InferSelectModel<typeof goals>
export type GoalInsert = InferInsertModel<typeof goals>
export type Habit = InferSelectModel<typeof habits>
export type HabitInsert = InferInsertModel<typeof habits>
export type Note = InferSelectModel<typeof notes>
export type NoteInsert = InferInsertModel<typeof notes>
export type Integration = InferSelectModel<typeof integrations>
export type IntegrationInsert = InferInsertModel<typeof integrations>
export type CalendarEventCache = InferSelectModel<typeof calendarEventsCache>
export type CalendarEventCacheInsert = InferInsertModel<typeof calendarEventsCache>
export type Project = InferSelectModel<typeof projects>
export type ProjectInsert = InferInsertModel<typeof projects>
export type KanbanColumn = InferSelectModel<typeof kanbanColumns>
export type KanbanColumnInsert = InferInsertModel<typeof kanbanColumns>
export type Sprint = InferSelectModel<typeof sprints>
export type SprintInsert = InferInsertModel<typeof sprints>
export type Task = InferSelectModel<typeof tasks>
export type TaskInsert = InferInsertModel<typeof tasks>
export type ProjectNote = InferSelectModel<typeof projectNotes>
export type ProjectNoteInsert = InferInsertModel<typeof projectNotes>
export type Routine = InferSelectModel<typeof routines>
export type RoutineInsert = InferInsertModel<typeof routines>
