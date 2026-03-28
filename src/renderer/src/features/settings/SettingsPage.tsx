import React from 'react'
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
import { useConfig } from './useConfig'

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: themeTypes.SYSTEM, label: 'システム' },
  { value: themeTypes.LIGHT, label: 'ライト' },
  { value: themeTypes.DARK, label: 'ダーク' }
]

export function SettingsPage(): React.JSX.Element {
  const { config, loading, save } = useConfig()

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
    <div className="flex flex-col h-full py-12 px-6">
      <div className="flex flex-col max-w-xl w-full mx-auto rounded-2xl border border-transparent bg-card p-6 overflow-y-auto">
        <Field.Root className="mb-6">
          <Field.Label className="text-lg">テーマ</Field.Label>
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
    </div>
  )
}
