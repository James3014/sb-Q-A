/**
 * 統一監控層 - 支持 Sentry、Vercel Analytics 等
 * 可選集成，無需安裝依賴
 */

interface ErrorContext {
  userId?: string
  pageUrl?: string
  [key: string]: unknown
}

/**
 * 捕獲錯誤到監控服務
 */
export function captureException(error: Error, context?: ErrorContext) {
  // 如果 Sentry 已初始化
  if (typeof window !== 'undefined' && (window as any).__SENTRY_CLIENT__) {
    try {
      ;(window as any).__SENTRY_CLIENT__.captureException(error, {
        contexts: context ? { custom: context } : undefined,
      })
    } catch (e) {
      // Sentry 調用失敗，降級處理
    }
  }

  // 本地日誌記錄
  console.error('[Monitoring] Error captured:', error, context)
}

/**
 * 捕獲消息事件
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window !== 'undefined' && (window as any).__SENTRY_CLIENT__) {
    try {
      ;(window as any).__SENTRY_CLIENT__.captureMessage(message, level)
    } catch (e) {
      // Sentry 調用失敗
    }
  }

  if (level === 'error') {
    console.error('[Monitoring]', message)
  }
}

/**
 * 設置用戶上下文
 */
export function setUserContext(userId: string, email?: string) {
  if (typeof window !== 'undefined' && (window as any).__SENTRY_CLIENT__) {
    try {
      ;(window as any).__SENTRY_CLIENT__.setUser({
        id: userId,
        email,
      })
    } catch (e) {
      // Sentry 調用失敗
    }
  }
}

/**
 * 清除用戶上下文（登出時）
 */
export function clearUserContext() {
  if (typeof window !== 'undefined' && (window as any).__SENTRY_CLIENT__) {
    try {
      ;(window as any).__SENTRY_CLIENT__.setUser(null)
    } catch (e) {
      // Sentry 調用失敗
    }
  }
}

/**
 * API 錯誤處理包裝器
 */
export async function monitoredApiCall<T>(
  fn: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    captureException(error as Error, {
      operation: operationName,
      timestamp: new Date().toISOString(),
    })
    throw error
  }
}

/**
 * 性能監控 - 記錄 API 響應時間
 */
export function recordApiMetric(endpoint: string, duration: number, status: number) {
  // 如果集成了 Vercel Analytics 或 Sentry
  if (typeof window !== 'undefined' && (window as any).__VERCEL_ANALYTICS__) {
    try {
      ;(window as any).__VERCEL_ANALYTICS__.push({
        name: `api_${endpoint}`,
        value: duration,
        unit: 'ms',
      })
    } catch (e) {
      // Analytics 調用失敗
    }
  }

  // 本地日誌
  if (status >= 400) {
    console.warn(`[Monitoring] API ${endpoint} failed with status ${status} (${duration}ms)`)
  }
}

/**
 * 支付流程監控
 */
export function recordPaymentEvent(
  event: 'checkout_initiated' | 'payment_success' | 'payment_failed' | 'webhook_received',
  metadata?: Record<string, unknown>
) {
  captureMessage(`Payment event: ${event}`, metadata?.error ? 'error' : 'info')

  // 可以在此添加更多監控邏輯
  if (event === 'payment_failed') {
    console.error('[Monitoring] Payment failed:', metadata)
  }
}
