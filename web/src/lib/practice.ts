'use client'

import { getSupabase } from './supabase'
import { trackEvent } from './analytics'

export interface PracticeLog {
  id: string
  lesson_id: string
  note: string
  rating: number | null
  created_at: string
}

export async function getPracticeLogs(userId: string): Promise<PracticeLog[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('practice_logs')
    .select('id, lesson_id, note, rating, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[Practice] getPracticeLogs error:', error.message)
    return []
  }
  
  return (data as PracticeLog[]) || []
}

export async function addPracticeLog(
  userId: string, 
  lessonId: string, 
  note: string,
  rating?: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase 未設定' }
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, error: '請先登入' }
  }
  
  const { error } = await supabase
    .from('practice_logs')
    .insert({ user_id: userId, lesson_id: lessonId, note, rating: rating || null })
  
  if (error) {
    console.error('[Practice] addPracticeLog error:', error.message)
    return { success: false, error: error.message }
  }
  
  trackEvent('practice_complete', lessonId)
  return { success: true }
}
