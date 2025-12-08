'use client'

import { trackEvent } from './analytics'
import { getClientOrThrow, getSessionOrThrow, logSupabaseError, SupabaseAuthError, SupabaseConfigError } from './supabaseClient'

export async function getFavorites(userId: string): Promise<string[]> {
  try {
    const supabase = getClientOrThrow('Favorites.getFavorites')
    const { data, error } = await supabase
      .from('favorites')
      .select('lesson_id')
      .eq('user_id', userId)
    
    if (error) throw error
    return data?.map((f: { lesson_id: string }) => f.lesson_id) || []
  } catch (error) {
    logSupabaseError('Favorites.getFavorites', error)
    return []
  }
}

export async function isFavorited(userId: string, lessonId: string): Promise<boolean> {
  try {
    const supabase = getClientOrThrow('Favorites.isFavorited')
    const { data, error } = await supabase
      .from('favorites')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
    
    if (error) throw error
    return !!(data && data.length > 0)
  } catch (error) {
    logSupabaseError('Favorites.isFavorited', error)
    return false
  }
}

export async function addFavorite(userId: string, lessonId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { client } = await getSessionOrThrow('Favorites.addFavorite')

    const { error } = await client
      .from('favorites')
      .insert({ user_id: userId, lesson_id: lessonId })
    
    if (error) {
      // 唯一鍵衝突視為成功，避免重複報錯
      if ((error as any).code === '23505') return { success: true }
      throw error
    }
    
    trackEvent('favorite_add', lessonId)
    return { success: true }
  } catch (error) {
    if (error instanceof SupabaseConfigError || error instanceof SupabaseAuthError) {
      return { success: false, error: error.message }
    }
    logSupabaseError('Favorites.addFavorite', error)
    return { success: false, error: error instanceof Error ? error.message : '未知錯誤' }
  }
}

export async function removeFavorite(userId: string, lessonId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { client } = await getSessionOrThrow('Favorites.removeFavorite')

    const { error } = await client
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
    
    if (error) throw error
    
    trackEvent('favorite_remove', lessonId)
    return { success: true }
  } catch (error) {
    if (error instanceof SupabaseConfigError || error instanceof SupabaseAuthError) {
      return { success: false, error: error.message }
    }
    logSupabaseError('Favorites.removeFavorite', error)
    return { success: false, error: error instanceof Error ? error.message : '未知錯誤' }
  }
}
