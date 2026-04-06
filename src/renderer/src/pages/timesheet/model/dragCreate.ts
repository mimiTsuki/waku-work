import { useCallback, useRef } from 'react'
import { useDragContext } from './dragContext'
import { snapToTime, clampEndTime } from './calendarLayout'
import { timeToMinutes, minutesToTime } from '@renderer/shared/lib/time'
import { SNAP_MINUTES, MIN_BLOCK_MINUTES } from '@renderer/pages/timesheet/config/calendarConstants'

interface UseDragCreateOptions {
  date: string
  columnRef: React.RefObject<HTMLDivElement | null>
  onComplete: (date: string, startTime: string, endTime: string) => void
}

export function useDragCreate({ date, columnRef, onComplete }: UseDragCreateOptions): {
  handleMouseDown: (e: React.MouseEvent) => void
} {
  const { setDragState, dragStateRef } = useDragContext()
  const startYRef = useRef(0)
  const startTimeRef = useRef('')
  const isDraggingRef = useRef(false)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()

      const rect = columnRef.current?.getBoundingClientRect()
      if (!rect) return

      const y = e.clientY - rect.top
      const startTime = snapToTime(y)
      startYRef.current = y
      startTimeRef.current = startTime
      isDraggingRef.current = false

      setDragState({ type: 'creating', date, startTime, currentEndTime: startTime })

      const onMouseMove = (e: MouseEvent): void => {
        const rect = columnRef.current?.getBoundingClientRect()
        if (!rect) return
        const currentY = e.clientY - rect.top
        const dy = Math.abs(currentY - startYRef.current)

        if (!isDraggingRef.current && dy >= 5) {
          isDraggingRef.current = true
        }

        const rawEnd = snapToTime(Math.max(currentY, startYRef.current))
        const endTime = clampEndTime(startTimeRef.current, rawEnd)
        setDragState({
          type: 'creating',
          date,
          startTime: startTimeRef.current,
          currentEndTime: endTime
        })
      }

      const onMouseUp = (): void => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)

        const state = dragStateRef.current
        if (state.type !== 'creating') return

        let finalEnd = state.currentEndTime
        if (!isDraggingRef.current) {
          // Click: set 15 min block
          const startMins = timeToMinutes(state.startTime)
          finalEnd = minutesToTime(Math.min(startMins + MIN_BLOCK_MINUTES, 24 * 60 - SNAP_MINUTES))
        }

        setDragState({ type: 'idle' })
        onComplete(date, state.startTime, finalEnd)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [date, columnRef, setDragState, dragStateRef, onComplete]
  )

  return { handleMouseDown }
}
