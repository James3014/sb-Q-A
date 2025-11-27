import { getSupabase } from './supabase'

export type PlanType = 'free' | '7day' | '30day' | 'year'

export interface Subscription {
  plan: PlanType
  endDate: Date | null
  isActive: boolean
}

export async function getSubscription(userId: string): Promise<Subscription> {
  const supabase = getSupabase()
  if (!supabase) return { plan: 'free', endDate: null, isActive: false }

  // 使用新的 subscriptions 表
  const { data } = await supabase
    .rpc('get_user_subscription', { p_user_id: userId })

  if (!data || data.length === 0) {
    return { plan: 'free', endDate: null, isActive: false }
  }

  const { plan, end_date } = data[0]
  const endDate = end_date ? new Date(end_date) : null
  const isActive = endDate ? endDate > new Date() : false

  return { plan: plan as PlanType, endDate, isActive }
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { data } = await supabase.rpc('has_active_subscription', { p_user_id: userId })
  return data === true
}
