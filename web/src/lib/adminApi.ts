import { getSessionOrThrow, logSupabaseError } from './supabaseClient'

interface ApiError {
  error?: string
}

async function getToken() {
  try {
    const { session } = await getSessionOrThrow('AdminApi.getToken')
    return session.access_token || null
  } catch (error) {
    logSupabaseError('AdminApi.getToken', error)
    return null
  }
}

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const token = await getToken()
  if (!token) return null

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(path, { ...init, headers })
  if (!response.ok) {
    const body: ApiError = await response.json().catch(() => ({}))
    console.error('[adminApi]', response.status, body.error || response.statusText)
    return null
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export function adminGet<T>(path: string): Promise<T | null> {
  return adminRequest<T>(path)
}

export function adminPost<T>(path: string, body: unknown): Promise<T | null> {
  return adminRequest<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function adminPatch<T>(path: string, body: unknown): Promise<T | null> {
  return adminRequest<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function adminDelete<T>(path: string): Promise<T | null> {
  return adminRequest<T>(path, { method: 'DELETE' })
}
