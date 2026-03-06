import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Goals } from './pages/Goals'
import { Habits } from './pages/Habits'

type Page = 'dashboard' | 'goals' | 'habits'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'goals' && <Goals />}
        {currentPage === 'habits' && <Habits />}
      </main>
    </div>
  )
}

export default App
