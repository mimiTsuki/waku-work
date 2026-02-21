import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@renderer/components/shadcn/button'
import { DragProvider } from './DragContext'
import { TimeAxis } from './TimeAxis'
import { DayColumn } from './DayColumn'
import { useDragMove } from '@renderer/hooks/useDragMove'
import { useDragResize } from '@renderer/hooks/useDragResize'
import { getWeekStart, getWeekDays, formatDateKey, getYearMonth } from '@renderer/lib/timeUtils'
import { HOUR_HEIGHT } from '@renderer/lib/constants'
import type { LogEntry, Project } from '@renderer/lib/types'

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

interface WeekCalendarProps {
  projects: Project[]
  fetchMonth: (year: number, month: number) => Promise<LogEntry[]>
  getLogsForDate: (dateKey: string) => LogEntry[]
  onCreateRequest: (date: string, startTime: string, endTime: string) => void
  onDeleteRequest: (entry: LogEntry) => void
  onEditRequest: (entry: LogEntry) => void
  onUpdateEntry: (updated: LogEntry, original?: LogEntry) => Promise<void>
}

function WeekCalendarInner({
  projects,
  fetchMonth,
  getLogsForDate,
  onCreateRequest,
  onDeleteRequest,
  onEditRequest,
  onUpdateEntry
}: WeekCalendarProps): React.JSX.Element {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const scrollRef = useRef<HTMLDivElement>(null)

  // 7 column refs
  const col0 = useRef<HTMLDivElement>(null)
  const col1 = useRef<HTMLDivElement>(null)
  const col2 = useRef<HTMLDivElement>(null)
  const col3 = useRef<HTMLDivElement>(null)
  const col4 = useRef<HTMLDivElement>(null)
  const col5 = useRef<HTMLDivElement>(null)
  const col6 = useRef<HTMLDivElement>(null)
  const colRefs = [col0, col1, col2, col3, col4, col5, col6]

  const weekColumnsRef = useRef<(HTMLDivElement | null)[]>(new Array(7).fill(null))

  // Sync colRefs into weekColumnsRef
  useEffect(() => {
    weekColumnsRef.current = colRefs.map((r) => r.current)
  })

  const weekDays = getWeekDays(weekStart)
  const weekDateKeys = weekDays.map((d) => formatDateKey(d))

  // Fetch months needed for this week
  useEffect(() => {
    const monthsNeeded = new Set<string>()
    weekDateKeys.forEach((key) => {
      const { year, month } = getYearMonth(key)
      monthsNeeded.add(`${year}-${month}`)
    })
    monthsNeeded.forEach((ym) => {
      const [year, month] = ym.split('-').map(Number)
      void fetchMonth(year, month)
    })
  }, [weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initial scroll to 07:00
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT
    }
  }, [])

  const { handleDragMoveStart } = useDragMove({
    weekColumnsRef,
    weekDates: weekDateKeys,
    onSave: (updated, original) => onUpdateEntry(updated, original)
  })

  const resizeColumnRef = useRef<HTMLDivElement | null>(null)
  const { handleResizeStart } = useDragResize({
    columnRef: resizeColumnRef,
    onSave: (updated) => onUpdateEntry(updated)
  })

  const handleResizeStartWithCol = useCallback(
    (e: React.MouseEvent, entry: LogEntry) => {
      const colIndex = weekDateKeys.indexOf(entry.date)
      if (colIndex >= 0) {
        resizeColumnRef.current = weekColumnsRef.current[colIndex] ?? null
      }
      handleResizeStart(e, entry)
    },
    [weekDateKeys, handleResizeStart]
  )

  const goToPrevWeek = (): void => {
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }

  const goToNextWeek = (): void => {
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }

  const goToThisWeek = (): void => {
    setWeekStart(getWeekStart(new Date()))
  }

  const weekLabel = `${format(weekDays[0], 'yyyy/MM/dd')} 〜 ${format(weekDays[6], 'MM/dd')}`
  const today = formatDateKey(new Date())

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-white shrink-0">
        <Button variant="outline" size="icon" onClick={goToPrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToThisWeek}>
          <Calendar className="h-4 w-4 mr-1" />
          今週
        </Button>
        <Button variant="outline" size="icon" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-gray-700 ml-2">{weekLabel}</span>
      </div>

      {/* Day headers */}
      <div className="flex shrink-0 border-b bg-white">
        <div className="w-14 shrink-0" />
        {weekDays.map((day, i) => {
          const dateKey = weekDateKeys[i]
          const isToday = dateKey === today
          const isSat = i === 5
          const isSun = i === 6
          return (
            <div
              key={dateKey}
              className="flex-1 text-center py-1 text-xs font-medium border-l border-gray-200"
            >
              <div className={isSat ? 'text-blue-600' : isSun ? 'text-red-600' : 'text-gray-600'}>
                {DAY_LABELS[i]}
              </div>
              <div
                className={`text-sm font-semibold mt-0.5 ${
                  isToday
                    ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                    : isSat
                      ? 'text-blue-600'
                      : isSun
                        ? 'text-red-600'
                        : 'text-gray-900'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable calendar grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: 24 * HOUR_HEIGHT }}>
          <TimeAxis />
          {weekDateKeys.map((dateKey, i) => (
            <DayColumn
              key={dateKey}
              date={dateKey}
              entries={getLogsForDate(dateKey)}
              projects={projects}
              columnRef={colRefs[i]}
              onCreateComplete={onCreateRequest}
              onDeleteRequest={onDeleteRequest}
              onEditRequest={onEditRequest}
              onMoveStart={handleDragMoveStart}
              onResizeStart={handleResizeStartWithCol}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function WeekCalendar(props: WeekCalendarProps): React.JSX.Element {
  return (
    <DragProvider>
      <WeekCalendarInner {...props} />
    </DragProvider>
  )
}
