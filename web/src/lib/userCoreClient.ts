/**
 * user-core API 客戶端
 * 
 * 提供與 user-core 服務通信的基礎功能
 */

const USER_CORE_API = process.env.NEXT_PUBLIC_USER_CORE_API_URL || 'https://user-core.zeabur.app'

// 確保 API 使用 HTTPS 以避免 Mixed Content 錯誤
const SECURE_USER_CORE_API = USER_CORE_API.replace(/^http:/, 'https:')

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
    const response = await fetch(`${SECURE_USER_CORE_API}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-Id': 'snowboard-teaching-app',
      },
      body: JSON.stringify(userData),
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
    const response = await fetch(`${SECURE_USER_CORE_API}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-Id': 'snowboard-teaching-app',
      },
      body: JSON.stringify(userData),
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
    const response = await fetch(`${SECURE_USER_CORE_API}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        version: event.version || 1,
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
    const response = await fetch(`${SECURE_USER_CORE_API}/users/${userId}`, {
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
