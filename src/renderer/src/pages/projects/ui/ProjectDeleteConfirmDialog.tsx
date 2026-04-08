import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@renderer/shared/ui/dialog'
import { Button } from '@renderer/shared/ui/button'
import type { Project } from '@shared/projects'
import { colorPresetToCss } from '@renderer/entities/config'

interface ProjectDeleteConfirmDialogProps {
  open: boolean
  project: Project | null
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function ProjectDeleteConfirmDialog({
  open,
  project,
  onConfirm,
  onCancel
}: ProjectDeleteConfirmDialogProps): React.JSX.Element {
  const [deleting, setDeleting] = React.useState(false)

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>案件削除</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <DialogDescription>
            以下の案件を削除しますか？この操作は元に戻せません。
          </DialogDescription>

          {project && (
            <div className="text-sm py-2 p-4 rounded-lg bg-card">
              <p>
                <span className="font-medium">案件:</span>{' '}
                <span className="inline-flex items-center gap-1">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colorPresetToCss(project.color) }}
                  />
                  {project.name}
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="default" onClick={onCancel} disabled={deleting}>
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
