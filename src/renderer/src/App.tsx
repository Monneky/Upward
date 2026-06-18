import { useEffect, useSyncExternalStore, useState } from 'react'
import type { Page } from './components/Sidebar'
import { Sidebar } from './components/Sidebar'
import { Routines } from '@renderer/pages/Routines'
import { Projects } from '@renderer/pages/Projects'
import { ProjectDetail } from '@renderer/pages/ProjectDetail'

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
  const [currentPage, setCurrentPage] = useState<Page>('routine')
  const [openProjectId, setOpenProjectId] = useState<number | null>(null)

  const handleNavigate = (page: Page): void => {
    setOpenProjectId(null)
    setCurrentPage(page)
  }

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
          onNavigate={handleNavigate}
          themeMode={themeMode}
          onChangeThemeMode={handleThemeChange}
        />
      </aside>
      <main className="app-main">
        {currentPage === 'routine' && <Routines />}
        {currentPage === 'projects' &&
          (openProjectId === null ? (
            <Projects onOpenProject={setOpenProjectId} />
          ) : (
            <ProjectDetail projectId={openProjectId} onBack={() => setOpenProjectId(null)} />
          ))}
      </main>
    </div>
  )
}

export default App
