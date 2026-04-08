import React, { useEffect, useState } from 'react'
import { PlusIcon, Trash2Icon, GripVerticalIcon } from 'lucide-react'
import { Button } from '@renderer/shared/ui/button'
import { Input } from '@renderer/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/shared/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/shared/ui/dialog'
import { Field } from '@renderer/shared/ui/field'
import { cn } from '@renderer/shared/lib/cn'
import type { Template } from '@shared/templates'
import type { Project } from '@shared/projects'
import { colorPresetToCss } from '@renderer/entities/config'

interface TemplateEntryDraft {
  id: string
  projectId: string | undefined // undefined = 未選択
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
    projectId: undefined,
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

export interface TemplateFormDialogProps {
  open: boolean
  template: Template | null // null = 新規作成
  projects: Project[]
  onSave: (template: Template) => Promise<void>
  onClose: () => void
}

export function TemplateFormDialog({
  open,
  template,
  projects,
  onSave,
  onClose
}: TemplateFormDialogProps): React.JSX.Element {
  const [form, setForm] = useState<TemplateFormState | null>(null)
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      setForm(
        template ? templateToFormState(template) : { name: '', entries: [createEmptyEntry()] }
      )
      setValidationErrors(new Set())
    }
  }, [open, template])

  const handleClose = (): void => {
    onClose()
  }

  const handleSave = async (): Promise<void> => {
    if (!form || !form.name.trim() || form.entries.length === 0) return

    const invalidIds = new Set(
      form.entries.filter((e) => e.projectId === undefined).map((e) => e.id)
    )
    if (invalidIds.size > 0) {
      setValidationErrors(invalidIds)
      return
    }

    const validEntries = form.entries as (TemplateEntryDraft & { projectId: string })[]
    const saved: Template = {
      id: template?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      entries: validEntries
    }

    await onSave(saved)
  }

  const updateEntry = (index: number, patch: Partial<TemplateEntryDraft>): void => {
    if (!form) return
    if (patch.projectId) {
      const entryId = form.entries[index].id
      setValidationErrors((prev) => {
        const next = new Set(prev)
        next.delete(entryId)
        return next
      })
    }
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
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{template === null ? 'テンプレート作成' : 'テンプレート編集'}</DialogTitle>
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
                    <Field.Root className="gap-y-1" invalid={validationErrors.has(entry.id)}>
                      <Field.Label className="text-xs">案件</Field.Label>
                      <Select
                        value={entry.projectId ?? ''}
                        onValueChange={(v) => updateEntry(index, { projectId: v })}
                      >
                        <Field.Control>
                          <SelectTrigger
                            className={cn(
                              'h-8 text-sm',
                              validationErrors.has(entry.id) && 'border-destructive'
                            )}
                          >
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
                      {validationErrors.has(entry.id) && (
                        <p className="text-xs text-destructive">案件を選択してください</p>
                      )}
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
            disabled={!form?.name.trim()}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
