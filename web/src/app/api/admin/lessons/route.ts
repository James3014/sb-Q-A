import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

type LessonRow = {
  id: string
  title: string
  is_premium: boolean | null
  level_tags: string[] | null
}

export async function GET(req: NextRequest) {
  const { supabase, error } = await authorizeAdmin(req)
  if (error) return error

  const [{ data: lessons }, { data: views }, { data: practices }, { data: favorites }, effectiveness, scrollData, startData, completeData] =
    await Promise.all([
      supabase.from('lessons').select('id, title, is_premium, level_tags').order('id'),
      supabase.from('event_log').select('lesson_id').eq('event_type', 'view_lesson'),
      supabase.from('event_log').select('lesson_id').eq('event_type', 'practice_complete'),
      supabase.from('event_log').select('lesson_id').eq('event_type', 'favorite_add'),
      supabase.rpc('get_lesson_effectiveness'),
      supabase.from('event_log').select('lesson_id, metadata').eq('event_type', 'scroll_depth'),
      supabase.from('event_log').select('lesson_id').eq('event_type', 'practice_start'),
      supabase.from('event_log').select('lesson_id').eq('event_type', 'practice_complete'),
    ])

  const count = (arr: { lesson_id: string }[] | null) =>
    (arr || []).reduce<Record<string, number>>((acc, v) => {
      acc[v.lesson_id] = (acc[v.lesson_id] || 0) + 1
      return acc
    }, {})

  const viewCount = count(views || [])
  const practiceCount = count(practices || [])
  const favoriteCount = count(favorites || [])

  const lessonStats = (lessons || []).map((l: LessonRow) => ({
    id: l.id,
    title: l.title,
    is_premium: !!l.is_premium,
    level_tags: l.level_tags || [],
    views: viewCount[l.id] || 0,
    practices: practiceCount[l.id] || 0,
    favorites: favoriteCount[l.id] || 0,
  }))

  // 健康度計算
  const stats: Record<string, { scroll100: number; scrollTotal: number; starts: number; completes: number }> = {}
  scrollData.data?.forEach(row => {
    const id = row.lesson_id
    if (!id) return
    if (!stats[id]) stats[id] = { scroll100: 0, scrollTotal: 0, starts: 0, completes: 0 }
    stats[id].scrollTotal++
    if ((row.metadata as { depth?: number })?.depth === 100) stats[id].scroll100++
  })
  startData.data?.forEach(row => {
    const id = row.lesson_id
    if (!id) return
    if (!stats[id]) stats[id] = { scroll100: 0, scrollTotal: 0, starts: 0, completes: 0 }
    stats[id].starts++
  })
  completeData.data?.forEach(row => {
    const id = row.lesson_id
    if (!id) return
    if (!stats[id]) stats[id] = { scroll100: 0, scrollTotal: 0, starts: 0, completes: 0 }
    stats[id].completes++
  })

  const lessonHealth = Object.entries(stats)
    .map(([lesson_id, s]) => {
      const scrollRate = s.scrollTotal > 0 ? (s.scroll100 / s.scrollTotal) * 100 : 0
      const practiceRate = s.starts > 0 ? (s.completes / s.starts) * 100 : 0
      const healthScore = scrollRate * 0.4 + practiceRate * 0.6
      return { lesson_id, scrollRate, practiceRate, healthScore, samples: s.scrollTotal + s.starts }
    })
    .filter(x => x.samples >= 3)
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 10)

  return NextResponse.json({
    lessons: lessons || [],
    lessonStats,
    effectiveness: effectiveness.data || [],
    lessonHealth,
  })
}
