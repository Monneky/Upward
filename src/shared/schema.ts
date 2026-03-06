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

export type Goal = InferSelectModel<typeof goals>
export type GoalInsert = InferInsertModel<typeof goals>
export type Habit = InferSelectModel<typeof habits>
export type HabitInsert = InferInsertModel<typeof habits>
