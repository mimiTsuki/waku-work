import React, { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/shared/ui/dialog'
import { Button } from '@renderer/shared/ui/button'
import { Field } from '@renderer/shared/ui/field'
import { Input } from '@renderer/shared/ui/input'
import { Combobox } from '@renderer/shared/ui/combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/shared/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/shared/ui/popover'
import { DatePicker } from '@renderer/shared/ui/datePicker'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@renderer/shared/lib/cn'
import {
  parseDateKey,
  formatDateKey,
  formatDuration,
  durationMinutes
} from '@renderer/shared/lib/time'
import type { LogEntry } from '@shared/logs'
import type { Project } from '@shared/projects'
import {
  schema,
  type LogForm,
  logEntryToForm,
  formToLogEntry
} from '@renderer/pages/timesheet/model/logForm'
import { useConfig, colorPresetToCss } from '@renderer/entities/config'
import { api } from '@renderer/shared/api'

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
  const {
    data: { weekStartOnMonday }
  } = useConfig()
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
      description: ''
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
          description: ''
        })
      }
    }
  }, [open, defaultValues, projects, reset])

  const [startTime, endTime, dateStr, description] = watch([
    'startTime',
    'endTime',
    'date',
    'description'
  ])

  const year = dateStr ? Number(dateStr.slice(0, 4)) : undefined
  const month = dateStr ? Number(dateStr.slice(5, 7)) : undefined

  // TODO: hooksに切り出し
  const { data: monthLogs } = useQuery({
    queryKey: ['logs', year, month] as const,
    queryFn: async () => {
      const result = await api.readLogs(year!, month!)
      if (result.isErr()) return []
      return result.value
    },
    enabled: open && year != null && month != null
  })

  const sameDayDescriptions = useMemo(() => {
    if (!monthLogs || !dateStr) return []
    const descs = monthLogs
      .filter((log) => log.date === dateStr && log.description)
      .map((log) => log.description)
    return [...new Set(descs)]
  }, [monthLogs, dateStr])

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
          <div className="grid gap-6 py-4">
            {/* Date */}
            <Field.Root>
              <Field.Label>日付</Field.Label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <Field.Control>
                    <button
                      type="button"
                      className={cn(
                        'h-10 px-4 py-2 justify-start text-left font-normal border border-border text-button-foreground cursor-pointer inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                        !dateStr && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateStr ? format(parseDateKey(dateStr), 'yyyy/MM/dd') : '日付を選択'}
                    </button>
                  </Field.Control>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 bg-popover" align="start">
                  <DatePicker
                    selected={dateStr ? parseDateKey(dateStr) : new Date()}
                    onSelect={(d) => {
                      setValue('date', formatDateKey(d))
                      setCalOpen(false)
                    }}
                    weekStartOnMonday={weekStartOnMonday}
                  />
                </PopoverContent>
              </Popover>
            </Field.Root>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <Field.Root className="gap-y-1.5">
                <Field.Label>開始時刻</Field.Label>
                <Field.Control>
                  <Input {...register('startTime')} placeholder="09:00" />
                </Field.Control>
                {errors.startTime && (
                  <p className="text-xs text-red-500">{errors.startTime.message}</p>
                )}
              </Field.Root>
              <Field.Root className="gap-y-1.5">
                <Field.Label>終了時刻</Field.Label>
                <Field.Control>
                  <Input {...register('endTime')} placeholder="10:00" />
                </Field.Control>
                {errors.endTime && <p className="text-xs text-red-500">{errors.endTime.message}</p>}
              </Field.Root>
            </div>

            {duration && <p className="text-sm text-muted-foreground">所要時間: {duration}</p>}

            {/* Project */}
            <Field.Root>
              <Field.Label>案件</Field.Label>
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Field.Control>
                      <SelectTrigger>
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
                )}
              />
              {errors.projectId && (
                <p className="text-xs text-red-500">{errors.projectId.message}</p>
              )}
            </Field.Root>

            {/* Description */}
            <Field.Root>
              <Field.Label>説明</Field.Label>
              <Field.Control>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <Combobox
                      value={field.value}
                      onChange={field.onChange}
                      suggestions={sameDayDescriptions}
                      placeholder="作業内容など（500文字以内）"
                      maxLength={500}
                    />
                  )}
                />
              </Field.Control>
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground text-right">
                {description?.length ?? 0}/500
              </p>
            </Field.Root>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:bg-muted"
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              variant="ghost"
              type="submit"
              className="text-primary-foreground hover:bg-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
