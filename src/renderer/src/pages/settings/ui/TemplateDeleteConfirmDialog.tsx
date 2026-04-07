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
import type { Template } from '@shared/templates'

interface TemplateDeleteConfirmDialogProps {
  open: boolean
  template: Template | null
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function TemplateDeleteConfirmDialog({
  open,
  template,
  onConfirm,
  onCancel
}: TemplateDeleteConfirmDialogProps): React.JSX.Element {
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
          <DialogTitle>テンプレート削除</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <DialogDescription>
            以下のテンプレートを削除しますか？この操作は元に戻せません。
          </DialogDescription>

          {template && (
            <div className="text-sm py-2 p-4 rounded-lg bg-card">
              <p>
                <span className="font-medium">テンプレート:</span> {template.name}
              </p>
              <p className="text-muted-foreground mt-1">{template.entries.length}件のエントリ</p>
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
