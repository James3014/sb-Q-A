describe('CouponBanner Component Logic', () => {
  test('should determine banner visibility', () => {
    const shouldShowBanner = (user: any, couponCode: string | null) => {
      // 沒有折扣碼參數時不顯示
      if (!couponCode) return false
      
      // 已有付費訂閱時不顯示
      if (user?.subscription_type && user.subscription_type !== 'free') return false
      
      // 已使用過試用時不顯示
      if (user?.trial_used_at) return false
      
      return true
    }
    
    const freeUser = { subscription_type: 'free', trial_used_at: null }
    const paidUser = { subscription_type: 'pass_7', trial_used_at: null }
    const trialUsedUser = { subscription_type: 'free', trial_used_at: '2025-01-01' }
    
    expect(shouldShowBanner(freeUser, 'TRIAL2025')).toBe(true)
    expect(shouldShowBanner(freeUser, null)).toBe(false)
    expect(shouldShowBanner(paidUser, 'TRIAL2025')).toBe(false)
    expect(shouldShowBanner(trialUsedUser, 'TRIAL2025')).toBe(false)
  })

  test('should format coupon display text', () => {
    const formatCouponText = (couponCode: string, trialDays: number) => {
      return `使用折扣碼 ${couponCode} 免費體驗 ${trialDays} 天`
    }
    
    expect(formatCouponText('TRIAL2025', 7)).toBe('使用折扣碼 TRIAL2025 免費體驗 7 天')
    expect(formatCouponText('WELCOME', 14)).toBe('使用折扣碼 WELCOME 免費體驗 14 天')
  })

  test('should handle banner states', () => {
    const bannerStates = {
      LOADING: 'loading',
      VALID: 'valid',
      INVALID: 'invalid',
      REDEEMED: 'redeemed',
      ERROR: 'error'
    }
    
    const getBannerMessage = (state: string, couponCode?: string) => {
      switch (state) {
        case bannerStates.LOADING:
          return '驗證折扣碼中...'
        case bannerStates.VALID:
          return `折扣碼 ${couponCode} 可以使用`
        case bannerStates.INVALID:
          return '折扣碼無效或已過期'
        case bannerStates.REDEEMED:
          return '試用已成功啟用！'
        case bannerStates.ERROR:
          return '發生錯誤，請稍後再試'
        default:
          return ''
      }
    }
    
    expect(getBannerMessage(bannerStates.LOADING)).toBe('驗證折扣碼中...')
    expect(getBannerMessage(bannerStates.VALID, 'TRIAL2025')).toBe('折扣碼 TRIAL2025 可以使用')
    expect(getBannerMessage(bannerStates.INVALID)).toBe('折扣碼無效或已過期')
  })

  test('should validate coupon code input', () => {
    const validateCouponInput = (input: string) => {
      const cleaned = input.toUpperCase().trim()
      
      if (cleaned.length < 3) return { valid: false, message: '折扣碼至少需要 3 個字符' }
      if (cleaned.length > 20) return { valid: false, message: '折扣碼不能超過 20 個字符' }
      if (!/^[A-Z0-9]+$/.test(cleaned)) return { valid: false, message: '折扣碼只能包含字母和數字' }
      
      return { valid: true, cleaned }
    }
    
    expect(validateCouponInput('trial2025')).toEqual({ valid: true, cleaned: 'TRIAL2025' })
    expect(validateCouponInput(' TEST123 ')).toEqual({ valid: true, cleaned: 'TEST123' })
    expect(validateCouponInput('ab')).toEqual({ valid: false, message: '折扣碼至少需要 3 個字符' })
    expect(validateCouponInput('test-123')).toEqual({ valid: false, message: '折扣碼只能包含字母和數字' })
  })
})
