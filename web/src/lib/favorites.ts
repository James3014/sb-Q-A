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

export async function toggleFavorite(userId: string, lessonId: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false
  
  // 先嘗試刪除
  const { data: deleted } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .select()
  
  // 如果刪除了資料，表示原本是收藏狀態，現在取消了
  if (deleted && deleted.length > 0) {
    return false // 現在未收藏
  }
  
  // 沒刪到東西，表示原本沒收藏，新增收藏
  await supabase
    .from('favorites')
    .insert({ user_id: userId, lesson_id: lessonId })
  
  return true // 現在已收藏
}

export async function isFavorited(userId: string, lessonId: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false
  
  const { data } = await supabase
    .from('favorites')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
  
  return (data && data.length > 0) || false
}
