import { SUBSCRIPTION_PLANS } from '@/lib/constants'

describe('Checkout API Logic', () => {
  test('should validate plan IDs exist', () => {
    const validPlanIds = SUBSCRIPTION_PLANS.map(plan => plan.id)
    
    expect(validPlanIds).toContain('pass_7')
    expect(validPlanIds).toContain('pass_30')
    expect(validPlanIds).toContain('pro_yearly')
  })

  test('should have valid plan structure for checkout', () => {
    SUBSCRIPTION_PLANS.forEach(plan => {
      // 檢查 checkout 需要的欄位
      expect(plan.id).toBeDefined()
      expect(plan.price).toBeGreaterThan(0)
      expect(plan.days).toBeGreaterThan(0)
      expect(plan.label).toBeDefined()
    })
  })

  test('should prevent invalid plan selection', () => {
    const invalidPlanId = 'invalid-plan'
    const validPlan = SUBSCRIPTION_PLANS.find(p => p.id === invalidPlanId)
    
    expect(validPlan).toBeUndefined()
  })
})
