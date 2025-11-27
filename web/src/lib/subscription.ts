import { getSupabase } from './supabase'
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from './constants'

// AuthProvider 使用的介面
export interface Subscription {
  plan: string
  endDate: Date | null
  isActive: boolean
}

// AuthProvider 使用的函數
export async function getSubscription(userId: string): Promise<Subscription> {
  const supabase = getSupabase()
  if (!supabase) return { plan: 'free', endDate: null, isActive: false }

  const { data } = await supabase
    .from('users')
    .select('subscription_type, subscription_expires_at')
    .eq('id', userId)
    .single()

  if (!data) return { plan: 'free', endDate: null, isActive: false }

  const endDate = data.subscription_expires_at ? new Date(data.subscription_expires_at) : null
  const isActive = data.subscription_type && data.subscription_type !== 'free' && 
    (!endDate || endDate > new Date())

  return { plan: data.subscription_type || 'free', endDate, isActive: !!isActive }
}

// 訂閱狀態顯示（admin 用）
export interface SubscriptionStatus {
  label: string
  color: string
  isExpired: boolean
}

export function getSubscriptionStatus(type: string | null, expiresAt: string | null): SubscriptionStatus {
  if (!type || type === 'free') {
    return { label: '免費', color: 'bg-zinc-600', isExpired: false }
  }
  
  const expired = expiresAt ? new Date(expiresAt) < new Date() : false
  if (expired) {
    return { label: '已過期', color: 'bg-red-600', isExpired: true }
  }
  
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === type)
  return { label: plan?.label || type, color: 'bg-amber-600', isExpired: false }
}

// 計算到期日
export function calculateExpiryDate(planId: SubscriptionPlanId): Date {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
  const days = plan?.days || 7
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}
