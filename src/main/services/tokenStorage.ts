import { safeStorage } from 'electron'
import { db } from '../database'
import { integrations } from '@shared/schema'
import { eq } from 'drizzle-orm'

export interface GoogleTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

const PROVIDER_GOOGLE_CALENDAR = 'google_calendar'

function isEncryptionAvailable(): boolean {
  try {
    return safeStorage.isEncryptionAvailable()
  } catch {
    return false
  }
}

export function canStoreTokensSecurely(): boolean {
  return isEncryptionAvailable()
}

export function saveGoogleCalendarTokens(email: string, tokens: GoogleTokens): number {
  if (!isEncryptionAvailable()) {
    throw new Error('Encryption not available (e.g. Linux without secret service). Cannot store tokens securely.')
  }
  const buffer = safeStorage.encryptString(JSON.stringify(tokens))
  const blob = buffer.toString('base64')
  const now = new Date().toISOString()
  const existing = db.select().from(integrations).where(eq(integrations.provider, PROVIDER_GOOGLE_CALENDAR)).get()
  if (existing) {
    db.update(integrations)
      .set({
        email,
        encryptedTokens: blob,
        lastSyncAt: null,
        updatedAt: now
      })
      .where(eq(integrations.id, existing.id))
      .run()
    return existing.id
  }
  const result = db
    .insert(integrations)
    .values({
      provider: PROVIDER_GOOGLE_CALENDAR,
      email,
      encryptedTokens: blob,
      lastSyncAt: null,
      createdAt: now,
      updatedAt: now
    })
    .returning()
  const row = result[0]
  if (!row) throw new Error('Failed to save integration')
  return row.id
}

export function getGoogleCalendarTokens(): GoogleTokens | null {
  const row = db.select().from(integrations).where(eq(integrations.provider, PROVIDER_GOOGLE_CALENDAR)).get()
  if (!row) return null
  if (!isEncryptionAvailable()) return null
  try {
    const buffer = Buffer.from(row.encryptedTokens, 'base64')
    const json = safeStorage.decryptString(buffer)
    return JSON.parse(json) as GoogleTokens
  } catch {
    return null
  }
}

/** Returns integration row without decrypted tokens; for status only. */
export function getGoogleCalendarIntegration(): { id: number; email: string; lastSyncAt: string | null } | null {
  const row = db.select().from(integrations).where(eq(integrations.provider, PROVIDER_GOOGLE_CALENDAR)).get()
  if (!row) return null
  return { id: row.id, email: row.email, lastSyncAt: row.lastSyncAt }
}

export function deleteGoogleCalendarIntegration(): void {
  const row = db.select().from(integrations).where(eq(integrations.provider, PROVIDER_GOOGLE_CALENDAR)).get()
  if (row) db.delete(integrations).where(eq(integrations.id, row.id)).run()
}
