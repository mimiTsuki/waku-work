import React, { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { timeToY, durationToHeight } from '@renderer/pages/timesheet/model/calendarLayout'
import { useDragContext } from '@renderer/pages/timesheet/model/dragContext'
import type { PositionedEntry } from '@renderer/pages/timesheet/model/calendarLayout'
import type { LogEntry } from '@shared/logs'
import type { Project } from '@shared/projects'
import { colorPresetToCss } from '@renderer/shared/config/colorPresets'

interface LogBlockProps {
  posEntry: PositionedEntry
  project: Project | undefined
  onDeleteRequest: (entry: LogEntry) => void
  onEditRequest: (entry: LogEntry) => void
  onMoveStart: (e: React.MouseEvent, entry: LogEntry) => void
  onResizeStart: (e: React.MouseEvent, entry: LogEntry) => void
}

export function LogBlock({
  posEntry,
  project,
  onDeleteRequest,
  onEditRequest,
  onMoveStart,
  onResizeStart
}: LogBlockProps): React.JSX.Element {
  const { dragState } = useDragContext()
  const { entry, columnIndex, totalColumns } = posEntry
  const [hovered, setHovered] = useState(false)
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null)

  const top = timeToY(entry.startTime)
  const height = durationToHeight(entry.startTime, entry.endTime)
  const widthPercent = 100 / totalColumns
  const leftPercent = columnIndex * widthPercent

  const isMoving = dragState.type === 'moving' && dragState.entryId === entry.id
  const isResizing = dragState.type === 'resizing' && dragState.entryId === entry.id

  let displayHeight = height
  let displayTop = top
  if (isResizing && dragState.type === 'resizing') {
    displayHeight = durationToHeight(entry.startTime, dragState.endTime)
  }
  if (isMoving && dragState.type === 'moving') {
    displayTop = timeToY(dragState.startTime)
  }

  const bgColor = colorPresetToCss(project?.color)
  const showLabel = height >= 30
  const showTime = height >= 44

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${project?.name ?? '(no project)'} ${entry.startTime}〜${entry.endTime}${entry.description ? ' ' + entry.description : ''}`}
      data-testid="log-block"
      className="absolute rounded overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{
        top: displayTop,
        height: Math.max(displayHeight, 12) - 1,
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
        backgroundColor: bgColor,
        opacity: isMoving ? 0.5 : 1,
        zIndex: hovered || isMoving || isResizing ? 10 : 1
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => {
        mouseDownPos.current = { x: e.clientX, y: e.clientY }
        onMoveStart(e, entry)
      }}
      onClick={(e) => {
        if (mouseDownPos.current) {
          const dx = e.clientX - mouseDownPos.current.x
          const dy = e.clientY - mouseDownPos.current.y
          mouseDownPos.current = null
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
            onEditRequest(entry)
          }
        }
      }}
    >
      {/* Content */}
      <div className="px-1 py-0.5 h-full flex flex-col overflow-hidden">
        {showLabel && (
          <span className="text-xs font-semibold leading-tight truncate">
            {project?.name ?? '(no project)'}
            {entry.description && (
              <span className="font-normal text-foreground/80"> {entry.description}</span>
            )}
          </span>
        )}
        {showTime && (
          <span className="text-foreground/80 text-xs leading-tight">
            {entry.startTime}〜{entry.endTime}
          </span>
        )}
      </div>

      {/* Delete button */}
      {hovered && (
        <button
          aria-label={`${entry.description || project?.name || 'ログ'} を削除`}
          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-button flex items-center justify-center hover:bg-button-hover transition-colors"
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onDeleteRequest(entry)
          }}
        >
          <X className="w-2.5 h-2.5 text-foreground" />
        </button>
      )}

      {/* Resize handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart(e, entry)
        }}
      />
    </div>
  )
}
