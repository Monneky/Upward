import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Carga variables desde un .env en la ruta indicada y las pone en process.env.
 * Solo para desarrollo; en producción el Client ID va inyectado en el build.
 */
export function loadEnvFile(dir: string): void {
  const path = join(dir, '.env')
  if (!existsSync(path)) return
  try {
    const raw = readFileSync(path, 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (key && !process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // ignorar si no se puede leer
  }
}
