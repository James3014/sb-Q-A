import { useState, useEffect } from 'react'
import { AffiliateService } from '@/services/affiliateService'
import type { Affiliate, AffiliateFormData } from '@/types/affiliate'

export const useAffiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAffiliates = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AffiliateService.getAll()
      setAffiliates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createAffiliate = async (formData: AffiliateFormData) => {
    try {
      await AffiliateService.create(formData)
      await loadAffiliates() // 重新載入列表
    } catch (err) {
      throw err // 讓調用方處理錯誤
    }
  }

  const toggleAffiliate = async (id: string, isActive: boolean) => {
    try {
      await AffiliateService.toggle(id, isActive)
      await loadAffiliates() // 重新載入列表
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  useEffect(() => {
    loadAffiliates()
  }, [])

  // 計算統計數據
  const stats = {
    total: affiliates.length,
    active: affiliates.filter(a => a.is_active).length,
    totalTrials: affiliates.reduce((sum, a) => sum + a.total_trials, 0),
    totalCommissions: affiliates.reduce((sum, a) => sum + a.total_commissions, 0)
  }

  return {
    affiliates,
    loading,
    error,
    stats,
    loadAffiliates,
    createAffiliate,
    toggleAffiliate
  }
}
