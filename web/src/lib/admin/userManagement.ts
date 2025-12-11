import { getSupabase } from '../supabase'

/** 搜尋用戶 */
export async function searchUsers(query: string) {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('users')
    .select('id, email, created_at, is_admin')
    .ilike('email', `%${query}%`)
    .limit(20)

  return data || []
}

/** 開通訂閱 */
export async function grantSubscription(userId: string, plan: string, days: number) {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('admin_grant_subscription', {
    p_user_id: userId,
    p_plan: plan,
    p_days: days,
  })

  if (error) throw error
  return data
}

/** 取得用戶訂閱歷史 */
export async function getUserSubscriptions(userId: string) {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return data || []
}
