import { useEffect, useState } from 'react'
import type { Page } from './components/Sidebar'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Goals } from './pages/Goals'
import { Habits } from './pages/Habits'
import { Calendar } from './pages/Calendar'
import { Projects } from './pages/Projects'

type Theme = 'light' | 'dark'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = window.localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-light')
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light')
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          theme={theme}
          onToggleTheme={toggleTheme}
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
