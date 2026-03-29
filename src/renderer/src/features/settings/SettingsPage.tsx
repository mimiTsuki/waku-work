import React, { useState } from 'react'
import { Button } from '@renderer/components/button'
import { Field } from '@renderer/components/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/select'
import { IS_ELECTRON, selectFolder } from '@renderer/api'
import { themeTypes } from '@shared/config'
import type { Theme } from '@shared/config'
import type { Template } from '@shared/templates'
import type { Project } from '@shared/projects'
import { TemplateSection } from '@renderer/features/templates'
import { cn } from '@renderer/lib/utils'
import { useConfig } from './useConfig'

type SettingsTab = 'general' | 'templates'

const SUB_NAV_ITEMS: { tab: SettingsTab; label: string }[] = [
  { tab: 'general', label: '一般' },
  { tab: 'templates', label: 'テンプレート' }
]

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: themeTypes.SYSTEM, label: 'システム' },
  { value: themeTypes.LIGHT, label: 'ライト' },
  { value: themeTypes.DARK, label: 'ダーク' }
]

interface SettingsPageProps {
  templates: Template[]
  projects: Project[]
  onSaveTemplates: (templates: Template[]) => Promise<void>
}

export function SettingsPage({
  templates,
  projects,
  onSaveTemplates
}: SettingsPageProps): React.JSX.Element {
  const { config, loading, save } = useConfig()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  const handleSelectFolder = async (): Promise<void> => {
    const folder = await selectFolder()
    if (folder && config) {
      await save({ ...config, dataDir: folder })
    }
  }

  const handleThemeChange = async (theme: Theme): Promise<void> => {
    if (config) {
      await save({ ...config, theme })
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sub navigation */}
      <nav className="w-40 shrink-0 text-nav-foreground bg-nav dark:bg-background flex flex-col gap-1 py-4 px-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
          設定
        </p>
        {SUB_NAV_ITEMS.map(({ tab, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'cursor-pointer text-left text-sm w-full px-3 py-2 rounded-lg transition-colors',
              activeTab === tab
                ? 'bg-primary dark:text-primary-foreground dark:bg-primary'
                : 'hover:bg-primary/30'
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-10 px-6">
        <div className="max-w-2xl w-full mx-auto">
          {activeTab === 'general' && (
            <div className="rounded-2xl border border-transparent bg-card p-6">
              <h2 className="text-lg font-medium mb-6">一般</h2>

              <Field.Root className="mb-6">
                <Field.Label>テーマ</Field.Label>
                <Select value={config?.theme} onValueChange={(v) => handleThemeChange(v as Theme)}>
                  <Field.Control>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                  </Field.Control>
                  <SelectContent>
                    {THEME_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field.Root>

              <Field.Root className="mb-6">
                <Field.Label>週の始まり</Field.Label>
                <Select
                  value={config?.weekStartOnMonday === false ? 'sunday' : 'monday'}
                  onValueChange={(v) => {
                    if (config) save({ ...config, weekStartOnMonday: v === 'monday' })
                  }}
                >
                  <Field.Control>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                  </Field.Control>
                  <SelectContent>
                    <SelectItem value="monday">月曜日</SelectItem>
                    <SelectItem value="sunday">日曜日</SelectItem>
                  </SelectContent>
                </Select>
              </Field.Root>

              {IS_ELECTRON && (
                <Field.Root>
                  <Field.Label>データ保存フォルダ</Field.Label>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      {loading ? '読み込み中...' : (config?.dataDir ?? '未設定')}
                    </span>
                    <Field.Control>
                      <Button variant="outline" size="sm" onClick={handleSelectFolder}>
                        変更
                      </Button>
                    </Field.Control>
                  </div>
                </Field.Root>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="rounded-2xl border border-transparent bg-card p-6">
              <TemplateSection templates={templates} projects={projects} onSave={onSaveTemplates} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
