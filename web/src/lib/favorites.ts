import { createClient } from './supabase'

export async function getFavorites(userId: string): Promise<string[]> {
  const supabase = createClient()
  if (!supabase) return []
  
  const { data } = await supabase
    .from('favorites')
    .select('lesson_id')
    .eq('user_id', userId)
  
  return data?.map((f: { lesson_id: string }) => f.lesson_id) || []
}

export async function isFavorited(userId: string, lessonId: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false
  
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single()
  
  return !!data
}

export async function addFavorite(userId: string, lessonId: string) {
  const supabase = createClient()
  if (!supabase) return { error: 'Not configured' }
  
  // 先檢查是否已存在
  const exists = await isFavorited(userId, lessonId)
  if (exists) return { error: null } // 已存在，不需要再加
  
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, lesson_id: lessonId })
  
  return { error }
}

export async function removeFavorite(userId: string, lessonId: string) {
  const supabase = createClient()
  if (!supabase) return { error: 'Not configured' }
  
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
  
  return { error }
}
