/**
 * user-core 監控和錯誤追蹤
 * 
 * Phase 3: 提供錯誤監控、性能追蹤和健康檢查功能
 */

// 監控統計
interface SyncStats {
  totalAttempts: number
  successCount: number
  failureCount: number
  lastSuccess: Date | null
  lastFailure: Date | null
  lastError: string | null
  avgResponseTime: number
  responseTimes: number[]
}

// 全局統計對象
const stats: {
  userSync: SyncStats
  eventSync: SyncStats
} = {
  userSync: {
    totalAttempts: 0,
    successCount: 0,
    failureCount: 0,
    lastSuccess: null,
    lastFailure: null,
    lastError: null,
    avgResponseTime: 0,
    responseTimes: [],
  },
  eventSync: {
    totalAttempts: 0,
    successCount: 0,
    failureCount: 0,
    lastSuccess: null,
    lastFailure: null,
    lastError: null,
    avgResponseTime: 0,
    responseTimes: [],
  },
}

/**
 * 紀錄同步嘗試
 */
export function recordSyncAttempt(type: 'user' | 'event'): void {
  const stat = type === 'user' ? stats.userSync : stats.eventSync
  stat.totalAttempts++
}

/**
 * 紀錄同步成功
 */
export function recordSyncSuccess(
  type: 'user' | 'event',
  responseTime: number
): void {
  const stat = type === 'user' ? stats.userSync : stats.eventSync
  stat.successCount++
  stat.lastSuccess = new Date()
  
  // 紀錄響應時間（最多保留 100 個）
  stat.responseTimes.push(responseTime)
  if (stat.responseTimes.length > 100) {
    stat.responseTimes.shift()
  }
  
  // 計算平均響應時間
  stat.avgResponseTime =
    stat.responseTimes.reduce((sum, t) => sum + t, 0) / stat.responseTimes.length
}

/**
 * 紀錄同步失敗
 */
export function recordSyncFailure(
  type: 'user' | 'event',
  error: string
): void {
  const stat = type === 'user' ? stats.userSync : stats.eventSync
  stat.failureCount++
  stat.lastFailure = new Date()
  stat.lastError = error
  
  // 如果失敗率過高，發出警告
  const failureRate = stat.failureCount / stat.totalAttempts
  if (failureRate > 0.1 && stat.totalAttempts > 10) {
    console.warn(
      `[UserCoreMonitoring] High failure rate for ${type} sync: ${(failureRate * 100).toFixed(1)}%`
    )
  }
}

/**
 * 獲取統計資料
 */
export function getStats(): typeof stats {
  return { ...stats }
}

/**
 * 獲取健康狀態
 */
export function getHealthStatus(): {
  healthy: boolean
  userSync: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    successRate: number
    avgResponseTime: number
  }
  eventSync: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    successRate: number
    avgResponseTime: number
  }
} {
  const userSuccessRate =
    stats.userSync.totalAttempts > 0
      ? stats.userSync.successCount / stats.userSync.totalAttempts
      : 1
  const eventSuccessRate =
    stats.eventSync.totalAttempts > 0
      ? stats.eventSync.successCount / stats.eventSync.totalAttempts
      : 1

  const getUserStatus = (): 'healthy' | 'degraded' | 'unhealthy' => {
    if (userSuccessRate >= 0.95) return 'healthy'
    if (userSuccessRate >= 0.8) return 'degraded'
    return 'unhealthy'
  }

  const getEventStatus = (): 'healthy' | 'degraded' | 'unhealthy' => {
    if (eventSuccessRate >= 0.95) return 'healthy'
    if (eventSuccessRate >= 0.8) return 'degraded'
    return 'unhealthy'
  }

  const userStatus = getUserStatus()
  const eventStatus = getEventStatus()

  return {
    healthy: userStatus !== 'unhealthy' && eventStatus !== 'unhealthy',
    userSync: {
      status: userStatus,
      successRate: userSuccessRate,
      avgResponseTime: stats.userSync.avgResponseTime,
    },
    eventSync: {
      status: eventStatus,
      successRate: eventSuccessRate,
      avgResponseTime: stats.eventSync.avgResponseTime,
    },
  }
}

/**
 * 重置統計資料
 */
export function resetStats(): void {
  stats.userSync = {
    totalAttempts: 0,
    successCount: 0,
    failureCount: 0,
    lastSuccess: null,
    lastFailure: null,
    lastError: null,
    avgResponseTime: 0,
    responseTimes: [],
  }
  stats.eventSync = {
    totalAttempts: 0,
    successCount: 0,
    failureCount: 0,
    lastSuccess: null,
    lastFailure: null,
    lastError: null,
    avgResponseTime: 0,
    responseTimes: [],
  }
}

/**
 * 打印統計報告（用於調試）
 */
export function printStatsReport(): void {
  console.group('[UserCoreMonitoring] Statistics Report')
  
  console.group('User Sync')
  console.log('Total Attempts:', stats.userSync.totalAttempts)
  console.log('Success Count:', stats.userSync.successCount)
  console.log('Failure Count:', stats.userSync.failureCount)
  console.log(
    'Success Rate:',
    stats.userSync.totalAttempts > 0
      ? `${((stats.userSync.successCount / stats.userSync.totalAttempts) * 100).toFixed(1)}%`
      : 'N/A'
  )
  console.log('Avg Response Time:', `${stats.userSync.avgResponseTime.toFixed(0)}ms`)
  console.log('Last Success:', stats.userSync.lastSuccess?.toISOString() || 'Never')
  console.log('Last Failure:', stats.userSync.lastFailure?.toISOString() || 'Never')
  if (stats.userSync.lastError) {
    console.log('Last Error:', stats.userSync.lastError)
  }
  console.groupEnd()
  
  console.group('Event Sync')
  console.log('Total Attempts:', stats.eventSync.totalAttempts)
  console.log('Success Count:', stats.eventSync.successCount)
  console.log('Failure Count:', stats.eventSync.failureCount)
  console.log(
    'Success Rate:',
    stats.eventSync.totalAttempts > 0
      ? `${((stats.eventSync.successCount / stats.eventSync.totalAttempts) * 100).toFixed(1)}%`
      : 'N/A'
  )
  console.log('Avg Response Time:', `${stats.eventSync.avgResponseTime.toFixed(0)}ms`)
  console.log('Last Success:', stats.eventSync.lastSuccess?.toISOString() || 'Never')
  console.log('Last Failure:', stats.eventSync.lastFailure?.toISOString() || 'Never')
  if (stats.eventSync.lastError) {
    console.log('Last Error:', stats.eventSync.lastError)
  }
  console.groupEnd()
  
  const health = getHealthStatus()
  console.group('Health Status')
  console.log('Overall:', health.healthy ? '✅ Healthy' : '⚠️ Unhealthy')
  console.log('User Sync:', health.userSync.status)
  console.log('Event Sync:', health.eventSync.status)
  console.groupEnd()
  
  console.groupEnd()
}

// 在開發環境中，將統計函數暴露到全局
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).__userCoreStats = {
    getStats,
    getHealthStatus,
    resetStats,
    printStatsReport,
  }
  console.log(
    '[UserCoreMonitoring] Stats functions available at window.__userCoreStats'
  )
}
