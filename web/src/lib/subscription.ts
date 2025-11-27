import { getSupabase } from './supabase'

export type SubscriptionType = 'free' | 'pass_7' | 'pass_30' | 'pro_yearly'

export interface Subscription {
  type: SubscriptionType
  expiresAt: Date | null
  isActive: boolean
}

export async function getSubscription(userId: string): Promise<Subscription> {
  const supabase = getSupabase()
  if (!supabase) return { type: 'free', expiresAt: null, isActive: false }

  const { data } = await supabase
    .from('users')
    .select('subscription_type, subscription_expires_at')
    .eq('id', userId)
    .single()

  if (!data) return { type: 'free', expiresAt: null, isActive: false }

  const type = (data.subscription_type || 'free') as SubscriptionType
  const expiresAt = data.subscription_expires_at ? new Date(data.subscription_expires_at) : null
  
  // 檢查是否有效
  const isActive = type !== 'free' && (!expiresAt || expiresAt > new Date())

  return { type, expiresAt, isActive }
}
