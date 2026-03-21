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
      // @ts-ignore mock
      window['api'] = {
        readProjects: () => Promise.resolve(p),
        readLogs: ({ year, month }: { year: number; month: number }) =>
          Promise.resolve(
            l.filter((e: { date: string }) => {
              const parts = e.date.split('-').map(Number)
              return parts[0] === year && parts[1] === month
            })
          ),
        writeLogs: () => Promise.resolve({ success: true }),
        writeProjects: () => Promise.resolve({ success: true }),
        readConfig: () => Promise.resolve({ dataDir: '/tmp/waku-work-test' }),
        writeConfig: () => Promise.resolve({ success: true }),
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
