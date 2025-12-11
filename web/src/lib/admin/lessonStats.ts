import { getSupabase } from '../supabase'

/** 課程統計（瀏覽、練習、收藏次數） */
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

/** 課程有效度排行 */
export async function getLessonEffectiveness() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase.rpc('get_lesson_effectiveness')
  return data || []
}

/** 課程健康度（滾動深度 + 練習完成率） */
export async function getLessonHealth() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data: scrollData } = await supabase
    .from('event_log')
    .select('lesson_id, metadata')
    .eq('event_type', 'scroll_depth')

  const { data: startData } = await supabase
    .from('event_log')
    .select('lesson_id')
    .eq('event_type', 'practice_start')

  const { data: completeData } = await supabase
    .from('event_log')
    .select('lesson_id')
    .eq('event_type', 'practice_complete')

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

  return Object.entries(stats)
    .map(([lesson_id, s]) => {
      const scrollRate = s.scrollTotal > 0 ? (s.scroll100 / s.scrollTotal) * 100 : 0
      const practiceRate = s.starts > 0 ? (s.completes / s.starts) * 100 : 0
      const healthScore = (scrollRate * 0.4 + practiceRate * 0.6)
      return { lesson_id, scrollRate, practiceRate, healthScore, samples: s.scrollTotal + s.starts }
    })
    .filter(x => x.samples >= 3)
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 10)
}
