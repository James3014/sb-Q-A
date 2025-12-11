/**
 * Supabase 客戶端封裝層
 *
 * 使用指引：
 * - getSupabase()       → 不需登入的讀取操作（lessons, 公開資料）
 * - getClientOrThrow()  → 需要 Supabase 配置但不一定要登入
 * - getSessionOrThrow() → 需要登入的操作（favorites, practice, payments）
 * - getSupabaseServiceRole() → 伺服器端操作（webhook, admin API）
 */

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
