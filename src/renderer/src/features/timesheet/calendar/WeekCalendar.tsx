import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useQueries } from '@tanstack/react-query'
import { Button } from '@renderer/components/button'
import { DragProvider } from '../context/DragProvider'
import { TimeAxis } from './TimeAxis'
import { DayColumn } from './DayColumn'
import { useDragMove } from '../hooks/useDragMove'
import { useDragResize } from '../hooks/useDragResize'
import { formatDateKey, getMonthsInRange } from '@renderer/lib/timeUtils'
import { readLogs } from '@renderer/api'
import { useWeekNavigation } from '@renderer/hooks/useWeekNavigation'
import { useWeekStartOnMonday } from '@renderer/hooks/useWeekStartOnMonday'
import { HOUR_HEIGHT } from './constants'
import type { LogEntry } from '@shared/logs'
import type { Project } from '@shared/projects'
import { range } from '@renderer/lib/array/range'

const ALL_DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

interface WeekCalendarProps {
  projects: Project[]
  onCreateRequest: (date: string, startTime: string, endTime: string) => void
  onDeleteRequest: (entry: LogEntry) => void
  onEditRequest: (entry: LogEntry) => void
  onUpdateEntry: (updated: LogEntry, original?: LogEntry) => Promise<void>
}

function WeekCalendarInner({
  projects,
  onCreateRequest,
  onDeleteRequest,
  onEditRequest,
  onUpdateEntry
}: WeekCalendarProps): React.JSX.Element {
  const weekStartOnMonday = useWeekStartOnMonday()
  const { weekDays, weekDateKeys, weekLabel, goToPrevWeek, goToNextWeek, goToThisWeek } =
    useWeekNavigation(weekStartOnMonday)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cols = useMemo(() => {
    return range(0, 7)
  }, [])

  const weekColumnsRef = useRef<(HTMLDivElement | null)[]>(cols.map(() => null))

  // Stable callback refs for each column — avoids 7 individual refs + useEffect sync
  const columnCallbackRefs = useMemo(
    () =>
      cols.map((_, i) => (el: HTMLDivElement | null): void => {
        weekColumnsRef.current[i] = el
      }),
    [cols]
  )

  // Collect unique months needed for this week (1 or 2 months for cross-month weeks)
  const months = useMemo(() => getMonthsInRange(weekDateKeys[0], weekDateKeys[6]), [weekDateKeys])

  // Fetch all months needed for the current week
  const queries = useQueries({
    queries: months.map(({ year, month }) => ({
      queryKey: ['logs', year, month] as const,
      queryFn: async () => {
        const result = await readLogs(year, month)
        if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
        return result.value
      }
    }))
  })

  const allLogs = useMemo(() => queries.flatMap((q) => q.data ?? []), [queries])

  const getLogsForDate = useCallback(
    (dateKey: string) => allLogs.filter((e) => e.date === dateKey),
    [allLogs]
  )

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

  const today = formatDateKey(new Date())

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 shrink-0 text-nav-foreground bg-nav">
        <Button className="h-10" size="icon" onClick={goToPrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button className="h-10" size="sm" onClick={goToThisWeek}>
          <Calendar className="h-4 w-4 mr-1" />
          今週
        </Button>
        <Button className="h-10" size="icon" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium ml-2">{weekLabel}</span>
      </div>

      <div className="flex flex-col rounded-2xl border border-transparent bg-card h-hull overflow-y-auto">
        {/* Day headers */}
        <div className="flex shrink-0" role="row" aria-label="曜日ヘッダー">
          <div className="w-14 shrink-0" />
          {weekDays.map((day, i) => {
            const dateKey = weekDateKeys[i]
            const isToday = dateKey === today
            const dayOfWeek = day.getDay()
            const isSat = dayOfWeek === 6
            const isSun = dayOfWeek === 0
            const dayLabel = ALL_DAY_LABELS[dayOfWeek]
            return (
              <div
                key={dateKey}
                role="columnheader"
                aria-label={`${dayLabel} ${format(day, 'M/d')}`}
                className="flex-1 text-center py-2 text-xs font-medium"
              >
                <div
                  className={
                    isSat
                      ? 'text-sky-600 dark:text-sky-500'
                      : isSun
                        ? 'text-pink-600 dark:text-pink-500'
                        : 'text-foreground'
                  }
                >
                  {dayLabel}
                </div>
                <div
                  className={`text-sm font-semibold mt-0.5 w-8 h-8 flex items-center justify-center mx-auto rounded-full ${
                    isToday
                      ? // NOTE: 強調するためにforegroundと入れ替えている
                        'bg-primary/70 dark:bg-primary-foreground dark:text-primary'
                      : isSat
                        ? 'text-sky-600 dark:text-sky-500'
                        : isSun
                          ? 'text-pink-600 dark:text-pink-500'
                          : 'text-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            )
          })}
        </div>

        {/* Scrollable calendar grid */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 overscroll-none"
          data-testid="calendar-scrollable"
        >
          <div className="flex" style={{ height: 24.5 * HOUR_HEIGHT }}>
            <TimeAxis />
            {weekDateKeys.map((dateKey, i) => (
              <DayColumn
                key={dateKey}
                date={dateKey}
                entries={getLogsForDate(dateKey)}
                projects={projects}
                columnRef={columnCallbackRefs[i]}
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
