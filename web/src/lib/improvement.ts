import { getSupabase } from './supabase'

export interface ImprovementData {
  improvement: number
  scores: { date: string; score: number; lesson_id: string }[]
  skills: { skill: string; score: number; count: number }[]
  trend: { date: string; count: number }[]
  totalPractices: number
}

export async function getImprovementData(userId: string): Promise<ImprovementData | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const [improvement, scores, skills, trend] = await Promise.all([
    supabase.rpc('get_improvement_score', { p_user_id: userId }),
    supabase.rpc('get_practice_scores', { p_user_id: userId }),
    supabase.rpc('get_skill_radar', { p_user_id: userId }),
    supabase.rpc('get_practice_trend', { p_user_id: userId, p_days: 30 }),
  ])

  return {
    improvement: improvement.data || 0,
    scores: scores.data || [],
    skills: skills.data || [],
    trend: trend.data || [],
    totalPractices: scores.data?.length || 0,
  }
}
