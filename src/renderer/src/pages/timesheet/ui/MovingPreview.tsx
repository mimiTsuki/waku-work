import React from 'react'
import { timeToY, durationToHeight } from '@renderer/pages/timesheet/model/calendarLayout'
import type { LogEntry } from '@shared/logs'
import type { Project } from '@shared/projects'
import { colorPresetToCss } from '@renderer/shared/config/colorPresets'

interface MovingPreviewProps {
  entryId: string
  startTime: string
  endTime: string
  entries: LogEntry[]
  projects: Project[]
}

export function MovingPreview({
  entryId,
  startTime,
  endTime,
  entries,
  projects
}: MovingPreviewProps): React.JSX.Element | null {
  const movingEntry = entries.find((e) => e.id === entryId)
  const project = movingEntry ? projects.find((p) => p.id === movingEntry.projectId) : undefined

  return (
    <div
      className="absolute left-1 right-1 rounded pointer-events-none opacity-60"
      data-testid="drag-preview"
      aria-hidden="true"
      style={{
        top: timeToY(startTime),
        height: Math.max(durationToHeight(startTime, endTime), 4),
        backgroundColor: colorPresetToCss(project?.color)
      }}
    />
  )
}
