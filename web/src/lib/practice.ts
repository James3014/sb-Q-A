'use client'

import { getSupabase } from './supabase'

export interface PracticeLog {
  id: string
  lesson_id: string
  note: string
  created_at: string
}

export async function getPracticeLogs(userId: string): Promise<PracticeLog[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('practice_logs')
    .select('id, lesson_id, note, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[Practice] getPracticeLogs error:', error.message)
    return []
  }
  
  return (data as PracticeLog[]) || []
}

export async function addPracticeLog(userId: string, lessonId: string, note: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase 未設定' }
  
  // 檢查 session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.error('[Practice] addPracticeLog: no session')
    return { success: false, error: '請先登入' }
  }
  
  console.log('[Practice] addPracticeLog:', { userId, lessonId, note: note.slice(0, 20) })
  
  const { error } = await supabase
    .from('practice_logs')
    .insert({ user_id: userId, lesson_id: lessonId, note })
  
  if (error) {
    console.error('[Practice] addPracticeLog error:', error.message)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}
