import { createClient } from './supabase'

export interface PracticeLog {
  id: string
  lesson_id: string
  note: string
  created_at: string
}

export async function getPracticeLogs(userId: string): Promise<PracticeLog[]> {
  const supabase = createClient()
  if (!supabase) return []
  
  const { data } = await supabase
    .from('practice_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return (data as PracticeLog[]) || []
}

export async function addPracticeLog(userId: string, lessonId: string, note: string) {
  const supabase = createClient()
  if (!supabase) return { error: 'Not configured' }
  
  const { error } = await supabase
    .from('practice_logs')
    .insert({ user_id: userId, lesson_id: lessonId, note })
  
  return { error }
}
