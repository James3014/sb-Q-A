import { getSupabase } from './supabase'

// 檢查是否為管理員（從資料庫）
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return data?.is_admin === true
}

// 後台 Dashboard 統計
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

// 取得所有回報
export async function getAllFeedback() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

// 課程統計
export async function getLessonStats() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data: lessons } = await supabase.from('lessons').select('id, title, is_premium, level_tags')
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

  const count = (arr: { lesson_id: string }[] | null) =>
    (arr || []).reduce((acc, v) => {
      acc[v.lesson_id] = (acc[v.lesson_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const viewCount = count(views)
  const practiceCount = count(practices)
  const favoriteCount = count(favorites)

  return lessons.map(l => ({
    ...l,
    views: viewCount[l.id] || 0,
    practices: practiceCount[l.id] || 0,
    favorites: favoriteCount[l.id] || 0,
  })).sort((a, b) => b.views - a.views)
}

// 搜尋用戶
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

// 開通訂閱
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

// 取得用戶訂閱歷史
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

// 課程有效度排行
export async function getLessonEffectiveness() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase.rpc('get_lesson_effectiveness')
  return data || []
}

// 內容缺口：搜尋無結果 TOP 10
export async function getContentGaps() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('event_log')
    .select('metadata')
    .eq('event_type', 'search_no_result')
    .order('created_at', { ascending: false })
    .limit(500)

  if (!data) return []

  // 統計關鍵字出現次數
  const counts: Record<string, number> = {}
  data.forEach(row => {
    const keyword = (row.metadata as { keyword?: string })?.keyword
    if (keyword) counts[keyword] = (counts[keyword] || 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }))
}

// 課程來源分析
export async function getLessonSources() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('event_log')
    .select('metadata')
    .eq('event_type', 'view_lesson')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (!data) return []

  const counts: Record<string, number> = {}
  data.forEach(row => {
    const from = (row.metadata as { from?: string })?.from || 'unknown'
    counts[from] = (counts[from] || 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }))
}

// 課程健康度（滾動深度 + 練習完成率）
export async function getLessonHealth() {
  const supabase = getSupabase()
  if (!supabase) return []

  // 取得滾動深度數據
  const { data: scrollData } = await supabase
    .from('event_log')
    .select('lesson_id, metadata')
    .eq('event_type', 'scroll_depth')

  // 取得練習開始/完成數據
  const { data: startData } = await supabase
    .from('event_log')
    .select('lesson_id')
    .eq('event_type', 'practice_start')

  const { data: completeData } = await supabase
    .from('event_log')
    .select('lesson_id')
    .eq('event_type', 'practice_complete')

  // 統計每個課程
  const stats: Record<string, { scroll100: number; scrollTotal: number; starts: number; completes: number }> = {}

  scrollData?.forEach(row => {
    const id = row.lesson_id
    if (!id) return
    if (!stats[id]) stats[id] = { scroll100: 0, scrollTotal: 0, starts: 0, completes: 0 }
    stats[id].scrollTotal++
    if ((row.metadata as { depth?: number })?.depth === 100) stats[id].scroll100++
  })

  startData?.forEach(row => {
    const id = row.lesson_id
    if (!id) return
    if (!stats[id]) stats[id] = { scroll100: 0, scrollTotal: 0, starts: 0, completes: 0 }
    stats[id].starts++
  })

  completeData?.forEach(row => {
    const id = row.lesson_id
    if (!id) return
    if (!stats[id]) stats[id] = { scroll100: 0, scrollTotal: 0, starts: 0, completes: 0 }
    stats[id].completes++
  })

  // 計算健康度分數
  return Object.entries(stats)
    .map(([lesson_id, s]) => {
      const scrollRate = s.scrollTotal > 0 ? (s.scroll100 / s.scrollTotal) * 100 : 0
      const practiceRate = s.starts > 0 ? (s.completes / s.starts) * 100 : 0
      const healthScore = (scrollRate * 0.4 + practiceRate * 0.6) // 加權平均
      return { lesson_id, scrollRate, practiceRate, healthScore, samples: s.scrollTotal + s.starts }
    })
    .filter(x => x.samples >= 3) // 至少 3 筆數據
    .sort((a, b) => a.healthScore - b.healthScore) // 低分在前（需要改善）
    .slice(0, 10)
}
