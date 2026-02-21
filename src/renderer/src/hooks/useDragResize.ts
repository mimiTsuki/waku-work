import { useCallback } from 'react'
import { useDragContext } from '@renderer/components/calendar/DragContext'
import { snapToTime, clampEndTime, timeToY } from '@renderer/lib/calendarUtils'
import type { LogEntry } from '@renderer/lib/types'

interface UseDragResizeOptions {
  columnRef: React.RefObject<HTMLDivElement | null>
  onSave: (updated: LogEntry) => Promise<void>
}

export function useDragResize({ columnRef, onSave }: UseDragResizeOptions): {
  handleResizeStart: (e: React.MouseEvent, entry: LogEntry) => void
} {
  const { setDragState, dragStateRef } = useDragContext()

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, entry: LogEntry) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      setDragState({ type: 'resizing', entryId: entry.id, endTime: entry.endTime })

      const onMouseMove = (e: MouseEvent): void => {
        const rect = columnRef.current?.getBoundingClientRect()
        if (!rect) return
        const y = e.clientY - rect.top
        const rawEnd = snapToTime(y)
        const endTime = clampEndTime(entry.startTime, rawEnd)
        setDragState({ type: 'resizing', entryId: entry.id, endTime })
      }

      const onMouseUp = async (): Promise<void> => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)

        const state = dragStateRef.current
        if (state.type !== 'resizing') return

        const endTime = clampEndTime(entry.startTime, state.endTime)
        setDragState({ type: 'idle' })

        if (endTime !== entry.endTime) {
          const updated: LogEntry = { ...entry, endTime }
          await onSave(updated)
        }
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [columnRef, setDragState, dragStateRef, onSave]
  )

  return { handleResizeStart }
}

// Re-export for convenience
export { clampEndTime } from '@renderer/lib/calendarUtils'

// Helper to get endTime Y from state
export function getResizeEndY(endTime: string): number {
  return timeToY(endTime)
}
