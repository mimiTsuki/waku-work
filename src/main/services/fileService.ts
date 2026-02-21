import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { ensureDataDir } from './configService'
import type { LogEntry, Project } from '../../shared/types'

function logFilePath(dataDir: string, year: number, month: number): string {
  const mm = String(month).padStart(2, '0')
  return join(dataDir, `${year}-${mm}.json`)
}

export function readLogs(dataDir: string, year: number, month: number): LogEntry[] {
  ensureDataDir(dataDir)
  const filePath = logFilePath(dataDir, year, month)
  if (!existsSync(filePath)) return []
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as LogEntry[]
  } catch {
    return []
  }
}

export function writeLogs(dataDir: string, year: number, month: number, logs: LogEntry[]): void {
  ensureDataDir(dataDir)
  const sorted = [...logs].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.startTime.localeCompare(b.startTime)
  })
  const filePath = logFilePath(dataDir, year, month)
  writeFileSync(filePath, JSON.stringify(sorted, null, 2), 'utf-8')
}

const PROJECTS_FILE = 'projects.json'

export function readProjects(dataDir: string): Project[] {
  ensureDataDir(dataDir)
  const filePath = join(dataDir, PROJECTS_FILE)
  if (!existsSync(filePath)) return []
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as Project[]
  } catch {
    return []
  }
}

export function writeProjects(dataDir: string, projects: Project[]): void {
  ensureDataDir(dataDir)
  const filePath = join(dataDir, PROJECTS_FILE)
  writeFileSync(filePath, JSON.stringify(projects, null, 2), 'utf-8')
}
