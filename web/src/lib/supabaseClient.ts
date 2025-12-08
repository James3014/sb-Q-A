import { SupabaseClient, Session } from '@supabase/supabase-js'
import { getSupabase } from './supabase'

export class SupabaseConfigError extends Error {}
export class SupabaseAuthError extends Error {}

export function getClientOrThrow(context: string): SupabaseClient {
  const client = getSupabase()
  if (!client) {
    throw new SupabaseConfigError(`[${context}] Supabase 未設定（缺少 NEXT_PUBLIC_SUPABASE_URL/KEY）`)
  }
  return client
}

export async function getSessionOrThrow(context: string): Promise<{ client: SupabaseClient; session: Session }> {
  const client = getClientOrThrow(context)
  const { data, error } = await client.auth.getSession()

  if (error || !data.session) {
    throw new SupabaseAuthError(`[${context}] 請先登入`)
  }

  return { client, session: data.session }
}

export function logSupabaseError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[${context}]`, message)
}
