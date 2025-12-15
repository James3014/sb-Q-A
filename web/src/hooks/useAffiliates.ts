import { useState, useEffect, useMemo, useCallback } from 'react'
import { AffiliateService } from '@/services/affiliateService'
import type { Affiliate, AffiliateFormData } from '@/types/affiliate'

/**
 * useAffiliates Hook 返回類型
 * 遵循統一的 Hook 返回格式規範
 */
export interface UseAffiliatesReturn {
  data: Affiliate[]
  loading: boolean
  error: string | null
  stats: {
    total: number
    active: number
    totalClicks: number
    totalTrials: number
    totalCommissions: number
  }
  actions: {
    refresh: () => Promise<void>
    create: (formData: AffiliateFormData) => Promise<void>
    toggle: (id: string, isActive: boolean) => Promise<void>
  }
}

/**
 * 聯盟行銷管理 Hook
 *
 * @returns {UseAffiliatesReturn} 標準化的 Hook 返回對象
 *
 * @example
 * ```tsx
 * const { data: affiliates, loading, actions } = useAffiliates()
 *
 * // 使用操作
 * await actions.refresh()
 * await actions.create(formData)
 * await actions.toggle(id, true)
 * ```
 */
export const useAffiliates = (): UseAffiliatesReturn => {
  const [data, setData] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * 載入聯盟行銷列表
   */
  const loadAffiliates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const affiliates = await AffiliateService.getAll()
      setData(affiliates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 創建新的聯盟
   */
  const createAffiliate = useCallback(async (formData: AffiliateFormData) => {
    try {
      await AffiliateService.create(formData)
      await loadAffiliates() // 重新載入列表
    } catch (err) {
      throw err // 讓調用方處理錯誤
    }
  }, [loadAffiliates])

  /**
   * 切換聯盟啟用狀態
   */
  const toggleAffiliate = useCallback(async (id: string, isActive: boolean) => {
    try {
      await AffiliateService.toggle(id, isActive)
      await loadAffiliates() // 重新載入列表
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [loadAffiliates])

  /**
   * 自動載入
   */
  useEffect(() => {
    loadAffiliates()
  }, [loadAffiliates])

  /**
   * 計算統計數據
   */
  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter(a => a.is_active).length,
    totalClicks: data.reduce((sum, a) => sum + a.total_clicks, 0),
    totalTrials: data.reduce((sum, a) => sum + a.total_trials, 0),
    totalCommissions: data.reduce((sum, a) => sum + a.total_commissions, 0)
  }), [data])

  return {
    data,
    loading,
    error,
    stats,
    actions: {
      refresh: loadAffiliates,
      create: createAffiliate,
      toggle: toggleAffiliate
    }
  }
}
