import React, { useState } from 'react'
import { PlusIcon, Trash2Icon, PencilIcon, GripVerticalIcon } from 'lucide-react'
import { Button } from '@renderer/components/button'
import { Input } from '@renderer/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/components/dialog'
import { Field } from '@renderer/components/field'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/components/tooltip'
import { colorPresetToCss } from '@renderer/lib/constants'
import { formatDuration, durationMinutes } from '@renderer/lib/timeUtils'
import type { Template } from '@shared/templates'
import type { Project } from '@shared/projects'
import { TemplateDeleteConfirmDialog } from './TemplateDeleteConfirmDialog'

interface TemplateSectionProps {
  templates: Template[]
  projects: Project[]
  onSave: (templates: Template[]) => Promise<void>
}

interface TemplateEntryDraft {
  id: string
  projectId: string
  startTime: string
  endTime: string
  description: string
}

interface TemplateFormState {
  name: string
  entries: TemplateEntryDraft[]
}

function createEmptyEntry(): TemplateEntryDraft {
  return {
    id: crypto.randomUUID(),
    projectId: '',
    startTime: '09:00',
    endTime: '10:00',
    description: ''
  }
}

function templateToFormState(template: Template): TemplateFormState {
  return {
    name: template.name,
    entries: template.entries.map((e) => ({ ...e }))
  }
}

function totalDuration(entries: TemplateEntryDraft[]): string | null {
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TemplateFormState | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null)

  const handleNew = (): void => {
    setEditingId('new')
    setForm({ name: '', entries: [createEmptyEntry()] })
  }

  const handleEdit = (template: Template): void => {
    setEditingId(template.id)
    setForm(templateToFormState(template))
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deletingTemplate) return
    await onSave(templates.filter((t) => t.id !== deletingTemplate.id))
    setDeletingTemplate(null)
  }

  const handleClose = (): void => {
    setEditingId(null)
    setForm(null)
  }

  const handleSave = async (): Promise<void> => {
    if (!form || !form.name.trim() || form.entries.length === 0) return

    const validEntries = form.entries.filter((e) => e.projectId && e.startTime && e.endTime)
    if (validEntries.length === 0) return

    const template: Template = {
      id: editingId === 'new' ? crypto.randomUUID() : editingId!,
      name: form.name.trim(),
      entries: validEntries
    }

    if (editingId === 'new') {
      await onSave([...templates, template])
    } else {
      await onSave(templates.map((t) => (t.id === template.id ? template : t)))
    }
    handleClose()
  }

  const updateEntry = (index: number, patch: Partial<TemplateEntryDraft>): void => {
    if (!form) return
    setForm({
      ...form,
      entries: form.entries.map((e, i) => (i === index ? { ...e, ...patch } : e))
    })
  }

  const addEntry = (): void => {
    if (!form) return
    const last = form.entries[form.entries.length - 1]
    const newEntry = createEmptyEntry()
    if (last) {
      newEntry.startTime = last.endTime
      const endMins =
        Number.parseInt(last.endTime.split(':')[0]) * 60 +
        Number.parseInt(last.endTime.split(':')[1]) +
        60
      const h = String(Math.min(Math.floor(endMins / 60), 23)).padStart(2, '0')
      const m = String(endMins % 60).padStart(2, '0')
      newEntry.endTime = `${h}:${m}`
    }
    setForm({ ...form, entries: [...form.entries, newEntry] })
  }

  const removeEntry = (index: number): void => {
    if (!form) return
    setForm({ ...form, entries: form.entries.filter((_, i) => i !== index) })
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
          {templates.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-4 rounded-lg transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.entries.length}件のエントリ
                  {(() => {
                    const dur = totalDuration(t.entries)
                    return dur ? ` · 合計 ${dur}` : ''
                  })()}
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
          ))}
        </ul>
      )}

      {/* Delete confirm dialog */}
      <TemplateDeleteConfirmDialog
        open={deletingTemplate !== null}
        template={deletingTemplate}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTemplate(null)}
      />

      {/* Edit dialog */}
      <Dialog open={editingId !== null} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingId === 'new' ? 'テンプレート作成' : 'テンプレート編集'}
            </DialogTitle>
          </DialogHeader>

          {form && (
            <div className="flex-1 overflow-y-auto py-4 px-1 space-y-4">
              <Field.Root>
                <Field.Label>テンプレート名</Field.Label>
                <Field.Control>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例: 通常勤務日"
                  />
                </Field.Control>
              </Field.Root>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">エントリ</span>
                  <Button variant="ghost" size="sm" onClick={addEntry}>
                    <PlusIcon className="h-4 w-4 mr-1" />
                    追加
                  </Button>
                </div>

                {form.entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30"
                  >
                    <GripVerticalIcon className="h-4 w-4 mt-2.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 grid gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Field.Root className="gap-y-1">
                          <Field.Label className="text-xs">開始</Field.Label>
                          <Field.Control>
                            <Input
                              value={entry.startTime}
                              onChange={(e) => updateEntry(index, { startTime: e.target.value })}
                              placeholder="09:00"
                              className="h-8 text-sm"
                            />
                          </Field.Control>
                        </Field.Root>
                        <Field.Root className="gap-y-1">
                          <Field.Label className="text-xs">終了</Field.Label>
                          <Field.Control>
                            <Input
                              value={entry.endTime}
                              onChange={(e) => updateEntry(index, { endTime: e.target.value })}
                              placeholder="10:00"
                              className="h-8 text-sm"
                            />
                          </Field.Control>
                        </Field.Root>
                      </div>
                      <Field.Root className="gap-y-1">
                        <Field.Label className="text-xs">案件</Field.Label>
                        <Select
                          value={entry.projectId}
                          onValueChange={(v) => updateEntry(index, { projectId: v })}
                        >
                          <Field.Control>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="案件を選択" />
                            </SelectTrigger>
                          </Field.Control>
                          <SelectContent>
                            {projects.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                <span className="flex items-center gap-2">
                                  <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colorPresetToCss(p.color) }}
                                  />
                                  {p.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field.Root>
                      <Field.Root className="gap-y-1">
                        <Field.Label className="text-xs">説明</Field.Label>
                        <Field.Control>
                          <Input
                            value={entry.description}
                            onChange={(e) => updateEntry(index, { description: e.target.value })}
                            placeholder="作業内容など"
                            className="h-8 text-sm"
                          />
                        </Field.Control>
                      </Field.Root>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-destructive hover:bg-transparent shrink-0 mt-1"
                      onClick={() => removeEntry(index)}
                      disabled={form.entries.length <= 1}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:bg-muted"
              onClick={handleClose}
            >
              キャンセル
            </Button>
            <Button
              variant="ghost"
              className="text-primary-foreground hover:bg-primary"
              onClick={handleSave}
              disabled={!form?.name.trim() || !form?.entries.some((e) => e.projectId)}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
