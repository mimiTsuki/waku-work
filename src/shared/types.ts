export interface Project {
  id: string
  name: string
  color: string
  archived: boolean
}

export interface LogEntry {
  id: string
  date: string
  projectId: string
  startTime: string
  endTime: string
  memo: string
  createdAt: string
}

export interface AppConfig {
  dataDir: string
}

export type DragState =
  | { type: 'idle' }
  | { type: 'creating'; date: string; startTime: string; currentEndTime: string }
  | { type: 'moving'; entryId: string; date: string; startTime: string; endTime: string }
  | { type: 'resizing'; entryId: string; endTime: string }
