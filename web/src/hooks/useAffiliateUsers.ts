import { useState } from 'react'
import { AffiliateService } from '@/services/affiliateService'
import type { AffiliateUser } from '@/types/affiliate'

export const useAffiliateUsers = () => {
  const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null)
  const [affiliateUsers, setAffiliateUsers] = useState<Record<string, AffiliateUser[]>>({})
  const [loadingUsers, setLoadingUsers] = useState<Record<string, boolean>>({})

  const toggleExpanded = async (affiliateId: string) => {
    if (expandedAffiliate === affiliateId) {
      setExpandedAffiliate(null)
      return
    }

    setExpandedAffiliate(affiliateId)

    // 如果還沒載入過這個合作方的用戶，就載入
    if (!affiliateUsers[affiliateId]) {
      await loadUsers(affiliateId)
    }
  }

  const loadUsers = async (affiliateId: string) => {
    try {
      setLoadingUsers(prev => ({ ...prev, [affiliateId]: true }))
      const users = await AffiliateService.getUsers(affiliateId)
      setAffiliateUsers(prev => ({ ...prev, [affiliateId]: users }))
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoadingUsers(prev => ({ ...prev, [affiliateId]: false }))
    }
  }

  return {
    expandedAffiliate,
    affiliateUsers,
    loadingUsers,
    toggleExpanded
  }
}
