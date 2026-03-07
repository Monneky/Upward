import { request as httpsRequest } from 'https'
import type { GoogleTokens } from '../services/tokenStorage'
import {
  getGoogleCalendarTokens,
  saveGoogleCalendarTokens,
  getGoogleCalendarIntegration
} from '../services/tokenStorage'
import { getGoogleClientId } from '../config/integrationsConfig'
import { db } from '../database'
import { calendarEventsCache, integrations } from '@shared/schema'
import { eq } from 'drizzle-orm'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CALENDAR_EVENTS_URL =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=now&singleEvents=true&orderBy=startTime&maxResults=50'

function getClientId(): string {
  return getGoogleClientId()
}

export interface CalendarEventItem {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
}

export interface CalendarEventsResponse {
  items?: CalendarEventItem[]
  error?: { code: number; message: string }
}

function postToken(params: Record<string, string>): Promise<GoogleTokens> {
  const body = new URLSearchParams(params).toString()
  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      TOKEN_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.error) {
              reject(new Error(json.error_description || json.error))
              return
            }
            resolve({
              access_token: json.access_token,
              refresh_token: json.refresh_token ?? '',
              expires_in: json.expires_in ?? 3600
            })
          } catch (e) {
            reject(e)
          }
        })
      }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

export async function refreshAccessToken(): Promise<string> {
  const tokens = getGoogleCalendarTokens()
  if (!tokens || !tokens.refresh_token) throw new Error('No refresh token')
  const clientId = getClientId()
  const newTokens = await postToken({
    client_id: clientId,
    refresh_token: tokens.refresh_token,
    grant_type: 'refresh_token'
  })
  if (!newTokens.refresh_token) newTokens.refresh_token = tokens.refresh_token
  const integration = getGoogleCalendarIntegration()
  if (integration) {
    saveGoogleCalendarTokens(integration.email, newTokens)
  }
  return newTokens.access_token
}

function httpsGet(url: string, accessToken: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      url,
      { headers: { Authorization: `Bearer ${accessToken}` } },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          if (res.statusCode === 401) {
            reject(new Error('UNAUTHORIZED'))
            return
          }
          resolve(data)
        })
      }
    )
    req.on('error', reject)
    req.end()
  })
}

export async function fetchCalendarEvents(accessToken: string): Promise<CalendarEventsResponse> {
  const data = await httpsGet(CALENDAR_EVENTS_URL, accessToken)
  return JSON.parse(data) as CalendarEventsResponse
}

export async function getValidAccessToken(): Promise<string> {
  let tokens = getGoogleCalendarTokens()
  if (!tokens) throw new Error('Not connected')
  try {
    const data = await httpsGet(
      'https://www.googleapis.com/calendar/v3/calendars/primary',
      tokens.access_token
    )
    void data
    return tokens.access_token
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') {
      return refreshAccessToken()
    }
    throw e
  }
}

export async function syncGoogleCalendarToCache(): Promise<void> {
  const integration = getGoogleCalendarIntegration()
  if (!integration) throw new Error('Not connected')
  const accessToken = await getValidAccessToken()
  const response = await fetchCalendarEvents(accessToken)
  const items = response.items ?? []
  const now = new Date().toISOString()
  db.delete(calendarEventsCache).where(eq(calendarEventsCache.integrationId, integration.id)).run()
  for (const ev of items) {
    const startAt = ev.start?.dateTime ?? ev.start?.date ?? now
    const endAt = ev.end?.dateTime ?? ev.end?.date ?? now
    db.insert(calendarEventsCache)
      .values({
        integrationId: integration.id,
        eventId: ev.id,
        title: ev.summary ?? '(Sin título)',
        startAt,
        endAt,
        syncedAt: now
      })
      .run()
  }
  db.update(integrations)
    .set({ lastSyncAt: now, updatedAt: now })
    .where(eq(integrations.id, integration.id))
    .run()
}
