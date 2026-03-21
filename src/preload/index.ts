import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import type {
  DialogSelectFolderResponse,
  GetConfigResponse,
  ListLogsRequest,
  ListLogsResponse,
  ListProjectsResponse,
  MoveLogEntryRequest,
  MoveLogEntryResponse,
  SaveConfigRequest,
  SaveConfigResponse,
  SaveLogsRequest,
  SaveLogsResponse,
  SaveProjectsRequest,
  SaveProjectsResponse
} from '../shared'
import { CONFIG_CHANNELS, DIALOG_CHANNELS, LOG_CHANNELS, PROJECT_CHANNELS } from '../shared'

export const api = {
  listLogs: (args: ListLogsRequest): Promise<ListLogsResponse> =>
    ipcRenderer.invoke(LOG_CHANNELS.READ, args),
  saveLogs: (args: SaveLogsRequest): Promise<SaveLogsResponse> =>
    ipcRenderer.invoke(LOG_CHANNELS.WRITE, args),
  moveLogEntry: (args: MoveLogEntryRequest): Promise<MoveLogEntryResponse> =>
    ipcRenderer.invoke(LOG_CHANNELS.MOVE, args),
  listProjects: (): Promise<ListProjectsResponse> => ipcRenderer.invoke(PROJECT_CHANNELS.READ),
  saveProjects: (data: SaveProjectsRequest): Promise<SaveProjectsResponse> =>
    ipcRenderer.invoke(PROJECT_CHANNELS.WRITE, data),
  getConfig: (): Promise<GetConfigResponse> => ipcRenderer.invoke(CONFIG_CHANNELS.READ),
  saveConfig: (data: SaveConfigRequest): Promise<SaveConfigResponse> =>
    ipcRenderer.invoke(CONFIG_CHANNELS.WRITE, data),
  selectFolder: (): Promise<DialogSelectFolderResponse> =>
    ipcRenderer.invoke(DIALOG_CHANNELS.SELECT_FOLDER)
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
