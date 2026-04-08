import { useCallback } from 'react'
import { useDragContext } from './dragContext'
import { snapToTime, clampEndTime, timeToY } from './calendarLayout'
import { timeToMinutes, minutesToTime, durationMinutes } from '@renderer/shared/lib/time'
import { SNAP_MINUTES } from '@renderer/pages/timesheet/config/calendarConstants'

import type { LogEntry } from '@shared/logs'
import { useConfigContext } from '@renderer/entities/config'

interface UseDragMoveOptions {
  weekColumnsRef: React.RefObject<(HTMLDivElement | null)[]>
  weekDates: string[] // array of "YYYY-MM-DD" for each column
  onSave: (updated: LogEntry, original: LogEntry) => Promise<void>
}

export function useDragMove({ weekColumnsRef, weekDates, onSave }: UseDragMoveOptions): {
  handleDragMoveStart: (e: React.MouseEvent, entry: LogEntry) => void
} {
  const { setDragState, dragStateRef } = useDragContext()
  const { hourHeight } = useConfigContext()

  const handleDragMoveStart = useCallback(
    (e: React.MouseEvent, entry: LogEntry) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      // Calculate offset from top of block to cursor
      const colIndex = weekDates.indexOf(entry.date)
      const colEl = weekColumnsRef.current?.[colIndex]
      const rect = colEl?.getBoundingClientRect()
      if (!rect) return

      const blockTop = rect.top + timeToY(entry.startTime, hourHeight)
      const offsetY = e.clientY - blockTop
      const duration = durationMinutes(entry.startTime, entry.endTime)

      setDragState({
        type: 'moving',
        entryId: entry.id,
        date: entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime
      })

      const onMouseMove = (e: MouseEvent): void => {
        // Determine which column the cursor is in
        const cols = weekColumnsRef.current
        if (!cols) return

        let targetColIndex = -1
        for (let i = 0; i < cols.length; i++) {
          const r = cols[i]?.getBoundingClientRect()
          if (r && e.clientX >= r.left && e.clientX <= r.right) {
            targetColIndex = i
            break
          }
        }
        if (targetColIndex === -1) return

        const targetRect = cols[targetColIndex]?.getBoundingClientRect()
        if (!targetRect) return

        const y = e.clientY - targetRect.top - offsetY
        const rawStart = snapToTime(Math.max(0, y), hourHeight)
        const startMins = timeToMinutes(rawStart)
        const endMins = Math.min(startMins + duration, 24 * 60 - SNAP_MINUTES)
        const clampedEnd = minutesToTime(endMins)

        setDragState({
          type: 'moving',
          entryId: entry.id,
          date: weekDates[targetColIndex],
          startTime: minutesToTime(Math.max(0, endMins - duration)),
          endTime: clampedEnd
        })
      }

      const onMouseUp = async (): Promise<void> => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)

        const state = dragStateRef.current
        if (state.type !== 'moving') return

        setDragState({ type: 'idle' })

        if (
          state.date === entry.date &&
          state.startTime === entry.startTime &&
          state.endTime === entry.endTime
        )
          return

        const updated: LogEntry = {
          ...entry,
          date: state.date,
          startTime: state.startTime,
          endTime: clampEndTime(state.startTime, state.endTime)
        }
        await onSave(updated, entry)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [setDragState, dragStateRef, weekColumnsRef, weekDates, onSave, hourHeight]
  )

  return { handleDragMoveStart }
}
