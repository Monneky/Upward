type Page = 'dashboard' | 'goals' | 'habits'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'goals', label: 'Goals' },
    { id: 'habits', label: 'Habits' }
  ]

  return (
    <aside className="w-56 flex-shrink-0 border-r border-gray-700 bg-gray-900">
      <div className="flex h-full flex-col p-4">
        <h1 className="mb-6 text-lg font-semibold text-gray-100">Upward</h1>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
