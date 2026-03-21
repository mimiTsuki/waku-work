import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/components/dialog'
import { Button } from '@renderer/components/button'
import { Input } from '@renderer/components/input'
import { Textarea } from '@renderer/components/textarea'
import { Label } from '@renderer/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/select'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/popover'
import { DatePicker } from '@renderer/components/datePicker'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import {
  parseDateKey,
  formatDateKey,
  formatDuration,
  durationMinutes
} from '@renderer/lib/timeUtils'
import type { LogEntry } from '@shared/logs'
import type { Project } from '@shared/projects'
import { schema, type LogForm, logEntryToForm, formToLogEntry } from '../models/logForm'

export interface ModalCreateState {
  kind: 'create'
  date: string
  startTime: string
  endTime: string
}

export interface ModalEditState {
  kind: 'edit'
  originalEntry: LogEntry
}

export type ModalInitialState = ModalCreateState | ModalEditState

interface LogFormModalProps {
  open: boolean
  defaultValues?: ModalInitialState
  projects: Project[]
  onSave: (entry: LogEntry) => Promise<void>
  onClose: () => void
}

export function LogFormModal({
  open,
  defaultValues,
  projects,
  onSave,
  onClose
}: LogFormModalProps): React.JSX.Element {
  const [calOpen, setCalOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LogForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: formatDateKey(new Date()),
      startTime: '09:00',
      endTime: '10:00',
      projectId: '',
      memo: ''
    }
  })

  useEffect(() => {
    if (open) {
      if (defaultValues?.kind === 'edit') {
        reset(logEntryToForm(defaultValues.originalEntry))
      } else {
        reset({
          date: defaultValues?.date ?? formatDateKey(new Date()),
          startTime: defaultValues?.startTime ?? '09:00',
          endTime: defaultValues?.endTime ?? '10:00',
          projectId: projects[0]?.id ?? '',
          memo: ''
        })
      }
    }
  }, [open, defaultValues, projects, reset])

  const [startTime, endTime, dateStr, memo] = watch(['startTime', 'endTime', 'date', 'memo'])

  const duration = (() => {
    try {
      const mins = durationMinutes(startTime, endTime)
      return mins > 0 ? formatDuration(mins) : null
    } catch {
      return null
    }
  })()

  async function onSubmit(data: LogForm): Promise<void> {
    const original = defaultValues?.kind === 'edit' ? defaultValues.originalEntry : undefined
    await onSave(formToLogEntry(data, original))
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {defaultValues?.kind === 'edit' ? '稼働ログ編集' : '稼働ログ追加'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-2">
            {/* Date */}
            <div className="grid gap-1.5">
              <Label>日付</Label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !dateStr && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateStr ? format(parseDateKey(dateStr), 'yyyy/MM/dd') : '日付を選択'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DatePicker
                    selected={dateStr ? parseDateKey(dateStr) : new Date()}
                    onSelect={(d) => {
                      setValue('date', formatDateKey(d))
                      setCalOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>開始時刻</Label>
                <Input {...register('startTime')} placeholder="09:00" />
                {errors.startTime && (
                  <p className="text-xs text-red-500">{errors.startTime.message}</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label>終了時刻</Label>
                <Input {...register('endTime')} placeholder="10:00" />
                {errors.endTime && <p className="text-xs text-red-500">{errors.endTime.message}</p>}
              </div>
            </div>

            {duration && <p className="text-sm text-muted-foreground">所要時間: {duration}</p>}

            {/* Project */}
            <div className="grid gap-1.5">
              <Label>案件</Label>
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="案件を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            {p.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.projectId && (
                <p className="text-xs text-red-500">{errors.projectId.message}</p>
              )}
            </div>

            {/* Memo */}
            <div className="grid gap-1.5">
              <Label>メモ</Label>
              <Textarea {...register('memo')} rows={3} placeholder="作業内容など（500文字以内）" />
              {errors.memo && <p className="text-xs text-red-500">{errors.memo.message}</p>}
              <p className="text-xs text-muted-foreground text-right">{memo?.length ?? 0}/500</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
