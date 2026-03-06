import { useEffect, useSyncExternalStore, useState } from 'react'
import type { Page } from './components/Sidebar'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from '@renderer/pages/Dashboard'
import { Goals } from '@renderer/pages/Goals'
import { Habits } from '@renderer/pages/Habits'
import { Calendar } from '@renderer/pages/Calendar'
import { Projects } from '@renderer/pages/Projects'

type Theme = 'light' | 'dark'
type ThemeMode = 'light' | 'dark' | 'system'

function subscribeSystemTheme(cb: () => void): () => void {
  const m = window.matchMedia('(prefers-color-scheme: dark)')
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system'

    const storedMode = window.localStorage.getItem('themeMode')
    if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
      return storedMode
    }

    const legacyTheme = window.localStorage.getItem('theme')
    if (legacyTheme === 'light' || legacyTheme === 'dark') {
      return legacyTheme
    }

    return 'system'
  })

  const systemPrefersDark = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemPrefersDark,
    () => false
  )

  const resolvedTheme: Theme =
    themeMode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : themeMode

  const applyThemeToDom = (mode: ThemeMode, resolved: Theme): void => {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-light')
    root.classList.add(resolved === 'dark' ? 'theme-dark' : 'theme-light')
    window.localStorage.setItem('themeMode', mode)
    window.localStorage.setItem('theme', resolved)
  }

  useEffect(() => {
    applyThemeToDom(themeMode, resolvedTheme)
  }, [resolvedTheme, themeMode])

  const handleThemeChange = (mode: ThemeMode): void => {
    const resolved: Theme = mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode
    applyThemeToDom(mode, resolved)
    setThemeMode(mode)
  }

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          themeMode={themeMode}
          onChangeThemeMode={handleThemeChange}
        />
      </aside>
      <main className="app-main">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'goals' && <Goals />}
        {currentPage === 'habits' && <Habits />}
        {currentPage === 'calendar' && <Calendar />}
        {currentPage === 'projects' && <Projects />}
      </main>
    </div>
  )
}

export default App
