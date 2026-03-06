import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import { join } from 'path'
import * as schema from '@shared/schema'

const dbPath = join(app.getPath('userData'), 'upward.db')
const sqlite = new Database(dbPath)
export const db = drizzle(sqlite, { schema })
export { sqlite }

export function runMigrations(): void {
  const migrationsFolder = join(app.getAppPath(), 'drizzle')
  migrate(db, { migrationsFolder })
}
