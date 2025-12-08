import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

export async function GET(req: NextRequest) {
  const { supabase, error } = await authorizeAdmin(req)
  if (error) return error

  const [dau, wau, topLessons, subscriptions, feedback, keywords, contentGapsRaw, lessonSourcesRaw] = await Promise.all([
    supabase.rpc('get_dau'),
    supabase.rpc('get_wau'),
    supabase.rpc('get_top_lessons', { p_limit: 10 }),
    supabase.rpc('get_subscription_stats'),
    supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.rpc('get_top_keywords', { p_limit: 10 }),
    supabase
      .from('event_log')
      .select('metadata')
      .eq('event_type', 'search_no_result')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('event_log')
      .select('metadata')
      .eq('event_type', 'view_lesson')
      .order('created_at', { ascending: false })
      .limit(1000),
  ])

  const contentGaps = (() => {
    if (!contentGapsRaw.data) return []
    const counts: Record<string, number> = {}
    contentGapsRaw.data.forEach(row => {
      const keyword = (row.metadata as { keyword?: string })?.keyword
      if (keyword) counts[keyword] = (counts[keyword] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))
  })()

  const lessonSources = (() => {
    if (!lessonSourcesRaw.data) return []
    const counts: Record<string, number> = {}
    lessonSourcesRaw.data.forEach(row => {
      const from = (row.metadata as { from?: string })?.from || 'unknown'
      counts[from] = (counts[from] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }))
  })()

  return NextResponse.json({
    dau: dau.data || 0,
    wau: wau.data || 0,
    topLessons: topLessons.data || [],
    subscriptions: subscriptions.data || [],
    recentFeedback: feedback.data || [],
    topKeywords: keywords.data || [],
    contentGaps,
    lessonSources,
  })
}
