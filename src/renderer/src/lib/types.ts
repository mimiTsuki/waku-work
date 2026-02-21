import { LogEntry } from '../../../shared/types'

export interface PositionedEntry {
  entry: LogEntry
  columnIndex: number
  totalColumns: number
}

export type { Project, LogEntry, AppConfig, DragState } from '../../../shared/types'
