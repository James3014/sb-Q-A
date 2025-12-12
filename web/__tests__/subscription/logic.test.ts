import { getSubscriptionStatus, calculateExpiryDate } from '@/lib/subscription'

describe('Subscription Logic', () => {
  const now = new Date()
  const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // +1 day
  const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // -1 day

  test('should return correct status for active subscription', () => {
    const status = getSubscriptionStatus('pass_7', futureDate.toISOString())
    expect(status.label).toBe('7天')
    expect(status.isExpired).toBe(false)
    expect(status.color).toBe('bg-amber-600')
  })

  test('should return correct status for expired subscription', () => {
    const status = getSubscriptionStatus('pass_7', pastDate.toISOString())
    expect(status.label).toBe('已過期')
    expect(status.isExpired).toBe(true)
    expect(status.color).toBe('bg-red-600')
  })

  test('should return correct status for free plan', () => {
    const status = getSubscriptionStatus('free', null)
    expect(status.label).toBe('免費')
    expect(status.isExpired).toBe(false)
    expect(status.color).toBe('bg-zinc-600')
  })

  test('should return correct status for null plan', () => {
    const status = getSubscriptionStatus(null, null)
    expect(status.label).toBe('免費')
    expect(status.isExpired).toBe(false)
    expect(status.color).toBe('bg-zinc-600')
  })

  test('should calculate correct expiry date', () => {
    const expiryDate = calculateExpiryDate('pass_7')
    const expectedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    
    // 允許 1 秒的誤差
    expect(Math.abs(expiryDate.getTime() - expectedDate.getTime())).toBeLessThan(1000)
  })
})
