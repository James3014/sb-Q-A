import { getSupabase } from '@/lib/supabase'

const BUCKET_NAME = 'lesson-images'

type SupabaseGetter = typeof getSupabase
let getClient: SupabaseGetter = getSupabase

export function setSupabaseGetter(getter: SupabaseGetter): void {
  getClient = getter
}

export function resetSupabaseGetter(): void {
  getClient = getSupabase
}

function ensureBucket() {
  const client = getClient()
  if (!client) {
    throw new Error('Supabase client not initialized')
  }
  return client.storage.from(BUCKET_NAME)
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const bucket = ensureBucket()
  const { error } = await bucket.upload(path, file, { upsert: true })
  if (error) {
    throw error
  }

  return getImageUrl(path)
}

export async function deleteImage(path: string): Promise<void> {
  const bucket = ensureBucket()
  const { error } = await bucket.remove([path])
  if (error) {
    throw error
  }
}

export function getImageUrl(path: string): string {
  const bucket = ensureBucket()
  const { data } = bucket.getPublicUrl(path)
  return data.publicUrl
}
