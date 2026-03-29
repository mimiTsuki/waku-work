import { ProjectPage, useProjects } from '@renderer/features/projects'
import { SettingsPage, useTheme } from '@renderer/features/settings'
import { SummaryPage } from '@renderer/features/summary'
import { useTemplates } from '@renderer/features/templates'
import { TimesheetPage } from '@renderer/features/timesheet'
import { cn } from '@renderer/lib/utils'
import { BarChart2, CalendarDays, FolderKanban, Settings } from 'lucide-react'
import React, { useState } from 'react'

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
  const { templates, save: saveTemplates } = useTemplates()
  useTheme()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <nav className="w-24 text-nav-foreground bg-nav dark:bg-background flex flex-col items-center gap-1 shrink-0 py-4 px-4">
        {NAV_ITEMS.map(({ tab, icon, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'cursor-pointer flex flex-col items-center gap-1 w-full py-2 rounded-lg transition-colors',
              activeTab === tab
                ? 'bg-primary dark:text-primary-foreground dark:bg-primary'
                : 'hover:bg-primary/30'
            )}
          >
            {icon}
            <span className="text-[10px] leading-none">{label}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'log' && <TimesheetPage projects={activeProjects} templates={templates} />}
        {activeTab === 'summary' && <SummaryPage projects={projects} />}
        {activeTab === 'projects' && <ProjectPage projects={projects} onSave={saveProjects} />}
        {activeTab === 'settings' && (
          <SettingsPage
            templates={templates}
            projects={activeProjects}
            onSaveTemplates={saveTemplates}
          />
        )}
      </main>
    </div>
  )
}

export default App
