import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@renderer/components/dialog'
import { Button } from '@renderer/components/button'
import type { LogEntry } from '@shared/logs'
import type { Project } from '@shared/projects'

interface DeleteConfirmDialogProps {
  open: boolean
  entry: LogEntry | null
  projects: Project[]
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function DeleteConfirmDialog({
  open,
  entry,
  projects,
  onConfirm,
  onCancel
}: DeleteConfirmDialogProps): React.JSX.Element {
  const [deleting, setDeleting] = React.useState(false)
  const project = entry ? projects.find((p) => p.id === entry.projectId) : undefined

  async function handleConfirm(): Promise<void> {
    setDeleting(true)
    try {
      await onConfirm()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>稼働ログ削除</DialogTitle>
          <DialogDescription>
            以下のログを削除しますか？この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>

        {entry && (
          <div className="text-sm text-gray-700 space-y-1 py-2">
            <p>
              <span className="font-medium">案件:</span>{' '}
              {project ? (
                <span className="inline-flex items-center gap-1">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </span>
              ) : (
                '(不明)'
              )}
            </p>
            <p>
              <span className="font-medium">日付:</span> {entry.date}
            </p>
            <p>
              <span className="font-medium">時刻:</span> {entry.startTime} 〜 {entry.endTime}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={deleting}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting ? '削除中...' : '削除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
