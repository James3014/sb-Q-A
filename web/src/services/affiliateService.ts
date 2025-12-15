import { adminGet, adminPost } from '@/lib/adminApi'
import type { Affiliate, AffiliateFormData, AffiliateUser } from '@/types/affiliate'

export const affiliateServiceDeps = {
  adminGet,
  adminPost,
}

export class AffiliateService {
  static async getAll(): Promise<Affiliate[]> {
    try {
      const data = await affiliateServiceDeps.adminGet<{ affiliates: Affiliate[] }>('/api/admin/affiliates')
      return data?.affiliates || []
    } catch (error) {
      throw new Error('Failed to fetch affiliates')
    }
  }

  static async create(formData: AffiliateFormData): Promise<Affiliate> {
    try {
      const data = await affiliateServiceDeps.adminPost<{ affiliate: Affiliate }>(
        '/api/admin/affiliates/create',
        formData
      )
      if (!data?.affiliate) throw new Error('Invalid response')
      return data.affiliate
    } catch (error) {
      throw new Error('Failed to create affiliate')
    }
  }

  static async toggle(id: string, isActive: boolean): Promise<void> {
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive })
      })
      
      if (!response.ok) throw new Error('Failed to toggle affiliate')
    } catch (error) {
      throw new Error('Failed to toggle affiliate status')
    }
  }

  static async getUsers(affiliateId: string): Promise<AffiliateUser[]> {
    try {
      const data = await affiliateServiceDeps.adminGet<{ users: AffiliateUser[] }>(
        `/api/admin/affiliates/users?affiliate_id=${affiliateId}`
      )
      return data?.users || []
    } catch (error) {
      throw new Error('Failed to fetch affiliate users')
    }
  }
}
