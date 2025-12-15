/**
 * Admin User Service
 * 處理用戶管理相關的 API 請求
 */

import { BaseService } from '../BaseService'

export interface AdminUser {
  id: string
  email: string
  subscription_type: string
  subscription_expires_at: string | null
  trial_used: boolean
  created_at: string
}

export interface ActivateSubscriptionPayload {
  userId: string
  type: 'pro_7' | 'pro_30' | 'pro_yearly'
  expiresAt: string
}

export class AdminUserService extends BaseService {
  private static readonly BASE_PATH = '/api/admin/users'

  /**
   * 獲取所有用戶
   */
  static async getAll(): Promise<AdminUser[]> {
    return this.get<AdminUser[]>(this.BASE_PATH)
  }

  /**
   * 激活用戶訂閱
   */
  static async activateSubscription(payload: ActivateSubscriptionPayload): Promise<void> {
    return this.post<void>('/api/admin/subscription', payload)
  }

  /**
   * 重置試用狀態
   */
  static async resetTrial(userId: string): Promise<void> {
    return this.patch<void>(`${this.BASE_PATH}/${userId}/trial`, { reset: true })
  }
}
