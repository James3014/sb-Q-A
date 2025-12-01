import { createClient, SupabaseClient } from '@supabase/supabase-js'

let serviceClient: SupabaseClient | null = null

export function getSupabaseServiceRole(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('[Supabase] Missing service role env vars')
    return null
  }

  if (!serviceClient) {
    serviceClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return serviceClient
}
