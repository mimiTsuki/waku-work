import React, { useState, useEffect } from 'react'
import { Button } from '@renderer/components/shadcn/button'
import { Label } from '@renderer/components/shadcn/label'
import type { AppConfig } from '@renderer/lib/types'

export function SettingsPage(): React.JSX.Element {
  const [config, setConfig] = useState<AppConfig | null>(null)

  useEffect(() => {
    window.api.readConfig().then((c) => setConfig(c))
  }, [])

  const handleSelectFolder = async (): Promise<void> => {
    const folder = await window.api.selectFolder()
    if (folder && config) {
      const updated: AppConfig = { ...config, dataDir: folder }
      await window.api.writeConfig(updated)
      setConfig(updated)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">設定</h2>
      <div className="grid gap-2">
        <Label>データ保存フォルダ</Label>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 flex-1 truncate">
            {config?.dataDir ?? '読み込み中...'}
          </span>
          <Button variant="outline" size="sm" onClick={handleSelectFolder}>
            変更
          </Button>
        </div>
      </div>
    </div>
  )
}
