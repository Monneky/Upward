/**
 * Returns a human-readable countdown string for an event starting at startAt (ISO).
 * If now is past startAt but before endAt, returns "En curso".
 * If now is past endAt, returns "" (caller should not show).
 */
export function formatCountdown(startAt: string, endAt?: string): string {
  const start = new Date(startAt).getTime()
  const end = endAt ? new Date(endAt).getTime() : start
  const now = Date.now()
  if (now >= end) return ''
  if (now >= start) return 'En curso'
  const deltaMs = start - now
  const seconds = Math.floor(deltaMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours >= 1) return `en ${hours} hora${hours !== 1 ? 's' : ''}`
  if (minutes >= 1) return `en ${minutes} minuto${minutes !== 1 ? 's' : ''}`
  return `en ${seconds} segundo${seconds !== 1 ? 's' : ''}`
}
