describe('Coupon Anti-Abuse', () => {
  test('should detect rate limiting by IP', () => {
    const mockAttempts = [
      { ip: '192.168.1.1', timestamp: Date.now() },
      { ip: '192.168.1.1', timestamp: Date.now() - 1000 },
      { ip: '192.168.1.1', timestamp: Date.now() - 2000 },
      { ip: '192.168.1.1', timestamp: Date.now() - 3000 },
      { ip: '192.168.1.1', timestamp: Date.now() - 4000 }
    ]
    
    const checkRateLimit = (ip: string, attempts: any[], maxAttempts = 3, windowMs = 60000) => {
      const recentAttempts = attempts.filter(
        attempt => attempt.ip === ip && 
        Date.now() - attempt.timestamp < windowMs
      )
      return recentAttempts.length >= maxAttempts
    }
    
    expect(checkRateLimit('192.168.1.1', mockAttempts)).toBe(true)
    expect(checkRateLimit('192.168.1.2', mockAttempts)).toBe(false)
  })

  test('should detect duplicate email usage', () => {
    const mockUsages = [
      { email: 'test@example.com', coupon_code: 'TRIAL2025' },
      { email: 'user@example.com', coupon_code: 'WELCOME' }
    ]
    
    const checkEmailUsage = (email: string, couponCode: string, usages: any[]) => {
      return usages.some(usage => 
        usage.email === email && usage.coupon_code === couponCode
      )
    }
    
    expect(checkEmailUsage('test@example.com', 'TRIAL2025', mockUsages)).toBe(true)
    expect(checkEmailUsage('test@example.com', 'WELCOME', mockUsages)).toBe(false)
    expect(checkEmailUsage('new@example.com', 'TRIAL2025', mockUsages)).toBe(false)
  })

  test('should validate trial eligibility', () => {
    const checkTrialEligibility = (user: any) => {
      // 已有付費訂閱的用戶不能使用試用
      if (user.subscription_type && user.subscription_type !== 'free') {
        return false
      }
      
      // 已經使用過試用的用戶不能再次使用
      if (user.trial_used_at) {
        return false
      }
      
      return true
    }
    
    const freeUser = { subscription_type: 'free', trial_used_at: null }
    const paidUser = { subscription_type: 'pass_7', trial_used_at: null }
    const trialUsedUser = { subscription_type: 'free', trial_used_at: '2025-01-01' }
    
    expect(checkTrialEligibility(freeUser)).toBe(true)
    expect(checkTrialEligibility(paidUser)).toBe(false)
    expect(checkTrialEligibility(trialUsedUser)).toBe(false)
  })

  test('should calculate trial expiry correctly', () => {
    const calculateTrialExpiry = (trialDays: number) => {
      return new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
    }
    
    const sevenDayTrial = calculateTrialExpiry(7)
    const now = new Date()
    
    expect(sevenDayTrial.getTime()).toBeGreaterThan(now.getTime() + 6 * 24 * 60 * 60 * 1000)
    expect(sevenDayTrial.getTime()).toBeLessThan(now.getTime() + 8 * 24 * 60 * 60 * 1000)
  })
})
