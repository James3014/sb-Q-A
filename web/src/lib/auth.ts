'use client'

import { getSupabase } from './supabase'
import { User } from '@supabase/supabase-js'

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabase()
  if (!supabase) return { user: null, error: { message: 'Supabase 未設定' } }
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) console.error('[Auth] signIn error:', error.message)
  return { user: data.user, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabase()
  if (!supabase) return { user: null, error: { message: 'Supabase 未設定' } }
  
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) console.error('[Auth] signUp error:', error.message)
  return { user: data.user, error }
}

export async function signOut() {
  const supabase = getSupabase()
  if (!supabase) return { error: null }
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser(): Promise<User | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getSession() {
  const supabase = getSupabase()
  if (!supabase) return null
  
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = getSupabase()
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
  
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Auth] state changed:', event, session?.user?.email)
    callback(session?.user ?? null)
  })
}
