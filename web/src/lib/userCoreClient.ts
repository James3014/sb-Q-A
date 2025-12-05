/**
 * user-core API 客戶端
 * 
 * 提供與 user-core 服務通信的基礎功能
 */

const USER_CORE_API_BASE = process.env.NEXT_PUBLIC_USER_CORE_API_URL || 'https://user-core.zeabur.app'

// 在客戶端，使用本地 API proxy 避免 Mixed Content 錯誤
// 在伺服器端，直接使用 UserCore API
const isClient = typeof window !== 'undefined'
const USER_CORE_API = isClient ? '/api/usercore/proxy' : USER_CORE_API_BASE

export interface UserCoreProfile {
  user_id?: string
  roles?: string[]
  preferred_language?: string
  experience_level?: string
  coach_cert_level?: string
  bio?: string
  preferred_resorts?: Array<{ resort_id: string; note?: string }>
  teaching_languages?: Array<{ language: string; proficiency: string }>
  status?: 'active' | 'inactive' | 'merged'
}

export interface UserCoreEvent {
  user_id: string
  source_project: 'snowboard-teaching'
  event_type: string
  occurred_at: string
  payload: Record<string, unknown>
  version?: number
}

/**
 * 創建用戶到 user-core
 */
export async function createUserInCore(
  userData: UserCoreProfile
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(USER_CORE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '/users/',
        body: userData,
        headers: {
          'X-Actor-Id': 'snowboard-teaching-app',
        },
      }),
      signal: AbortSignal.timeout(5000), // 5 秒超時
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[UserCore] Create user failed:', response.status, errorText)
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('[UserCore] Create user error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 更新用戶資料到 user-core
 */
export async function updateUserInCore(
  userId: string,
  userData: Partial<UserCoreProfile>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(USER_CORE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `/users/${userId}`,
        body: userData,
        headers: {
          'X-Actor-Id': 'snowboard-teaching-app',
        },
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[UserCore] Update user failed:', response.status, errorText)
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('[UserCore] Update user error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 發送事件到 user-core
 */
export async function sendEventToCore(
  event: UserCoreEvent
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(USER_CORE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '/events',
        body: {
          ...event,
          version: event.version || 1,
        },
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[UserCore] Send event failed:', response.status, errorText)
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[UserCore] Send event error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 獲取用戶資料從 user-core
 */
export async function getUserFromCore(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${USER_CORE_API}?endpoint=/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[UserCore] Get user failed:', response.status, errorText)
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('[UserCore] Get user error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
