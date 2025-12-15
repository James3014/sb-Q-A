import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAffiliates } from '@/hooks/useAffiliates'
import { formatDate, calculateCommission, getSubscriptionStatus } from '@/utils/affiliateUtils'
import { AffiliateService, affiliateServiceDeps } from '@/services/affiliateService'

const adminGetMock = jest.fn()
const adminPostMock = jest.fn()

beforeEach(() => {
  adminGetMock.mockReset()
  adminPostMock.mockReset()
  affiliateServiceDeps.adminGet = adminGetMock as any
  affiliateServiceDeps.adminPost = adminPostMock as any
})

afterEach(() => {
  jest.restoreAllMocks()
})

// 測試工具函數
describe('Affiliate Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      expect(formatDate('2023-12-12T10:00:00Z')).toBe('2023/12/12')
    })
  })

  describe('calculateCommission', () => {
    it('should calculate commission correctly', () => {
      expect(calculateCommission(1000, 0.15)).toBe(150)
      expect(calculateCommission(500, 0.20)).toBe(100)
    })
  })

  describe('getSubscriptionStatus', () => {
    it('should return correct status for active subscription', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString()
      const user = {
        subscription_type: 'pro',
        subscription_expires_at: futureDate
      }
      expect(getSubscriptionStatus(user)).toContain('pro')
    })

    it('should return expired for past date', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString()
      const user = {
        subscription_type: 'pro',
        subscription_expires_at: pastDate
      }
      expect(getSubscriptionStatus(user)).toBe('已過期')
    })
  })
})

// 測試 Hook
describe('useAffiliates Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should load affiliates on mount', async () => {
    const mockAffiliates = [
      { id: '1', partner_name: 'Test Partner', total_trials: 10 }
    ]
    
    jest.spyOn(AffiliateService, 'getAll').mockResolvedValue(mockAffiliates as any)
    
    const { result } = renderHook(() => useAffiliates())
    
    await waitFor(() => {
      expect(result.current.affiliates).toEqual(mockAffiliates)
      expect(result.current.loading).toBe(false)
    })
  })

  it('should create affiliate successfully', async () => {
    const newAffiliate = {
      partner_name: 'New Partner',
      contact_email: 'test@example.com',
      coupon_code: 'TEST123',
      commission_rate: 0.15
    }

    jest.spyOn(AffiliateService, 'create').mockResolvedValue({ id: '2', ...newAffiliate } as any)
    
    const { result } = renderHook(() => useAffiliates())
    
    await act(async () => {
      await result.current.createAffiliate(newAffiliate)
    })

    expect(AffiliateService.create).toHaveBeenCalledWith(newAffiliate)
  })
})

// 測試服務層
describe('AffiliateService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch affiliates from API', async () => {
    const mockResponse = { affiliates: [{ id: '1', partner_name: 'Test' }] }
    adminGetMock.mockResolvedValue(mockResponse)

    const result = await AffiliateService.getAll()
    
    expect(adminGetMock).toHaveBeenCalledWith('/api/admin/affiliates')
    expect(result).toEqual(mockResponse.affiliates)
  })

  it('should handle API errors gracefully', async () => {
    adminGetMock.mockRejectedValue(new Error('boom'))

    await expect(AffiliateService.getAll()).rejects.toThrow('Failed to fetch affiliates')
  })
})
