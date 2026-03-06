import { useState } from 'react'
import type { Page } from './components/Sidebar'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Goals } from './pages/Goals'
import { Habits } from './pages/Habits'
import { Calendar } from './pages/Calendar'
import { Projects } from './pages/Projects'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
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
