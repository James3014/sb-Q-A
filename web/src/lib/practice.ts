'use client'

import { trackEvent } from './analytics'
import { getClientOrThrow, getSessionOrThrow, logSupabaseError, SupabaseAuthError, SupabaseConfigError } from './supabaseClient'

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
  try {
    const supabase = getClientOrThrow('Practice.getPracticeLogs')
    const { data, error } = await supabase
      .from('practice_logs')
      .select('id, lesson_id, note, rating, rating1, rating2, rating3, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data as PracticeLog[]) || []
  } catch (error) {
    logSupabaseError('Practice.getPracticeLogs', error)
    return []
  }
}

export async function getLessonPracticeLogs(userId: string, lessonId: string): Promise<PracticeLog[]> {
  try {
    const supabase = getClientOrThrow('Practice.getLessonPracticeLogs')
    const { data, error } = await supabase
      .from('practice_logs')
      .select('id, lesson_id, note, rating, rating1, rating2, rating3, created_at')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) throw error
    return (data as PracticeLog[]) || []
  } catch (error) {
    logSupabaseError('Practice.getLessonPracticeLogs', error)
    return []
  }
}

export async function addPracticeLog(
  userId: string, 
  lessonId: string, 
  note: string,
  ratings?: PracticeRatings
): Promise<{ success: boolean; error?: string }> {
  try {
    const { client } = await getSessionOrThrow('Practice.addPracticeLog')

    const avgRating = ratings 
      ? Math.round((ratings.rating1 + ratings.rating2 + ratings.rating3) / 3)
      : null
    
    const { error } = await client
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
    
    if (error) throw error
    
    // 發送事件到 analytics（會同步到 user-core）
    trackEvent('practice_complete', lessonId, {
      rating: avgRating || 3,  // 傳送評分，如果沒有則預設 3
      note: note,
    })
    
    return { success: true }
  } catch (error) {
    if (error instanceof SupabaseConfigError || error instanceof SupabaseAuthError) {
      return { success: false, error: error.message }
    }
    logSupabaseError('Practice.addPracticeLog', error)
    return { success: false, error: error instanceof Error ? error.message : '未知錯誤' }
  }
}
