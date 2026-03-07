import { create } from 'zustand'

export type GoogleCalendarStatus = 'disconnected' | 'connected' | 'loading' | 'error'

export interface NextEvent {
  title: string
  startAt: string
  endAt: string
}

function getIntegrationsApi(): typeof window.api.integrations | undefined {
  return typeof window !== 'undefined' ? window.api?.integrations : undefined
}

interface ConnectionsState {
  googleCalendarStatus: GoogleCalendarStatus
  googleCalendarEmail: string | null
  googleCalendarLastSyncAt: string | null
  nextEvent: NextEvent | null
  error: string | null
  canStoreTokens: boolean
  googleClientIdConfigured: boolean
  fetchStatus: () => Promise<void>
  fetchNextEvent: () => Promise<void>
  connectGoogleCalendar: () => Promise<void>
  disconnectGoogleCalendar: () => Promise<void>
  syncGoogleCalendar: () => Promise<void>
  clearError: () => void
}

export const useConnectionsStore = create<ConnectionsState>((set, get) => ({
  googleCalendarStatus: 'disconnected',
  googleCalendarEmail: null,
  googleCalendarLastSyncAt: null,
  nextEvent: null,
  error: null,
  canStoreTokens: true,
  googleClientIdConfigured: false,

  fetchStatus: async () => {
    const api = getIntegrationsApi()
    if (!api) {
      set({ googleCalendarStatus: 'error', error: 'API no disponible. Cierra y vuelve a abrir la app.' })
      return
    }
    try {
      const status = await api.getStatus()
      set({
        canStoreTokens: status.canStoreTokens,
        googleClientIdConfigured: status.googleClientIdConfigured,
        googleCalendarStatus:
          status.googleCalendar.status === 'connected' ? 'connected' : 'disconnected',
        googleCalendarEmail:
          status.googleCalendar.status === 'connected' ? status.googleCalendar.email : null,
        googleCalendarLastSyncAt:
          status.googleCalendar.status === 'connected' ? status.googleCalendar.lastSyncAt : null,
        error: null
      })
    } catch {
      set({ googleCalendarStatus: 'error', error: 'Error al cargar estado' })
    }
  },

  fetchNextEvent: async () => {
    const api = getIntegrationsApi()
    if (!api) return
    try {
      const event = await api.getNextCalendarEvent()
      set({ nextEvent: event })
    } catch {
      set({ nextEvent: null })
    }
  },

  connectGoogleCalendar: async () => {
    const api = getIntegrationsApi()
    if (!api) {
      set({ googleCalendarStatus: 'error', error: 'API no disponible. Cierra y vuelve a abrir la app.' })
      return
    }
    set({ googleCalendarStatus: 'loading', error: null })
    try {
      const result = await api.connectGoogleCalendar()
      set({
        googleCalendarStatus: 'connected',
        googleCalendarEmail: result.email,
        googleCalendarLastSyncAt: null,
        error: null
      })
      await get().fetchNextEvent()
    } catch (err) {
      set({
        googleCalendarStatus: 'error',
        error: err instanceof Error ? err.message : 'Error al conectar'
      })
    }
  },

  disconnectGoogleCalendar: async () => {
    const api = getIntegrationsApi()
    if (!api) return
    set({ googleCalendarStatus: 'loading', error: null })
    try {
      await api.disconnectGoogleCalendar()
      set({
        googleCalendarStatus: 'disconnected',
        googleCalendarEmail: null,
        googleCalendarLastSyncAt: null,
        nextEvent: null,
        error: null
      })
    } catch (err) {
      set({
        googleCalendarStatus: 'error',
        error: err instanceof Error ? err.message : 'Error al desconectar'
      })
    }
  },

  syncGoogleCalendar: async () => {
    const api = getIntegrationsApi()
    if (!api) return
    const { googleCalendarStatus } = get()
    if (googleCalendarStatus !== 'connected') return
    set({ error: null })
    try {
      const result = await api.syncGoogleCalendar()
      set({
        googleCalendarLastSyncAt: result.lastSyncAt,
        error: null
      })
      await get().fetchNextEvent()
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al sincronizar'
      })
    }
  },

  clearError: () => set({ error: null })
}))
