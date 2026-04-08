import React, { useRef, useCallback } from 'react'

import {
  timeToY,
  durationToHeight,
  layoutEntries
} from '@renderer/pages/timesheet/model/calendarLayout'
import { useDragCreate } from '@renderer/pages/timesheet/model/dragCreate'
import { useDragContext } from '@renderer/pages/timesheet/model/dragContext'
import { LogBlock } from './LogBlock'
import { MovingPreview } from './MovingPreview'
import type { LogEntry } from '@shared/logs'
import type { Project } from '@shared/projects'
import { cn } from '@renderer/shared/lib/cn'
import { useConfigContext } from '@renderer/entities/config'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface DayColumnProps {
  date: string
  entries: LogEntry[]
  projects: Project[]
  columnRef: React.RefCallback<HTMLDivElement>
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
  const { hourHeight } = useConfigContext()
  const localRef = useRef<HTMLDivElement>(null)

  // Merge local ref (used by useDragCreate) with parent's callback ref
  const mergedRef = useCallback(
    (el: HTMLDivElement | null) => {
      localRef.current = el
      columnRef(el)
    },
    [columnRef]
  )

  const { handleMouseDown } = useDragCreate({
    date,
    columnRef: localRef,
    onComplete: onCreateComplete
  })

  const positioned = layoutEntries(entries)

  // Preview block for creating drag
  const showCreating = dragState.type === 'creating' && dragState.date === date
  // Preview block for moving drag in this column
  const showMoving = dragState.type === 'moving' && dragState.date === date

  return (
    <div
      ref={mergedRef}
      className="relative flex-1 border-l border-border select-none"
      style={{ height: 24 * hourHeight, minWidth: 0 }}
      onMouseDown={handleMouseDown}
      data-testid="day-column"
      aria-label={`日列 ${date}`}
    >
      {/* Hour grid lines */}
      {HOURS.map((h, i) => (
        <React.Fragment key={h}>
          <div
            className={cn('absolute left-0 right-0 border-border', i !== 0 ? 'border-t' : '')}
            style={{ top: h * hourHeight }}
          />
          <div
            className="absolute left-0 right-0 border-t border-border/50"
            style={{ top: h * hourHeight + hourHeight / 2 }}
          />
        </React.Fragment>
      ))}

      {/* Creating preview */}
      {showCreating && dragState.type === 'creating' && (
        <div
          className="absolute left-1 right-1 rounded bg-primary/50 border border-primary pointer-events-none"
          data-testid="drag-preview"
          aria-hidden="true"
          style={{
            top: timeToY(dragState.startTime, hourHeight),
            height: Math.max(
              durationToHeight(dragState.startTime, dragState.currentEndTime, hourHeight),
              4
            )
          }}
        />
      )}

      {/* Moving preview */}
      {showMoving && dragState.type === 'moving' && (
        <MovingPreview
          entryId={dragState.entryId}
          startTime={dragState.startTime}
          endTime={dragState.endTime}
          entries={entries}
          projects={projects}
        />
      )}

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
