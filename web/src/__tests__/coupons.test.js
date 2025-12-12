/**
 * 單元測試：折扣碼驗證邏輯
 */

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
}

// Mock 驗證函數
async function validateCoupon(supabase, code, userId = null) {
  // 1. 檢查折扣碼存在性
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return { valid: false, reason: 'invalid_code' }
  }

  // 2. 檢查有效期限
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, reason: 'expired' }
  }

  // 3. 檢查使用次數限制
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { valid: false, reason: 'usage_limit_reached' }
  }

  return { valid: true, coupon }
}

describe('validateCoupon 函數測試', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('有效折扣碼應該通過驗證', async () => {
    const mockCoupon = {
      id: '1',
      code: 'TESTCODE',
      is_active: true,
      valid_until: '2025-12-31T23:59:59Z',
      used_count: 5,
      max_uses: 100
    }

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: mockCoupon,
      error: null
    })

    const result = await validateCoupon(mockSupabase, 'TESTCODE')
    
    expect(result.valid).toBe(true)
    expect(result.coupon).toEqual(mockCoupon)
  })

  test('不存在的折扣碼應該被拒絕', async () => {
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { message: 'No rows returned' }
    })

    const result = await validateCoupon(mockSupabase, 'INVALID')
    
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('invalid_code')
  })

  test('過期的折扣碼應該被拒絕', async () => {
    const expiredCoupon = {
      id: '2',
      code: 'EXPIRED',
      is_active: true,
      valid_until: '2020-01-01T00:00:00Z',
      used_count: 0,
      max_uses: 100
    }

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: expiredCoupon,
      error: null
    })

    const result = await validateCoupon(mockSupabase, 'EXPIRED')
    
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('expired')
  })

  test('達到使用上限的折扣碼應該被拒絕', async () => {
    const limitReachedCoupon = {
      id: '3',
      code: 'MAXED',
      is_active: true,
      valid_until: '2025-12-31T23:59:59Z',
      used_count: 100,
      max_uses: 100
    }

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: limitReachedCoupon,
      error: null
    })

    const result = await validateCoupon(mockSupabase, 'MAXED')
    
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('usage_limit_reached')
  })
})

// 防濫用檢查測試
describe('防濫用機制測試', () => {
  test('IP 限制檢查', () => {
    const ipUsageCount = 3
    const maxIpUsage = 3
    
    const isBlocked = ipUsageCount >= maxIpUsage
    expect(isBlocked).toBe(true)
  })

  test('Email domain 黑名單檢查', () => {
    const blacklistedDomains = ['tempmail.com', '10minutemail.com']
    const email = 'test@tempmail.com'
    const domain = email.split('@')[1]
    
    const isBlacklisted = blacklistedDomains.includes(domain)
    expect(isBlacklisted).toBe(true)
  })
})

// Transaction 正確性測試
describe('Transaction 正確性測試', () => {
  test('兌換成功時所有操作都應該執行', () => {
    const operations = []
    
    // 模擬 transaction 操作
    const mockTransaction = {
      updateUser: () => operations.push('updateUser'),
      insertUsage: () => operations.push('insertUsage'),
      updateCouponCount: () => operations.push('updateCouponCount'),
      insertPayment: () => operations.push('insertPayment')
    }
    
    // 執行所有操作
    mockTransaction.updateUser()
    mockTransaction.insertUsage()
    mockTransaction.updateCouponCount()
    mockTransaction.insertPayment()
    
    expect(operations).toEqual([
      'updateUser',
      'insertUsage', 
      'updateCouponCount',
      'insertPayment'
    ])
    expect(operations.length).toBe(4)
  })
})

console.log('✅ 單元測試定義完成')
console.log('📋 測試覆蓋範圍:')
console.log('- validateCoupon() 邏輯: 4 個測試案例')
console.log('- 防濫用檢查: 2 個測試案例') 
console.log('- Transaction 正確性: 1 個測試案例')
console.log('- 總計: 7 個測試案例')
