/**
 * 統一日誌系統
 * 提供結構化日誌記錄功能
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

/**
 * Logger 類
 */
class Logger {
  private static instance: Logger
  private isProduction: boolean

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * 格式化日誌條目
   */
  private formatLogEntry(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry

    let logString = `[${timestamp}] [${level}] ${message}`

    if (context && Object.keys(context).length > 0) {
      logString += `\nContext: ${JSON.stringify(context, null, 2)}`
    }

    if (error) {
      logString += `\nError: ${error.name}: ${error.message}`
      if (error.stack) {
        logString += `\nStack: ${error.stack}`
      }
    }

    return logString
  }

  /**
   * 基礎日誌記錄方法
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    }

    const formattedLog = this.formatLogEntry(entry)

    // 在生產環境，可以將日誌發送到外部服務（如 Sentry, LogRocket 等）
    // 目前只輸出到 console
    switch (level) {
      case LogLevel.DEBUG:
        if (!this.isProduction) {
          console.debug(formattedLog)
        }
        break
      case LogLevel.INFO:
        console.info(formattedLog)
        break
      case LogLevel.WARN:
        console.warn(formattedLog)
        break
      case LogLevel.ERROR:
        console.error(formattedLog)
        // 在生產環境，這裡可以發送到錯誤追蹤服務
        if (this.isProduction && error) {
          // TODO: Send to error tracking service (e.g., Sentry)
          // Sentry.captureException(error, { contexts: { custom: context } })
        }
        break
    }
  }

  /**
   * Debug 級別日誌（只在開發環境）
   */
  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Info 級別日誌
   */
  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Warning 級別日誌
   */
  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Error 級別日誌
   */
  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  /**
   * 記錄 API 請求
   */
  logApiRequest(method: string, url: string, context?: Record<string, any>) {
    this.debug(`API Request: ${method} ${url}`, {
      method,
      url,
      ...context
    })
  }

  /**
   * 記錄 API 響應
   */
  logApiResponse(
    method: string,
    url: string,
    status: number,
    duration: number,
    context?: Record<string, any>
  ) {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.DEBUG
    this.log(
      level,
      `API Response: ${method} ${url} - ${status} (${duration}ms)`,
      {
        method,
        url,
        status,
        duration,
        ...context
      }
    )
  }

  /**
   * 記錄用戶操作
   */
  logUserAction(action: string, context?: Record<string, any>) {
    this.info(`User Action: ${action}`, context)
  }

  /**
   * 記錄性能指標
   */
  logPerformance(metric: string, value: number, context?: Record<string, any>) {
    this.info(`Performance: ${metric} = ${value}ms`, {
      metric,
      value,
      ...context
    })
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

/**
 * 便捷函數
 */
export function logDebug(message: string, context?: Record<string, any>) {
  logger.debug(message, context)
}

export function logInfo(message: string, context?: Record<string, any>) {
  logger.info(message, context)
}

export function logWarn(message: string, context?: Record<string, any>) {
  logger.warn(message, context)
}

export function logError(message: string, error?: Error, context?: Record<string, any>) {
  logger.error(message, error, context)
}
