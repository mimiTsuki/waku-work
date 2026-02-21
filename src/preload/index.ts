import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { AppConfig, LogEntry, Project } from '../shared/types'

const api = {
  readLogs: (args: { year: number; month: number }): Promise<LogEntry[]> =>
    ipcRenderer.invoke('logs:read', args),
  writeLogs: (args: {
    year: number
    month: number
    logs: LogEntry[]
  }): Promise<{ success: boolean }> => ipcRenderer.invoke('logs:write', args),
  readProjects: (): Promise<Project[]> => ipcRenderer.invoke('projects:read'),
  writeProjects: (data: Project[]): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('projects:write', data),
  readConfig: (): Promise<AppConfig> => ipcRenderer.invoke('config:read'),
  writeConfig: (data: AppConfig): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('config:write', data),
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:select-folder')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
