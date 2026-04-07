import {
  HOUR_HEIGHT,
  SNAP_MINUTES,
  MIN_BLOCK_MINUTES
} from '@renderer/pages/timesheet/config/calendarConstants'
import { timeToMinutes, minutesToTime, durationMinutes } from '@renderer/shared/lib/time'
import type { LogEntry } from '@shared/logs'

export interface PositionedEntry {
  entry: LogEntry
  columnIndex: number
  totalColumns: number
}

export function snapToTime(y: number): string {
  const totalMinutes = Math.round((y / HOUR_HEIGHT) * 60)
  const snapped = Math.round(totalMinutes / SNAP_MINUTES) * SNAP_MINUTES
  const clamped = Math.max(0, Math.min(snapped, 24 * 60 - SNAP_MINUTES))
  return minutesToTime(clamped)
}

export function timeToY(time: string): number {
  return (timeToMinutes(time) / 60) * HOUR_HEIGHT
}

export function durationToHeight(start: string, end: string): number {
  const mins = durationMinutes(start, end)
  return (mins / 60) * HOUR_HEIGHT
}

export function clampEndTime(start: string, end: string): string {
  const startMins = timeToMinutes(start)
  const endMins = timeToMinutes(end)
  if (endMins - startMins < MIN_BLOCK_MINUTES) {
    return minutesToTime(startMins + MIN_BLOCK_MINUTES)
  }
  return end
}

export function layoutEntries(entries: LogEntry[]): PositionedEntry[] {
  if (entries.length === 0) return []

  // Sort by startTime
  const sorted = [...entries].sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Group overlapping entries
  const groups: LogEntry[][] = []
  let currentGroup: LogEntry[] = []
  let groupEndMins = -1

  for (const entry of sorted) {
    const startMins = timeToMinutes(entry.startTime)
    const endMins = timeToMinutes(entry.endTime)

    if (currentGroup.length === 0 || startMins < groupEndMins) {
      currentGroup.push(entry)
      groupEndMins = Math.max(groupEndMins, endMins)
    } else {
      groups.push(currentGroup)
      currentGroup = [entry]
      groupEndMins = endMins
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup)

  const result: PositionedEntry[] = []

  for (const group of groups) {
    const totalColumns = group.length
    // Greedy column assignment
    const columnEndMinutes: number[] = new Array(totalColumns).fill(-1)

    for (const entry of group) {
      const startMins = timeToMinutes(entry.startTime)
      const endMins = timeToMinutes(entry.endTime)

      // Find the first column where the entry fits
      let assignedColumn = 0
      for (let col = 0; col < totalColumns; col++) {
        if (columnEndMinutes[col] <= startMins) {
          assignedColumn = col
          break
        }
      }

      columnEndMinutes[assignedColumn] = endMins

      result.push({
        entry,
        columnIndex: assignedColumn,
        totalColumns
      })
    }
  }

  return result
}
