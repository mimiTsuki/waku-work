import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
  getDate
} from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { DayButton } from './DayButton'
import { cn } from '@renderer/lib/utils'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

interface DatePickerProps {
  selected?: Date
  onSelect?: (date: Date) => void
}

export function DatePicker({ selected, onSelect }: DatePickerProps) {
  const [viewDate, setViewDate] = useState(() => selected ?? new Date())

  const monthStart = startOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  return (
    <div className="w-64">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:text-primary-foreground"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <span className="text-sm font-medium select-none">{format(viewDate, 'yyyy年M月')}</span>
        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:text-primary-foreground"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              'flex items-center justify-center h-7 text-xs text-muted-foreground',
              i === 0 && 'text-pink-600 dark:text-pink-500',
              i === 6 && 'text-sky-600 dark:text-sky-500'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => (
          <DayButton
            key={day.toISOString()}
            day={getDate(day)}
            selected={selected ? isSameDay(day, selected) : false}
            today={isToday(day)}
            outside={!isSameMonth(day, viewDate)}
            onClick={() => onSelect?.(day)}
          />
        ))}
      </div>
    </div>
  )
}
