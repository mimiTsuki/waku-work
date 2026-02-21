import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { parseISO, eachDayOfInterval, format } from 'date-fns'
import type { Project } from '@renderer/lib/types'
import type { LogEntry } from '@renderer/lib/types'
import { Button } from '@renderer/components/shadcn/button'
import { durationMinutes, formatDuration, getWeekStart, getWeekDays, formatDateKey } from '@renderer/lib/timeUtils'

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土']

function formatDayHeader(dateKey: string): string {
  const d = parseISO(dateKey)
  return `${WEEKDAY_JA[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
}

function getMonthsInRange(startDate: string, endDate: string): Array<{ year: number; month: number }> {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const months: Array<{ year: number; month: number }> = []
  let cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() + 1 })
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  }
  return months
}

interface DayData {
  dateKey: string
  entries: { projectId: string; project: Project | undefined; minutes: number; memo: string }[]
  totalMinutes: number
}

interface SummaryPageProps {
  projects: Project[]
}

export function SummaryPage({ projects }: SummaryPageProps): React.JSX.Element {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)

  const weekDays = getWeekDays(weekStart)
  const startDate = formatDateKey(weekDays[0])
  const endDate = formatDateKey(weekDays[6])
  const weekLabel = `${format(weekDays[0], 'yyyy/MM/dd')} 〜 ${format(weekDays[6], 'MM/dd')}`

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

  useEffect(() => {
    setLoading(true)
    const months = getMonthsInRange(startDate, endDate)
    Promise.all(months.map(({ year, month }) => window.api.readLogs({ year, month })))
      .then((results) => {
        const allLogs = results.flat().filter((e) => e.date >= startDate && e.date <= endDate)
        setLogs(allLogs)
      })
      .finally(() => setLoading(false))
  }, [startDate, endDate])

  const dayData = useMemo((): DayData[] => {
    const projectMap = new Map(projects.map((p) => [p.id, p]))

    const grouped = new Map<string, Map<string, { minutes: number; memos: string[] }>>()
    for (const log of logs) {
      if (!grouped.has(log.date)) grouped.set(log.date, new Map())
      const byProject = grouped.get(log.date)!
      const current = byProject.get(log.projectId) ?? { minutes: 0, memos: [] }
      byProject.set(log.projectId, {
        minutes: current.minutes + durationMinutes(log.startTime, log.endTime),
        memos: log.memo ? [...current.memos, log.memo] : current.memos
      })
    }

    const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
    return days.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd')
      const byProject = grouped.get(dateKey) ?? new Map()
      const entries = Array.from(byProject.entries()).map(([projectId, { minutes, memos }]) => ({
        projectId,
        project: projectMap.get(projectId),
        minutes,
        memo: memos.join('、')
      }))
      return { dateKey, entries, totalMinutes: entries.reduce((s, e) => s + e.minutes, 0) }
    })
  }, [logs, projects, startDate, endDate])

  const totalMinutes = useMemo(() => dayData.reduce((s, d) => s + d.totalMinutes, 0), [dayData])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Week navigation */}
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
        <div className="ml-auto text-sm font-semibold text-gray-700">
          合計: {loading ? '...' : formatDuration(totalMinutes)}
        </div>
      </div>

      {/* Day list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            読み込み中...
          </div>
        ) : (
          dayData.map(({ dateKey, entries, totalMinutes: dayTotal }) => (
            <div key={dateKey} className="border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <span className="font-medium text-gray-800 text-sm">{formatDayHeader(dateKey)}</span>
                {entries.length > 0 ? (
                  <span className="text-sm text-gray-600">合計 {formatDuration(dayTotal)}</span>
                ) : (
                  <span className="text-sm text-gray-400">（稼働なし）</span>
                )}
              </div>
              {entries.map(({ projectId, project, minutes, memo }) => (
                <div key={projectId} className="flex items-center justify-between px-8 py-2 gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: project?.color ?? '#95A5A6' }}
                    />
                    <span className="text-sm text-gray-700 shrink-0">{project?.name ?? projectId}</span>
                    {memo && <span className="text-sm text-gray-400 truncate">{memo}</span>}
                  </div>
                  <span className="text-sm text-gray-600 tabular-nums shrink-0">{formatDuration(minutes)}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
