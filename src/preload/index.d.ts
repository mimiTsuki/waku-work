import { ElectronAPI } from '@electron-toolkit/preload'
import type { AppConfig, LogEntry, Project } from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      readLogs: (args: { year: number; month: number }) => Promise<LogEntry[]>
      writeLogs: (args: {
        year: number
        month: number
        logs: LogEntry[]
      }) => Promise<{ success: boolean }>
      readProjects: () => Promise<Project[]>
      writeProjects: (data: Project[]) => Promise<{ success: boolean }>
      readConfig: () => Promise<AppConfig>
      writeConfig: (data: AppConfig) => Promise<{ success: boolean }>
      selectFolder: () => Promise<string | null>
    }
  }
}
