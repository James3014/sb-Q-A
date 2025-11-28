'use client'

import { getSupabase } from './supabase'
import { trackEvent } from './analytics'

export async function getFavorites(userId: string): Promise<string[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('favorites')
    .select('lesson_id')
    .eq('user_id', userId)
  
  if (error) {
    console.error('[Favorites] getFavorites error:', error.message)
    return []
  }
  
  return data?.map((f: { lesson_id: string }) => f.lesson_id) || []
}

export async function isFavorited(userId: string, lessonId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  
  const { data, error } = await supabase
    .from('favorites')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
  
  if (error) {
    console.error('[Favorites] isFavorited error:', error.message)
    return false
  }
  
  return data && data.length > 0
}

export async function addFavorite(userId: string, lessonId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase 未設定' }
  
  // 檢查 session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.error('[Favorites] addFavorite: no session')
    return { success: false, error: '請先登入' }
  }
  
  
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, lesson_id: lessonId })
  
  if (error) {
    console.error('[Favorites] addFavorite error:', error.message, error.code)
    if (error.code === '23505') return { success: true } // 已存在，視為成功
    return { success: false, error: error.message }
  }
  
  trackEvent('favorite_add', lessonId)
  return { success: true }
}

export async function removeFavorite(userId: string, lessonId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase 未設定' }
  
  // 檢查 session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.error('[Favorites] removeFavorite: no session')
    return { success: false, error: '請先登入' }
  }
  
  
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
  
  if (error) {
    console.error('[Favorites] removeFavorite error:', error.message)
    return { success: false, error: error.message }
  }
  
  trackEvent('favorite_remove', lessonId)
  return { success: true }
}
