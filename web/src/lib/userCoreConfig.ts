/**
 * user-core 配置管理
 * 
 * Phase 3: 集中管理所有 user-core 相關配置
 */

export interface UserCoreConfig {
  // API 配置
  apiUrl: string
  timeout: number
  
  // 批次處理配置
  batchSize: number
  batchInterval: number
  
  // 重試配置
  maxRetries: number
  retryDelay: number
  
  // 功能開關
  enableUserSync: boolean
  enableEventSync: boolean
  enableMonitoring: boolean
  
  // 調試模式
  debug: boolean
}

// 默認配置
const defaultConfig: UserCoreConfig = {
  apiUrl: 'https://user-core.zeabur.app',
  timeout: 5000, // 5 秒
  
  batchSize: 10,
  batchInterval: 5000, // 5 秒
  
  maxRetries: 0, // 不重試（避免複雜性）
  retryDelay: 1000,
  
  enableUserSync: true,
  enableEventSync: true,
  enableMonitoring: true,
  
  debug: process.env.NODE_ENV === 'development',
}

// 從環境變數載入配置
function loadConfigFromEnv(): Partial<UserCoreConfig> {
  const config: Partial<UserCoreConfig> = {}
  
  // API URL
  if (process.env.NEXT_PUBLIC_USER_CORE_API_URL) {
    config.apiUrl = process.env.NEXT_PUBLIC_USER_CORE_API_URL
  }
  
  // 超時時間
  if (process.env.NEXT_PUBLIC_USER_CORE_TIMEOUT) {
    config.timeout = parseInt(process.env.NEXT_PUBLIC_USER_CORE_TIMEOUT, 10)
  }
  
  // 批次大小
  if (process.env.NEXT_PUBLIC_USER_CORE_BATCH_SIZE) {
    config.batchSize = parseInt(process.env.NEXT_PUBLIC_USER_CORE_BATCH_SIZE, 10)
  }
  
  // 批次間隔
  if (process.env.NEXT_PUBLIC_USER_CORE_BATCH_INTERVAL) {
    config.batchInterval = parseInt(process.env.NEXT_PUBLIC_USER_CORE_BATCH_INTERVAL, 10)
  }
  
  // 功能開關
  if (process.env.NEXT_PUBLIC_USER_CORE_ENABLE_USER_SYNC === 'false') {
    config.enableUserSync = false
  }
  
  if (process.env.NEXT_PUBLIC_USER_CORE_ENABLE_EVENT_SYNC === 'false') {
    config.enableEventSync = false
  }
  
  if (process.env.NEXT_PUBLIC_USER_CORE_ENABLE_MONITORING === 'false') {
    config.enableMonitoring = false
  }
  
  // 調試模式
  if (process.env.NEXT_PUBLIC_USER_CORE_DEBUG === 'true') {
    config.debug = true
  }
  
  return config
}

// 合併配置
let currentConfig: UserCoreConfig = {
  ...defaultConfig,
  ...loadConfigFromEnv(),
}

/**
 * 獲取當前配置
 */
export function getConfig(): UserCoreConfig {
  return { ...currentConfig }
}

/**
 * 更新配置（用於運行時調整）
 */
export function updateConfig(updates: Partial<UserCoreConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...updates,
  }
  
  if (currentConfig.debug) {
    console.log('[UserCoreConfig] Configuration updated:', updates)
  }
}

/**
 * 重置為默認配置
 */
export function resetConfig(): void {
  currentConfig = {
    ...defaultConfig,
    ...loadConfigFromEnv(),
  }
  
  if (currentConfig.debug) {
    console.log('[UserCoreConfig] Configuration reset to defaults')
  }
}

/**
 * 打印當前配置（用於調試）
 */
export function printConfig(): void {
  if (process.env.NODE_ENV !== 'development') return
  console.group('[UserCoreConfig] Current Configuration')
  console.log('API URL:', currentConfig.apiUrl)
  console.log('Timeout:', `${currentConfig.timeout}ms`)
  console.log('Batch Size:', currentConfig.batchSize)
  console.log('Batch Interval:', `${currentConfig.batchInterval}ms`)
  console.log('Max Retries:', currentConfig.maxRetries)
  console.log('Retry Delay:', `${currentConfig.retryDelay}ms`)
  console.log('Enable User Sync:', currentConfig.enableUserSync)
  console.log('Enable Event Sync:', currentConfig.enableEventSync)
  console.log('Enable Monitoring:', currentConfig.enableMonitoring)
  console.log('Debug Mode:', currentConfig.debug)
  console.groupEnd()
}

// 在開發環境中，將配置函數暴露到全局
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).__userCoreConfig = {
    getConfig,
    updateConfig,
    resetConfig,
    printConfig,
  }
  // eslint-disable-next-line no-console
  console.log(
    '[UserCoreConfig] Config functions available at window.__userCoreConfig'
  )
}

// 初始化時打印配置（僅在調試模式）
if (currentConfig.debug) {
  printConfig()
}
