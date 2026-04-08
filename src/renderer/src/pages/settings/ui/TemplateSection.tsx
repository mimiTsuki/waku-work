import React, { useState } from 'react'
import { PlusIcon, Trash2Icon, PencilIcon } from 'lucide-react'
import { Button } from '@renderer/shared/ui/button'
import { Toast } from '@renderer/shared/ui/toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/shared/ui/tooltip'
import { formatDuration, durationMinutes } from '@renderer/shared/lib/time'
import { useToast } from '@renderer/shared/ui/toast/useToast'
import type { Template } from '@shared/templates'
import type { Project } from '@shared/projects'
import { TemplateDeleteConfirmDialog } from './TemplateDeleteConfirmDialog'
import { TemplateFormDialog } from './TemplateFormDialog'
import { colorPresetToCss } from '@renderer/entities/config'

interface TemplateSectionProps {
  templates: Template[]
  projects: Project[]
  onSave: (templates: Template[]) => void
}

function totalDuration(entries: Template['entries']): string | null {
  try {
    const total = entries.reduce((sum, e) => {
      const mins = durationMinutes(e.startTime, e.endTime)
      return sum + (mins > 0 ? mins : 0)
    }, 0)
    return total > 0 ? formatDuration(total) : null
  } catch {
    return null
  }
}

export function TemplateSection({
  templates,
  projects,
  onSave
}: TemplateSectionProps): React.JSX.Element {
  const [editingTemplate, setEditingTemplate] = useState<Template | null | undefined>(undefined)
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null)
  const toast = useToast()

  const handleNew = (): void => {
    setEditingTemplate(null)
  }

  const handleEdit = (template: Template): void => {
    setEditingTemplate(template)
  }

  const handleDialogClose = (): void => {
    setEditingTemplate(undefined)
  }

  const handleDialogSave = async (template: Template): Promise<void> => {
    const isNew = !templates.some((t) => t.id === template.id)
    try {
      if (isNew) {
        onSave([...templates, template])
      } else {
        onSave(templates.map((t) => (t.id === template.id ? template : t)))
      }
      handleDialogClose()
    } catch {
      toast.error({ title: '保存に失敗しました', description: '再度お試しください。' })
    }
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deletingTemplate) return
    try {
      onSave(templates.filter((t) => t.id !== deletingTemplate.id))
      setDeletingTemplate(null)
    } catch {
      toast.error({ title: '削除に失敗しました', description: '再度お試しください。' })
    }
  }

  return (
    <TooltipProvider>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">テンプレート</h2>
        <Button size="sm" onClick={handleNew}>
          <PlusIcon className="h-4 w-4 mr-1" />
          新規作成
        </Button>
      </div>

      {/* Template list */}
      {templates.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          テンプレートがありません
        </div>
      ) : (
        <ul className="space-y-2">
          {templates.map((t) => {
            const dur = totalDuration(t.entries)
            return (
              <li key={t.id} className="flex items-center gap-3 p-4 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.entries.length}件のエントリ
                    {dur && ` · 合計 ${dur}`}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.entries.map((e) => {
                      const project = projects.find((p) => p.id === e.projectId)
                      return (
                        <span
                          key={e.id}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted/50"
                        >
                          {project && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: colorPresetToCss(project.color) }}
                            />
                          )}
                          {e.startTime}-{e.endTime}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>編集</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-destructive hover:bg-transparent"
                      onClick={() => setDeletingTemplate(t)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>削除</TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ul>
      )}

      {/* Delete confirm dialog */}
      <TemplateDeleteConfirmDialog
        open={deletingTemplate !== null}
        template={deletingTemplate}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTemplate(null)}
      />

      {/* Form dialog (create / edit) */}
      <TemplateFormDialog
        open={editingTemplate !== undefined}
        template={editingTemplate ?? null}
        projects={projects}
        onSave={handleDialogSave}
        onClose={handleDialogClose}
      />

      {/* Error toast */}
      <Toast.Root
        variant="error"
        open={toast.state.open}
        onOpenChange={(open) => !open && toast.close()}
      >
        <div className="grid gap-1">
          <Toast.Title>{toast.state.title}</Toast.Title>
          <Toast.Description>{toast.state.description}</Toast.Description>
        </div>
        <Toast.Close />
      </Toast.Root>
    </TooltipProvider>
  )
}
