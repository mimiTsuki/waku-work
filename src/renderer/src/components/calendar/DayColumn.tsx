import React, { useRef } from 'react'
import { HOUR_HEIGHT } from '@renderer/lib/constants'
import { timeToY, durationToHeight, layoutEntries } from '@renderer/lib/calendarUtils'
import { useDragCreate } from '@renderer/hooks/useDragCreate'
import { useDragContext } from './DragContext'
import { LogBlock } from './LogBlock'
import type { LogEntry, Project } from '@renderer/lib/types'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface DayColumnProps {
  date: string
  entries: LogEntry[]
  projects: Project[]
  columnRef: React.RefObject<HTMLDivElement | null>
  onCreateComplete: (date: string, startTime: string, endTime: string) => void
  onDeleteRequest: (entry: LogEntry) => void
  onEditRequest: (entry: LogEntry) => void
  onMoveStart: (e: React.MouseEvent, entry: LogEntry) => void
  onResizeStart: (e: React.MouseEvent, entry: LogEntry) => void
}

export function DayColumn({
  date,
  entries,
  projects,
  columnRef,
  onCreateComplete,
  onDeleteRequest,
  onEditRequest,
  onMoveStart,
  onResizeStart
}: DayColumnProps): React.JSX.Element {
  const { dragState } = useDragContext()
  const innerRef = useRef<HTMLDivElement>(null)

  // Use the passed-in columnRef if available, else inner ref
  const effectiveRef = (columnRef as React.RefObject<HTMLDivElement | null>) ?? innerRef

  const { handleMouseDown } = useDragCreate({
    date,
    columnRef: effectiveRef,
    onComplete: onCreateComplete
  })

  const positioned = layoutEntries(entries)

  // Preview block for creating drag
  const showCreating = dragState.type === 'creating' && dragState.date === date
  // Preview block for moving drag in this column
  const showMoving = dragState.type === 'moving' && dragState.date === date

  return (
    <div
      ref={effectiveRef}
      className="relative flex-1 border-l border-gray-200 select-none"
      style={{ height: 24 * HOUR_HEIGHT, minWidth: 0 }}
      onMouseDown={handleMouseDown}
    >
      {/* Hour grid lines */}
      {HOURS.map((h) => (
        <React.Fragment key={h}>
          <div
            className="absolute left-0 right-0 border-t border-gray-100"
            style={{ top: h * HOUR_HEIGHT }}
          />
          <div
            className="absolute left-0 right-0 border-t border-gray-50"
            style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
          />
        </React.Fragment>
      ))}

      {/* Creating preview */}
      {showCreating && dragState.type === 'creating' && (
        <div
          className="absolute left-1 right-1 rounded bg-blue-400/50 border border-blue-500 pointer-events-none"
          style={{
            top: timeToY(dragState.startTime),
            height: Math.max(durationToHeight(dragState.startTime, dragState.currentEndTime), 4)
          }}
        />
      )}

      {/* Moving preview */}
      {showMoving &&
        dragState.type === 'moving' &&
        (() => {
          const movingEntry = entries.find((e) => e.id === dragState.entryId)
          const proj = movingEntry
            ? projects.find((p) => p.id === movingEntry.projectId)
            : undefined
          return (
            <div
              className="absolute left-1 right-1 rounded pointer-events-none opacity-60"
              style={{
                top: timeToY(dragState.startTime),
                height: Math.max(durationToHeight(dragState.startTime, dragState.endTime), 4),
                backgroundColor: proj?.color ?? '#6B7280'
              }}
            />
          )
        })()}

      {/* Log blocks */}
      {positioned.map((posEntry) => {
        const project = projects.find((p) => p.id === posEntry.entry.projectId)
        return (
          <LogBlock
            key={posEntry.entry.id}
            posEntry={posEntry}
            project={project}
            onDeleteRequest={onDeleteRequest}
            onEditRequest={onEditRequest}
            onMoveStart={onMoveStart}
            onResizeStart={onResizeStart}
          />
        )
      })}
    </div>
  )
}
