import type { Page } from '@playwright/test'

export const DEFAULT_PROJECTS = [
  { id: 'proj-1', name: '開発業務', color: '#3b82f6', archived: false }
]

export interface MockLog {
  id: string
  date: string
  projectId: string
  startTime: string
  endTime: string
  memo: string
  createdAt: string
}

interface MockOptions {
  projects?: typeof DEFAULT_PROJECTS
  logs?: MockLog[]
}

/**
 * window.api と window.electron をモックする addInitScript を設定する。
 * page.goto() の前に呼び出すこと。
 */
export async function setupMockApi(page: Page, options: MockOptions = {}): Promise<void> {
  const projects = options.projects ?? DEFAULT_PROJECTS
  const logs = options.logs ?? []

  await page.addInitScript(
    ({ p, l }) => {
      const ipcOk = <T>(data: T) => ({ kind: 'success' as const, data })
      const ipcOkVoid = () => ({ kind: 'success' as const, data: undefined })

      // In-memory store so saves are reflected in subsequent reads
      let storedLogs = [...l]
      let storedProjects = [...p]

      // @ts-ignore mock
      window['api'] = {
        listProjects: () => Promise.resolve(ipcOk(storedProjects)),
        saveProjects: (projects: typeof p) => {
          storedProjects = projects
          return Promise.resolve(ipcOkVoid())
        },
        listLogs: ({ year, month }: { year: number; month: number }) =>
          Promise.resolve(
            ipcOk(
              storedLogs.filter((e: { date: string }) => {
                const parts = e.date.split('-').map(Number)
                return parts[0] === year && parts[1] === month
              })
            )
          ),
        saveLogs: ({ logs: newLogs }: { year: number; month: number; logs: typeof l }) => {
          // Replace logs for that month
          const dates = new Set(newLogs.map((e: { date: string }) => e.date))
          storedLogs = storedLogs.filter(
            (e: { date: string }) => !dates.has(e.date)
          )
          storedLogs.push(...newLogs)
          return Promise.resolve(ipcOkVoid())
        },
        moveLogEntry: () => Promise.resolve(ipcOkVoid()),
        getConfig: () => Promise.resolve(ipcOk({ dataDir: '/tmp/waku-work-test' })),
        saveConfig: () => Promise.resolve(ipcOkVoid()),
        selectFolder: () => Promise.resolve(null)
      }
      // @ts-ignore mock
      window['electron'] = {
        ipcRenderer: {
          on: () => () => {},
          once: () => {},
          send: () => {},
          invoke: () => Promise.resolve(null),
          removeListener: () => {},
          removeAllListeners: () => {}
        },
        process: {
          platform: 'darwin',
          versions: { node: '18.0.0', chrome: '108.0.0', electron: '22.0.0' },
          env: {}
        }
      }
    },
    { p: projects, l: logs }
  )
}
