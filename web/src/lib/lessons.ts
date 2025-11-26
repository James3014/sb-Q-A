import { getSupabase } from './supabase'

export interface Lesson {
  id: string
  title: string
  level_tags: string[]
  slope_tags: string[]
  what: string
  why: string[]
  how: { text: string; image?: string | null }[]
  signals: { correct: string[]; wrong: string[] }
  casi: { Primary_Skill?: string | null; Core_Competency?: string | null }
  is_premium?: boolean
}

export async function getLessons(): Promise<Lesson[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('id')

  if (error) {
    console.error('[getLessons]', error)
    return []
  }

  return data || []
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getLessonById]', error)
    return null
  }

  return data
}

export async function searchLessons(query: string): Promise<Lesson[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const q = `%${query}%`
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .or(`title.ilike.${q},what.ilike.${q}`)
    .order('id')

  if (error) {
    console.error('[searchLessons]', error)
    return []
  }

  return data || []
}
