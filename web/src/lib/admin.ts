import { getSupabase } from './supabase'

// 管理員 email 列表
const ADMIN_EMAILS = ['james@example.com'] // 改成你的 email

export function isAdmin(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email)
}

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

export async function getAllFeedback() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

export async function getLessonStats() {
  const supabase = getSupabase()
  if (!supabase) return []

  // 取得所有課程的統計
  const { data: lessons } = await supabase.from('lessons').select('id, title, is_premium')
  const { data: views } = await supabase
    .from('event_log')
    .select('lesson_id')
    .eq('event_type', 'view_lesson')
  const { data: practices } = await supabase
    .from('event_log')
    .select('lesson_id')
    .eq('event_type', 'practice_complete')
  const { data: favorites } = await supabase
    .from('event_log')
    .select('lesson_id')
    .eq('event_type', 'favorite_add')

  if (!lessons) return []

  // 計算每堂課的統計
  const viewCount = (views || []).reduce((acc, v) => {
    acc[v.lesson_id] = (acc[v.lesson_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const practiceCount = (practices || []).reduce((acc, p) => {
    acc[p.lesson_id] = (acc[p.lesson_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const favoriteCount = (favorites || []).reduce((acc, f) => {
    acc[f.lesson_id] = (acc[f.lesson_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return lessons.map(l => ({
    ...l,
    views: viewCount[l.id] || 0,
    practices: practiceCount[l.id] || 0,
    favorites: favoriteCount[l.id] || 0,
  })).sort((a, b) => b.views - a.views)
}
