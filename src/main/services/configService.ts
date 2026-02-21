import { homedir } from 'os'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import type { AppConfig } from '../../shared/types'

const CONFIG_DIR = join(homedir(), '.config', 'waku-work')
const CONFIG_FILE = join(CONFIG_DIR, 'settings.json')

const DEFAULT_DATA_DIR = join(homedir(), '.config', 'waku-work', 'data')

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

export function ensureDataDir(dataDir: string): void {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
}

export function readConfig(): AppConfig {
  ensureConfigDir()
  if (!existsSync(CONFIG_FILE)) {
    const defaultConfig: AppConfig = { dataDir: DEFAULT_DATA_DIR }
    return defaultConfig
  }
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(raw) as AppConfig
  } catch {
    return { dataDir: DEFAULT_DATA_DIR }
  }
}

export function writeConfig(config: AppConfig): void {
  ensureConfigDir()
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
}
