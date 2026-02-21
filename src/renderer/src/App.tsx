import React, { useState } from 'react'
import { CalendarDays, BarChart2, FolderKanban, Settings } from 'lucide-react'
import { LogPage } from '@renderer/pages/LogPage'
import { SummaryPage } from '@renderer/pages/SummaryPage'
import { ProjectPage } from '@renderer/pages/ProjectPage'
import { SettingsPage } from '@renderer/pages/SettingsPage'
import { useProjects } from '@renderer/hooks/useProjects'

type Tab = 'log' | 'summary' | 'projects' | 'settings'

const NAV_ITEMS: { tab: Tab; icon: React.ReactNode; label: string }[] = [
  { tab: 'log', icon: <CalendarDays className="w-5 h-5" />, label: '稼働' },
  { tab: 'summary', icon: <BarChart2 className="w-5 h-5" />, label: '集計' },
  { tab: 'projects', icon: <FolderKanban className="w-5 h-5" />, label: '案件' },
  { tab: 'settings', icon: <Settings className="w-5 h-5" />, label: '設定' }
]

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('log')
  const { projects, activeProjects, save: saveProjects, loading } = useProjects()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <nav className="w-16 bg-gray-900 flex flex-col items-center py-4 gap-1 shrink-0">
        {NAV_ITEMS.map(({ tab, icon, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center gap-1 w-12 py-2 rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {icon}
            <span className="text-[10px] leading-none">{label}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'log' && <LogPage projects={activeProjects} />}
        {activeTab === 'summary' && <SummaryPage projects={projects} />}
        {activeTab === 'projects' && <ProjectPage projects={projects} onSave={saveProjects} />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>
    </div>
  )
}

export default App
