type Level = 'info' | 'warn' | 'error'

const isProd = process.env.NODE_ENV === 'production'

function log(level: Level, ...args: unknown[]) {
  if (isProd && level !== 'error') return
  // eslint-disable-next-line no-console
  console[level](...args)
}

export const logger = {
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
}
