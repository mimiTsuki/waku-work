import {
  durationMinutes,
  formatDateKey,
  formatDuration,
  getMonthsInRange
} from '@renderer/shared/lib/time'
import { useWeekNavigation } from '@renderer/shared/lib/weekNavigation'
import { Button } from '@renderer/shared/ui/button'
import type { Project } from '@shared/projects'
import { eachDayOfInterval, format, parseISO } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useMemo } from 'react'

import { colorPresetToCss, useConfig } from '@renderer/entities/config'
import { useProjects } from '@renderer/entities/project'
import { useLogs } from '@renderer/entities/log'

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土']

function formatDayHeader(dateKey: string): string {
  const d = parseISO(dateKey)
  return `${WEEKDAY_JA[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
}

interface DayData {
  dateKey: string
  entries: {
    projectId: string
    project: Project | undefined
    minutes: number
    description: string
  }[]
  totalMinutes: number
}

export function SummaryPage(): React.JSX.Element {
  const { data: projects } = useProjects()
  const {
    data: { weekStartOnMonday }
  } = useConfig()
  const { weekDays, weekLabel, goToPrevWeek, goToNextWeek, goToThisWeek } =
    useWeekNavigation(weekStartOnMonday)

  const startDate = formatDateKey(weekDays[0])
  const endDate = formatDateKey(weekDays[6])

  const months = useMemo(() => getMonthsInRange(startDate, endDate), [startDate, endDate])
  const queries = useLogs(months)

  const logs = useMemo(
    () => queries.flatMap((q) => q.data).filter((e) => e.date >= startDate && e.date <= endDate),
    [queries, startDate, endDate]
  )

  const dayData = useMemo((): DayData[] => {
    const projectMap = new Map(projects.map((p) => [p.id, p]))

    const grouped = new Map<string, Map<string, { minutes: number; descriptions: string[] }>>()
    for (const log of logs) {
      if (!grouped.has(log.date)) grouped.set(log.date, new Map())
      const byProject = grouped.get(log.date)!
      const current = byProject.get(log.projectId) ?? { minutes: 0, descriptions: [] }
      byProject.set(log.projectId, {
        minutes: current.minutes + durationMinutes(log.startTime, log.endTime),
        descriptions: log.description
          ? [...current.descriptions, log.description]
          : current.descriptions
      })
    }

    const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
    return days.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd')
      const byProject = grouped.get(dateKey) ?? new Map()
      const entries = Array.from(byProject.entries()).map(
        ([projectId, { minutes, descriptions }]) => ({
          projectId,
          project: projectMap.get(projectId),
          minutes,
          description: [...new Set(descriptions)].join('、')
        })
      )
      return { dateKey, entries, totalMinutes: entries.reduce((s, e) => s + e.minutes, 0) }
    })
  }, [logs, projects, startDate, endDate])

  const totalMinutes = useMemo(() => dayData.reduce((s, d) => s + d.totalMinutes, 0), [dayData])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Week navigation */}
      <div className="flex items-center gap-2 p-4 shrink-0">
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
        <div className="ml-auto text-sm font-semibold">合計: {formatDuration(totalMinutes)}</div>
      </div>

      {/* Day list */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-transparent bg-card">
        {dayData.map(({ dateKey, entries, totalMinutes: dayTotal }) => (
          <div key={dateKey} className="pt-2 border-b border-border">
            <div className="p-4">
              <span className="font-medium text-foreground/80 text-md">
                {formatDayHeader(dateKey)}
              </span>
            </div>
            {entries.length === 0 ? (
              <div className="flex items-center justify-between px-8 py-4">
                <span className="text-sm text-muted">（稼働なし）</span>
              </div>
            ) : (
              <>
                {entries.map(({ projectId, project, minutes, description }) => (
                  <div
                    key={projectId}
                    className="grid grid-cols-[1fr_auto] items-center px-8 py-2 gap-4"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: colorPresetToCss(project?.color) }}
                      />
                      <span className="text-sm text-foreground shrink-0">
                        {project?.name ?? projectId}
                      </span>
                      {description && (
                        <span className="text-sm text-foreground/50 truncate">{description}</span>
                      )}
                    </div>
                    <span className="text-sm text-foreground tabular-nums">
                      {formatDuration(minutes)}
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_auto] items-center px-8 py-2 gap-4">
                  <span className="text-sm text-gray-500 text-right dark:text-neutral-400">
                    合計
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {formatDuration(dayTotal)}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
