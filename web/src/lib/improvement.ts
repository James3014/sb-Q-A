import { getSupabase } from './supabase'

export interface ImprovementData {
  improvement: number
  scores: { date: string; score: number; lesson_id: string }[]
  skills: { skill: string; score: number; count: number }[]
  trend: { date: string; count: number }[]
  recentPractice: { lesson_id: string; title: string; score: number; date: string }[]
  totalPractices: number
}

export async function getImprovementData(userId: string): Promise<ImprovementData | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const [improvement, scores, skills, trend, recent] = await Promise.all([
    supabase.rpc('get_improvement_score', { p_user_id: userId }),
    supabase.rpc('get_practice_scores', { p_user_id: userId }),
    supabase.rpc('get_skill_radar', { p_user_id: userId }),
    supabase.rpc('get_practice_trend', { p_user_id: userId, p_days: 30 }),
    supabase
      .from('practice_logs')
      .select('lesson_id, rating, created_at, lessons(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentPractice = (recent.data || []).map((r: any) => ({
    lesson_id: r.lesson_id,
    title: r.lessons?.title || r.lesson_id,
    score: r.rating || 0,
    date: r.created_at,
  }))

  return {
    improvement: improvement.data || 0,
    scores: scores.data || [],
    skills: skills.data || [],
    trend: trend.data || [],
    recentPractice,
    totalPractices: scores.data?.length || 0,
  }
}
