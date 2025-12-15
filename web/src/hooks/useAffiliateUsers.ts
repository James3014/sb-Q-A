import { useState, useCallback } from 'react'
import { AffiliateService } from '@/services/affiliateService'
import type { AffiliateUser } from '@/types/affiliate'
import { logger } from '@/lib/logging'

/**
 * useAffiliateUsers Hook 返回類型
 * 遵循統一的 Hook 返回格式規範
 */
export interface UseAffiliateUsersReturn {
  data: Record<string, AffiliateUser[]>
  loading: Record<string, boolean>
  error: string | null
  state: {
    expandedAffiliate: string | null
  }
  actions: {
    toggleExpanded: (affiliateId: string) => Promise<void>
    loadUsers: (affiliateId: string) => Promise<void>
  }
}

/**
 * 聯盟用戶管理 Hook (展開/收合 + 用戶列表載入)
 *
 * @returns {UseAffiliateUsersReturn} 標準化的 Hook 返回對象
 *
 * @example
 * ```tsx
 * const { data, loading, state, actions } = useAffiliateUsers()
 *
 * // 切換展開狀態
 * await actions.toggleExpanded(affiliateId)
 *
 * // 手動載入用戶
 * await actions.loadUsers(affiliateId)
 *
 * // 獲取數據
 * const users = data[affiliateId] || []
 * const isLoading = loading[affiliateId] || false
 * const isExpanded = state.expandedAffiliate === affiliateId
 * ```
 */
export const useAffiliateUsers = (): UseAffiliateUsersReturn => {
  const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, AffiliateUser[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  /**
   * 載入指定聯盟的用戶列表
   */
  const loadUsers = useCallback(async (affiliateId: string) => {
    try {
      setLoading(prev => ({ ...prev, [affiliateId]: true }))
      setError(null)

      logger.info('useAffiliateUsers: Loading users', { affiliateId })

      const users = await AffiliateService.getUsers(affiliateId)
      setData(prev => ({ ...prev, [affiliateId]: users }))

      logger.info('useAffiliateUsers: Users loaded', {
        affiliateId,
        count: users.length
      })
    } catch (err) {
      const message = '載入用戶失敗'
      setError(message)
      logger.error('useAffiliateUsers: Failed to load users', err as Error, {
        affiliateId
      })
    } finally {
      setLoading(prev => ({ ...prev, [affiliateId]: false }))
    }
  }, [])

  /**
   * 切換展開/收合狀態，自動載入用戶（如果未載入）
   */
  const toggleExpanded = useCallback(
    async (affiliateId: string) => {
      if (expandedAffiliate === affiliateId) {
        // 收合
        setExpandedAffiliate(null)
        return
      }

      // 展開
      setExpandedAffiliate(affiliateId)

      // 如果還沒載入過這個合作方的用戶，就載入
      if (!data[affiliateId]) {
        await loadUsers(affiliateId)
      }
    },
    [expandedAffiliate, data, loadUsers]
  )

  return {
    data,
    loading,
    error,
    state: {
      expandedAffiliate
    },
    actions: {
      toggleExpanded,
      loadUsers
    }
  }
}
