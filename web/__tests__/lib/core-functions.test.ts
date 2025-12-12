import { formatDate } from '@/lib/constants'
import { getSubscriptionStatus, calculateExpiryDate } from '@/lib/subscription'

describe('Core Functions', () => {
  describe('formatDate', () => {
    test('should format date in full style', () => {
      const date = new Date('2025-12-11')
      const formatted = formatDate(date, 'full')
      
      expect(formatted).toMatch(/2025/)
      expect(formatted).toMatch(/12/)
      expect(formatted).toMatch(/11/)
    })

    test('should format date in short style', () => {
      const date = new Date('2025-12-11')
      const formatted = formatDate(date, 'short')
      
      expect(formatted).toMatch(/12/)
      expect(formatted).toMatch(/11/)
      expect(formatted).not.toMatch(/2025/) // short 不包含年份
    })

    test('should handle string input', () => {
      const dateString = '2025-12-11T10:30:00Z'
      const formatted = formatDate(dateString)
      
      expect(typeof formatted).toBe('string')
      expect(formatted.length).toBeGreaterThan(0)
    })
  })

  describe('getSubscriptionStatus', () => {
    test('should return correct colors for different statuses', () => {
      const freeStatus = getSubscriptionStatus('free', null)
      const activeStatus = getSubscriptionStatus('pass_7', new Date(Date.now() + 86400000).toISOString())
      const expiredStatus = getSubscriptionStatus('pass_7', new Date(Date.now() - 86400000).toISOString())
      
      expect(freeStatus.color).toBe('bg-zinc-600')
      expect(activeStatus.color).toBe('bg-amber-600')
      expect(expiredStatus.color).toBe('bg-red-600')
    })
  })

  describe('calculateExpiryDate', () => {
    test('should calculate correct expiry for all plans', () => {
      const sevenDayExpiry = calculateExpiryDate('pass_7')
      const thirtyDayExpiry = calculateExpiryDate('pass_30')
      const yearlyExpiry = calculateExpiryDate('pro_yearly')
      
      const now = new Date()
      
      expect(sevenDayExpiry.getTime()).toBeGreaterThan(now.getTime() + 6 * 24 * 60 * 60 * 1000)
      expect(thirtyDayExpiry.getTime()).toBeGreaterThan(now.getTime() + 29 * 24 * 60 * 60 * 1000)
      expect(yearlyExpiry.getTime()).toBeGreaterThan(now.getTime() + 364 * 24 * 60 * 60 * 1000)
    })
  })
})
