import type { Result } from 'neverthrow'
import type { LogEntry } from '../../../../shared'
import type { Config } from '../../../../shared'
import type { Project } from '../../../../shared'
import type { Template } from '../../../../shared'
import type { IpcError } from '../../../../shared'

export declare const api: {
  readLogs(year: number, month: number): Promise<Result<LogEntry[], IpcError>>
  writeLogs(year: number, month: number, logs: LogEntry[]): Promise<Result<void, IpcError>>
  moveLogEntry(
    entryId: string,
    fromYear: number,
    fromMonth: number,
    toYear: number,
    toMonth: number,
    entry: LogEntry
  ): Promise<Result<void, IpcError>>
  readProjects(): Promise<Result<Project[], IpcError>>
  writeProjects(projects: Project[]): Promise<Result<void, IpcError>>
  readConfig(): Promise<Result<Config, IpcError>>
  writeConfig(config: Config): Promise<Result<void, IpcError>>
  selectFolder(): Promise<string | null>
  readTemplates(): Promise<Result<Template[], IpcError>>
  writeTemplates(templates: Template[]): Promise<Result<void, IpcError>>
}

export declare const IS_ELECTRON: boolean
