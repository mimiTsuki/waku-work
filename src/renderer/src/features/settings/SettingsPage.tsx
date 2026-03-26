import React from 'react'
import { Button } from '@renderer/components/button'
import { Label } from '@renderer/components/label'
import { IS_ELECTRON, selectFolder } from '@renderer/api'
import { useConfig } from './useConfig'

export function SettingsPage(): React.JSX.Element {
  const { config, loading, save } = useConfig()

  const handleSelectFolder = async (): Promise<void> => {
    const folder = await selectFolder()
    if (folder && config) {
      await save({ ...config, dataDir: folder })
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">設定</h2>
      {IS_ELECTRON && (
        <div className="grid gap-2">
          <Label>データ保存フォルダ</Label>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 flex-1 truncate">
              {loading ? '読み込み中...' : (config?.dataDir ?? '未設定')}
            </span>
            <Button variant="outline" size="sm" onClick={handleSelectFolder}>
              変更
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
