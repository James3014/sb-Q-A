/**
 * user-core 同步邏輯
 * 
 * 處理單板教學用戶資料與 user-core 的同步
 */

import { User } from '@supabase/supabase-js'
import { createUserInCore, updateUserInCore, sendEventToCore } from './userCoreClient'
import {
  recordSyncAttempt,
  recordSyncSuccess,
  recordSyncFailure,
} from './userCoreMonitoring'
import { getConfig } from './userCoreConfig'

/**
 * 將 Supabase 用戶同步到 user-core
 * 
 * 這個函數是非阻塞的，失敗不會影響主流程
 */
export async function syncUserToCore(user: User): Promise<void> {
  const config = getConfig()
  
  // 檢查功能開關
  if (!config.enableUserSync) {
    if (config.debug) {
      console.log('[UserCoreSync] User sync disabled by config')
    }
    return
  }

  const startTime = Date.now()
  if (config.enableMonitoring) {
    recordSyncAttempt('user')
  }

  try {
    // 從 user metadata 或默認值構建用戶資料
    const userData = {
      user_id: user.id,
      roles: ['student'], // 默認角色
      preferred_language: 'zh-TW',
      experience_level: 'beginner', // 默認初級
      status: 'active' as const,
    }

    const result = await createUserInCore(userData)

    if (result.success) {
      const responseTime = Date.now() - startTime
      if (config.enableMonitoring) {
        recordSyncSuccess('user', responseTime)
      }
      if (config.debug) {
        console.log('[UserCoreSync] User synced successfully:', user.id, `(${responseTime}ms)`)
      }
    } else {
      if (config.enableMonitoring) {
        recordSyncFailure('user', result.error || 'Unknown error')
      }
      console.error('[UserCoreSync] Failed to sync user:', result.error)
      // 不拋出錯誤，避免阻塞主流程
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (config.enableMonitoring) {
      recordSyncFailure('user', errorMessage)
    }
    console.error('[UserCoreSync] Unexpected error:', error)
    // 靜默失敗，不影響用戶體驗
  }
}

/**
 * 更新用戶資料到 user-core
 */
export async function updateUserInCoreSync(
  userId: string,
  updates: {
    experience_level?: string
    roles?: string[]
    bio?: string
  }
): Promise<void> {
  try {
    const result = await updateUserInCore(userId, updates)

    if (result.success) {
      console.log('[UserCoreSync] User updated successfully:', userId)
    } else {
      console.error('[UserCoreSync] Failed to update user:', result.error)
    }
  } catch (error) {
    console.error('[UserCoreSync] Unexpected error:', error)
  }
}

/**
 * 同步事件到 user-core
 * 
 * 這個函數會將單板教學的事件同步到 user-core 的 BehaviorEvent
 */
export async function syncEventToCore(
  userId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const config = getConfig()
  
  // 檢查功能開關
  if (!config.enableEventSync) {
    if (config.debug) {
      console.log('[UserCoreSync] Event sync disabled by config')
    }
    return
  }

  const startTime = Date.now()
  if (config.enableMonitoring) {
    recordSyncAttempt('event')
  }

  try {
    const result = await sendEventToCore({
      user_id: userId,
      source_project: 'snowboard-teaching',
      event_type: eventType,
      occurred_at: new Date().toISOString(),
      payload,
    })

    if (result.success) {
      const responseTime = Date.now() - startTime
      if (config.enableMonitoring) {
        recordSyncSuccess('event', responseTime)
      }
      if (config.debug) {
        console.log('[UserCoreSync] Event synced:', eventType, `(${responseTime}ms)`)
      }
    } else {
      if (config.enableMonitoring) {
        recordSyncFailure('event', result.error || 'Unknown error')
      }
      console.error('[UserCoreSync] Failed to sync event:', result.error)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (config.enableMonitoring) {
      recordSyncFailure('event', errorMessage)
    }
    console.error('[UserCoreSync] Unexpected error:', error)
  }
}

/**
 * 批次同步事件（用於優化性能）
 */
const eventQueue: Array<{
  userId: string
  eventType: string
  payload: Record<string, unknown>
}> = []

let flushTimer: NodeJS.Timeout | null = null

export function queueEventSync(
  userId: string,
  eventType: string,
  payload: Record<string, unknown>
): void {
  const config = getConfig()
  
  eventQueue.push({ userId, eventType, payload })

  // 如果隊列達到配置的批次大小，立即刷新
  if (eventQueue.length >= config.batchSize) {
    flushEventQueue()
    return
  }

  // 否則等待配置的間隔後批次刷新
  if (flushTimer) {
    clearTimeout(flushTimer)
  }

  flushTimer = setTimeout(() => {
    flushEventQueue()
  }, config.batchInterval)
}

async function flushEventQueue(): Promise<void> {
  if (eventQueue.length === 0) return

  const config = getConfig()
  const events = eventQueue.splice(0, eventQueue.length)
  
  if (config.debug) {
    console.log(`[UserCoreSync] Flushing ${events.length} events...`)
  }

  // 並行發送所有事件
  await Promise.allSettled(
    events.map((event) =>
      syncEventToCore(event.userId, event.eventType, event.payload)
    )
  )

  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
}

// 在頁面卸載時刷新隊列
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushEventQueue()
  })
}
