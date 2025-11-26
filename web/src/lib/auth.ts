'use client'

import { createClient } from './supabase'
import { User } from '@supabase/supabase-js'

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  if (!supabase) return { user: null, error: { message: 'Supabase not configured' } }
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient()
  if (!supabase) return { user: null, error: { message: 'Supabase not configured' } }
  
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data.user, error }
}

export async function signOut() {
  const supabase = createClient()
  if (!supabase) return { error: null }
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser(): Promise<User | null> {
  const supabase = createClient()
  if (!supabase) return null
  
  const { data } = await supabase.auth.getUser()
  return data.user
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = createClient()
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
  
  return supabase.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
    callback(session?.user ?? null)
  })
}
