import { SUBSCRIPTION_PLANS } from '@/lib/constants'

describe('Payment Constants', () => {
  test('should have valid subscription plans', () => {
    expect(SUBSCRIPTION_PLANS).toBeDefined()
    expect(SUBSCRIPTION_PLANS.length).toBeGreaterThan(0)
    
    SUBSCRIPTION_PLANS.forEach(plan => {
      expect(plan.id).toBeDefined()
      expect(plan.label).toBeDefined()
      expect(plan.price).toBeGreaterThanOrEqual(0)
      expect(plan.days).toBeGreaterThan(0)
      expect(typeof plan.id).toBe('string')
      expect(typeof plan.label).toBe('string')
      expect(typeof plan.price).toBe('number')
      expect(typeof plan.days).toBe('number')
    })
  })

  test('should have unique plan IDs', () => {
    const ids = SUBSCRIPTION_PLANS.map(plan => plan.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  test('should have valid plan structure', () => {
    // 檢查是否有 7天、30天、年費方案
    const sevenDayPlan = SUBSCRIPTION_PLANS.find(plan => plan.days === 7)
    const thirtyDayPlan = SUBSCRIPTION_PLANS.find(plan => plan.days === 30)
    const yearlyPlan = SUBSCRIPTION_PLANS.find(plan => plan.days === 365)
    
    expect(sevenDayPlan).toBeDefined()
    expect(thirtyDayPlan).toBeDefined()
    expect(yearlyPlan).toBeDefined()
    
    // 檢查價格合理性
    expect(sevenDayPlan?.price).toBeGreaterThan(0)
    expect(thirtyDayPlan?.price).toBeGreaterThan(sevenDayPlan?.price || 0)
    expect(yearlyPlan?.price).toBeGreaterThan(thirtyDayPlan?.price || 0)
  })
})
