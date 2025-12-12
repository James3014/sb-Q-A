import { getSupabase } from '@/lib/supabase'

interface TrialSecurityCheck {
  allowed: boolean
  reason?: string
}

export const checkTrialSecurity = async (
  userId: string, 
  email: string, 
  clientIP?: string
): Promise<TrialSecurityCheck> => {
  const supabase = getSupabase()
  
  if (!supabase) {
    return { allowed: false, reason: 'Service not available' }
  }

  try {
    // 1. 檢查用戶是否已試用
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('trial_used, subscription_type, subscription_expires_at, created_at')
      .eq('id', userId)
      .single()

    if (userError) {
      return { allowed: false, reason: '無法驗證用戶狀態' }
    }

    if (user.trial_used) {
      return { allowed: false, reason: '您已經使用過免費試用' }
    }

    // 2. 檢查是否已有付費訂閱
    const hasActiveSubscription = user.subscription_type && 
      user.subscription_type !== 'free' &&
      user.subscription_expires_at &&
      new Date(user.subscription_expires_at) > new Date()

    if (hasActiveSubscription) {
      return { allowed: false, reason: '您已經是付費用戶' }
    }

    // 3. 檢查同一 Email 域名的試用次數（防止 +1 濫用）
    const emailDomain = email.split('@')[1]
    const baseEmail = email.split('+')[0] + '@' + emailDomain

    const { count: domainTrialCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('trial_used', true)
      .ilike('email', `${baseEmail.split('@')[0]}%@${emailDomain}`)

    if ((domainTrialCount || 0) >= 3) {
      return { 
        allowed: false, 
        reason: '此 Email 域名已達試用次數上限，請聯繫客服' 
      }
    }

    // 4. 檢查 IP 試用次數（如果有 IP 資訊）
    if (clientIP) {
      // 記錄試用 IP（簡化版，實際應該用專門的表）
      const { count: ipTrialCount } = await supabase
        .from('event_log')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'trial_activated')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7天內
        .contains('metadata', { client_ip: clientIP })

      if ((ipTrialCount || 0) >= 5) {
        return { 
          allowed: false, 
          reason: '此 IP 地址試用次數過多，請稍後再試' 
        }
      }
    }

    // 5. 檢查帳號建立時間（防止批量註冊）
    const accountAge = Date.now() - new Date(user.created_at).getTime()
    const minAccountAge = 5 * 60 * 1000 // 5分鐘

    if (accountAge < minAccountAge) {
      return { 
        allowed: false, 
        reason: '帳號建立時間過短，請稍後再試' 
      }
    }

    return { allowed: true }

  } catch (error) {
    console.error('Trial security check failed:', error)
    return { allowed: false, reason: '安全檢查失敗，請稍後再試' }
  }
}

export const logTrialActivation = async (
  userId: string, 
  referralCode?: string, 
  clientIP?: string
) => {
  const supabase = getSupabase()
  
  if (!supabase) {
    console.error('Supabase client not available for logging')
    return
  }

  try {
    await supabase
      .from('event_log')
      .insert({
        user_id: userId,
        event_type: 'trial_activated',
        metadata: {
          referral_code: referralCode || null,
          client_ip: clientIP || null,
          timestamp: new Date().toISOString()
        }
      })
  } catch (error) {
    console.error('Failed to log trial activation:', error)
  }
}
