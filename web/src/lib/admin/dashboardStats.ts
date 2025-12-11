import { getSupabase } from '../supabase'

/** 後台 Dashboard 統計 */
export async function getDashboardStats() {
  const supabase = getSupabase()
  if (!supabase) return null

  const [dau, wau, topLessons, subscriptions, feedback, keywords] = await Promise.all([
    supabase.rpc('get_dau'),
    supabase.rpc('get_wau'),
    supabase.rpc('get_top_lessons', { p_limit: 10 }),
    supabase.rpc('get_subscription_stats'),
    supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.rpc('get_top_keywords', { p_limit: 10 }),
  ])

  return {
    dau: dau.data || 0,
    wau: wau.data || 0,
    topLessons: topLessons.data || [],
    subscriptions: subscriptions.data || [],
    recentFeedback: feedback.data || [],
    topKeywords: keywords.data || [],
  }
}

/** 取得所有回報 */
export async function getAllFeedback() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}
