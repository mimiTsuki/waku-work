import React, { Suspense, useState } from 'react'
import { BarChart2, CalendarDays, FolderKanban, Settings } from 'lucide-react'
import { Toast } from '@renderer/shared/ui/toast'
import { cn } from '@renderer/shared/lib/cn'
import { useTheme } from '@renderer/app/model/theme'
import { TimesheetPage } from '@renderer/pages/timesheet'
import { SummaryPage } from '@renderer/pages/summary'
import { ProjectPage } from '@renderer/pages/projects'
import { SettingsPage } from '@renderer/pages/settings'
import { ConfigContext, useConfig } from '@renderer/entities/config'

type Tab = 'log' | 'summary' | 'projects' | 'settings'

const NAV_ITEMS: { tab: Tab; icon: React.ReactNode; label: string }[] = [
  { tab: 'log', icon: <CalendarDays className="w-5 h-5" />, label: '稼働' },
  { tab: 'summary', icon: <BarChart2 className="w-5 h-5" />, label: '集計' },
  { tab: 'projects', icon: <FolderKanban className="w-5 h-5" />, label: '案件' },
  { tab: 'settings', icon: <Settings className="w-5 h-5" />, label: '設定' }
]

function App(): React.JSX.Element {
  return (
    <Toast.Provider>
      <Suspense fallback={<div>loading...</div>}>
        <AppInner />
      </Suspense>
      <Toast.Viewport />
    </Toast.Provider>
  )
}

function AppInner(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('log')
  const { data: config } = useConfig()
  useTheme(config)

  return (
    <ConfigContext.Provider value={config}>
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
          <Suspense fallback={<div>loading...</div>}>
            {activeTab === 'log' && <TimesheetPage />}
            {activeTab === 'summary' && <SummaryPage />}
            {activeTab === 'projects' && <ProjectPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </Suspense>
        </main>
      </div>
    </ConfigContext.Provider>
  )
}

export default App
