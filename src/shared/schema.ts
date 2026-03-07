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
