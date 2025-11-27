'use client'

import { getSupabase } from './supabase'
import { trackEvent } from './analytics'

export interface PracticeLog {
  id: string
  lesson_id: string
  note: string
  rating: number | null
  rating1: number | null
  rating2: number | null
  rating3: number | null
  created_at: string
}

export interface PracticeRatings {
  rating1: number  // 技術理解
  rating2: number  // 動作成功度
  rating3: number  // 穩定度
}

export function getAvgRating(log: PracticeLog): number | null {
  if (log.rating1 && log.rating2 && log.rating3) {
    return Math.round((log.rating1 + log.rating2 + log.rating3) / 3 * 10) / 10
  }
  return log.rating
}

export async function getPracticeLogs(userId: string): Promise<PracticeLog[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('practice_logs')
    .select('id, lesson_id, note, rating, rating1, rating2, rating3, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[Practice] getPracticeLogs error:', error.message)
    return []
  }
  
  return (data as PracticeLog[]) || []
}

export async function getLessonPracticeLogs(userId: string, lessonId: string): Promise<PracticeLog[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('practice_logs')
    .select('id, lesson_id, note, rating, rating1, rating2, rating3, created_at')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (error) {
    console.error('[Practice] getLessonPracticeLogs error:', error.message)
    return []
  }
  
  return (data as PracticeLog[]) || []
}

export async function addPracticeLog(
  userId: string, 
  lessonId: string, 
  note: string,
  ratings?: PracticeRatings
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase 未設定' }
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, error: '請先登入' }
  }

  const avgRating = ratings 
    ? Math.round((ratings.rating1 + ratings.rating2 + ratings.rating3) / 3 * 10) / 10
    : null
  
  const { error } = await supabase
    .from('practice_logs')
    .insert({ 
      user_id: userId, 
      lesson_id: lessonId, 
      note,
      rating: avgRating,
      rating1: ratings?.rating1 || null,
      rating2: ratings?.rating2 || null,
      rating3: ratings?.rating3 || null,
    })
  
  if (error) {
    console.error('[Practice] addPracticeLog error:', error.message)
    return { success: false, error: error.message }
  }
  
  trackEvent('practice_complete', lessonId)
  return { success: true }
}
