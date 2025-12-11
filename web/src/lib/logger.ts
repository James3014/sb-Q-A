import { captureMessage, captureException } from './monitoring'

type Level = 'info' | 'warn' | 'error'

const isProd = process.env.NODE_ENV === 'production'

function log(level: Level, ...args: unknown[]) {
  // 生產環境只輸出 error
  if (isProd && level !== 'error') return

  // 發送到監控服務
  if (level === 'error' && typeof args[0] === 'string') {
    captureMessage(args[0] as string, 'error')
  }

  // 本地日誌輸出
  // eslint-disable-next-line no-console
  console[level](...args)
}

export const logger = {
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => {
    log('error', ...args)
    // 如果是 Error 對象，發送到 Sentry
    if (args[0] instanceof Error) {
      captureException(args[0])
    }
  },
}
