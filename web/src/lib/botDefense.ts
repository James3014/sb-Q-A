const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // 未設定時跳過驗證
  if (!token) return false

  try {
    const form = new FormData()
    form.append('secret', secret)
    form.append('response', token)

    const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: boolean }
    return !!data.success
  } catch (err) {
    console.error('[Turnstile] verify failed', err)
    return false
  }
}
