import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/components/shadcn/dialog'
import { Button } from '@renderer/components/shadcn/button'
import { Input } from '@renderer/components/shadcn/input'
import { Textarea } from '@renderer/components/shadcn/textarea'
import { Label } from '@renderer/components/shadcn/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/shadcn/select'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/shadcn/popover'
import { Calendar } from '@renderer/components/shadcn/calendar'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import {
  parseDateKey,
  formatDateKey,
  formatDuration,
  durationMinutes
} from '@renderer/lib/timeUtils'
import type { LogEntry, Project } from '@renderer/lib/types'

interface LogFormModalProps {
  open: boolean
  initial?: {
    date: string
    startTime: string
    endTime: string
    entry?: LogEntry
  }
  projects: Project[]
  onSave: (entry: LogEntry) => Promise<void>
  onClose: () => void
}

export function LogFormModal({
  open,
  initial,
  projects,
  onSave,
  onClose
}: LogFormModalProps): React.JSX.Element {
  const [date, setDate] = useState<Date>(new Date())
  const [projectId, setProjectId] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [memo, setMemo] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [calOpen, setCalOpen] = useState(false)

  useEffect(() => {
    if (open && initial) {
      setDate(parseDateKey(initial.date))
      setStartTime(initial.startTime)
      setEndTime(initial.endTime)
      if (initial.entry) {
        setProjectId(initial.entry.projectId)
        setMemo(initial.entry.memo)
      } else {
        setProjectId(projects[0]?.id ?? '')
        setMemo('')
      }
      setErrors({})
    }
  }, [open, initial, projects])

  const duration = (() => {
    try {
      const mins = durationMinutes(startTime, endTime)
      return mins > 0 ? formatDuration(mins) : null
    } catch {
      return null
    }
  })()

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!projectId) errs.projectId = '案件を選択してください'
    if (!startTime.match(/^\d{2}:\d{2}$/)) errs.startTime = '時刻形式が不正です'
    if (!endTime.match(/^\d{2}:\d{2}$/)) errs.endTime = '時刻形式が不正です'
    if (startTime >= endTime) errs.endTime = '終了時刻は開始より後にしてください'
    if (memo.length > 500) errs.memo = 'メモは500文字以内にしてください'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave(): Promise<void> {
    if (!validate()) return
    setSaving(true)
    const entry: LogEntry = {
      id: initial?.entry?.id ?? crypto.randomUUID(),
      date: formatDateKey(date),
      projectId,
      startTime,
      endTime,
      memo,
      createdAt: initial?.entry?.createdAt ?? new Date().toISOString()
    }
    try {
      await onSave(entry)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial?.entry ? '稼働ログ編集' : '稼働ログ追加'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Date */}
          <div className="grid gap-1.5">
            <Label>日付</Label>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'yyyy/MM/dd') : '日付を選択'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) {
                      setDate(d)
                      setCalOpen(false)
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>開始時刻</Label>
              <Input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00"
              />
              {errors.startTime && <p className="text-xs text-red-500">{errors.startTime}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>終了時刻</Label>
              <Input
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:00"
              />
              {errors.endTime && <p className="text-xs text-red-500">{errors.endTime}</p>}
            </div>
          </div>

          {duration && <p className="text-sm text-muted-foreground">所要時間: {duration}</p>}

          {/* Project */}
          <div className="grid gap-1.5">
            <Label>案件</Label>
            <Select value={projectId} onValueChange={setProjectId}>
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
            {errors.projectId && <p className="text-xs text-red-500">{errors.projectId}</p>}
          </div>

          {/* Memo */}
          <div className="grid gap-1.5">
            <Label>メモ</Label>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              placeholder="作業内容など（500文字以内）"
            />
            {errors.memo && <p className="text-xs text-red-500">{errors.memo}</p>}
            <p className="text-xs text-muted-foreground text-right">{memo.length}/500</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
