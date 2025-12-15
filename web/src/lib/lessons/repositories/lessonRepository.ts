import type { PostgrestError } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'
import { NotFoundError } from '@/types/lessons'
import type { CreateLessonInput, Lesson, UpdateLessonInput } from '@/types/lessons'

const TABLE_NAME = 'lessons'

type SupabaseGetter = typeof getSupabase
let getClient: SupabaseGetter = getSupabase

export function setSupabaseGetter(getter: SupabaseGetter): void {
  getClient = getter
}

export function resetSupabaseGetter(): void {
  getClient = getSupabase
}

export interface LessonFilter {
  isPublished?: boolean
  levelTag?: string
  search?: string
}

function ensureClient() {
  const client = getClient()
  if (!client) {
    throw new Error('Supabase client not initialized')
  }
  return client
}

function unwrapSingle<T>(result: { data: T | null; error: PostgrestError | null }): T {
  if (result.error || !result.data) {
    if (!result.data || result.error?.code === 'PGRST116') {
      throw new NotFoundError('Lesson')
    }
    throw result.error
  }
  return result.data
}

export async function getLessonById(id: string): Promise<Lesson> {
  const client = ensureClient()
  const query = client.from(TABLE_NAME).select('*').eq('id', id).single()
  const result = await query
  return unwrapSingle<Lesson>(result)
}

export async function getAllLessons(filter: LessonFilter = {}): Promise<Lesson[]> {
  const client = ensureClient()
  let query = client
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (typeof filter.isPublished === 'boolean') {
    query = query.eq('is_published', filter.isPublished)
  }

  if (filter.levelTag) {
    query = query.contains('level_tags', [filter.levelTag])
  }

  if (filter.search) {
    const like = `%${filter.search}%`
    query = query.or(`title.ilike.${like},what.ilike.${like}`)
  }

  const { data, error } = await query
  if (error) {
    throw error
  }

  return (data as Lesson[]) || []
}

export async function createLesson(data: CreateLessonInput): Promise<Lesson> {
  const client = ensureClient()
  const result = await client.from(TABLE_NAME).insert(data).select().single()
  return unwrapSingle<Lesson>(result)
}

export async function updateLesson(id: string, data: UpdateLessonInput): Promise<Lesson> {
  const client = ensureClient()
  const result = await client.from(TABLE_NAME).update(data).eq('id', id).select().single()
  return unwrapSingle<Lesson>(result)
}

export async function deleteLesson(id: string): Promise<void> {
  const client = ensureClient()
  const { error } = await client.from(TABLE_NAME).delete().eq('id', id)
  if (error) {
    throw error
  }
}

export async function softDeleteLesson(id: string): Promise<void> {
  const client = ensureClient()
  const result = await client
    .from(TABLE_NAME)
    .update({ deleted_at: new Date().toISOString(), is_published: false })
    .eq('id', id)
    .select()
    .single()

  unwrapSingle(result)
}
