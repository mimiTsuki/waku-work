/**
 * ログレベルの定義
 */
export const LogLevels = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
} as const

export type LogLevel = (typeof LogLevels)[keyof typeof LogLevels]

/**
 * 現在の環境設定に基づいたログレベル
 * 本番/検証環境ではINFO以上、ローカル/開発環境ではすべてのレベルを出力
 */
const showLogLevel = process.env.NODE_ENV === 'production' ? LogLevels.INFO : LogLevels.DEBUG

/**
 * ログレベルの優先順位マップ
 */
const logLevelPriority: Record<LogLevel, number> = {
  [LogLevels.DEBUG]: 0,
  [LogLevels.INFO]: 1,
  [LogLevels.WARN]: 2,
  [LogLevels.ERROR]: 3
}

/**
 * 指定されたログレベルが現在の設定で出力可能かを判定
 */
const shouldLog = (level: LogLevel): boolean => {
  return logLevelPriority[level] >= logLevelPriority[showLogLevel]
}

/**
 * 構造化ログの追加フィールド
 */
type LogData = Record<string, unknown>

/**
 * ロガーインターフェース
 * 全てのログメソッドは構造化データを受け取り、JSON Lines形式で出力する
 */
export interface Logger {
  debug(message: string, data?: LogData): void
  info(message: string, data?: LogData): void
  warn(message: string, data?: LogData): void
  error(message: string, data?: LogData): void
}

/**
 * JSON Lines形式のエントリを構築する
 */
const buildLogEntry = (
  level: LogLevel,
  loggerName: string | undefined,
  message: string,
  data?: LogData
): string => {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    'severity.text': level,
    message
  }

  if (loggerName) {
    entry['source'] = loggerName
  }

  if (data) {
    for (const [key, value] of Object.entries(data)) {
      entry[key] = value
    }
  }

  return JSON.stringify(entry)
}

/**
 * JSON Lines構造化ログを出力するロガー実装
 */
class StructuredLogger implements Logger {
  private readonly loggerName?: string

  constructor(loggerName?: string) {
    this.loggerName = loggerName
  }

  debug(message: string, data?: LogData): void {
    if (shouldLog(LogLevels.DEBUG)) {
      console.debug(buildLogEntry(LogLevels.DEBUG, this.loggerName, message, data))
    }
  }

  info(message: string, data?: LogData): void {
    if (shouldLog(LogLevels.INFO)) {
      console.info(buildLogEntry(LogLevels.INFO, this.loggerName, message, data))
    }
  }

  warn(message: string, data?: LogData): void {
    if (shouldLog(LogLevels.WARN)) {
      console.warn(buildLogEntry(LogLevels.WARN, this.loggerName, message, data))
    }
  }

  error(message: string, data?: LogData): void {
    if (shouldLog(LogLevels.ERROR)) {
      console.error(buildLogEntry(LogLevels.ERROR, this.loggerName, message, data))
    }
  }
}

/**
 * ロガー名を指定してロガーインスタンスを作成
 * @param loggerName ログに付加するソース名（例: 'LogController'）
 */
export function createLogger(loggerName?: string): Logger {
  return new StructuredLogger(loggerName)
}
