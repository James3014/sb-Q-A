import { getSupabase } from './supabase'

interface ApiError {
  error?: string
}

async function getToken() {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data: sessionData } = await supabase.auth.getSession()
  return sessionData.session?.access_token || null
}

export async function adminGet<T>(path: string): Promise<T | null> {
  const token = await getToken()
  if (!token) return null
  const res = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({}))
    console.error('[adminGet]', res.status, body.error || res.statusText)
    return null
  }
  return res.json()
}

export async function adminPost<T>(path: string, body: unknown): Promise<T | null> {
  const token = await getToken()
  if (!token) return null
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const resp: ApiError = await res.json().catch(() => ({}))
    console.error('[adminPost]', res.status, resp.error || res.statusText)
    return null
  }
  return res.json()
}
