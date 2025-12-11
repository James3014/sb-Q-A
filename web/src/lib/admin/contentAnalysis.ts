import { getSupabase } from '../supabase'

/** 內容缺口：搜尋無結果 TOP 10 */
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

/** 課程來源分析 */
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
