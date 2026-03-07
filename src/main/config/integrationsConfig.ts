import { app } from 'electron'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'

const CONFIG_FILENAME = 'integrations-config.json'

/** Inyectado en build: GOOGLE_CLIENT_ID=xxx npm run build (solo para proceso main) */
declare const __BUILTIN_GOOGLE_CLIENT_ID__: string

interface IntegrationsConfig {
  googleClientId?: string
}

let cached: IntegrationsConfig | null = null

function getConfigPath(): string {
  return join(app.getPath('userData'), CONFIG_FILENAME)
}

function readConfig(): IntegrationsConfig {
  if (cached) return cached
  const path = getConfigPath()
  if (!existsSync(path)) {
    cached = {}
    return cached
  }
  try {
    const raw = readFileSync(path, 'utf8')
    cached = JSON.parse(raw) as IntegrationsConfig
    return cached
  } catch {
    cached = {}
    return cached
  }
}

/**
 * Orden: archivo en userData > variable de entorno > Client ID inyectado al compilar.
 * Así el usuario final solo pulsa "Conectar" sin configurar nada.
 */
export function getGoogleClientId(): string {
  const config = readConfig()
  const builtin = typeof __BUILTIN_GOOGLE_CLIENT_ID__ !== 'undefined' ? __BUILTIN_GOOGLE_CLIENT_ID__ : ''
  const id = config.googleClientId ?? process.env.GOOGLE_CLIENT_ID ?? builtin
  if (!id || typeof id !== 'string' || !id.trim()) {
    throw new Error('Google Calendar no está disponible en esta instalación.')
  }
  return id.trim()
}

/** Returns true if Client ID is configured (file or env). */
export function isGoogleClientIdConfigured(): boolean {
  try {
    getGoogleClientId()
    return true
  } catch {
    return false
  }
}

/** Save Google Client ID to config file (userData). Invalidates cache. */
export function setGoogleClientId(clientId: string): void {
  const path = getConfigPath()
  const trimmed = clientId.trim()
  if (!trimmed) throw new Error('El Client ID no puede estar vacío.')
  const config = readConfig()
  config.googleClientId = trimmed
  cached = config
  writeFileSync(path, JSON.stringify(config, null, 2), 'utf8')
}

/** Path to the config file (for display only; only main process should read/write). */
export function getIntegrationsConfigPath(): string {
  return getConfigPath()
}
