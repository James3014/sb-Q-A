const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10)
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
const enabled = process.env.RATE_LIMIT_ENABLED === 'true'

// Upstash Redis REST
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
const useRedis = !!(redisUrl && redisToken)

type Counter = { count: number; expires: number }
const memoryCounters = new Map<string, Counter>()

async function checkRedis(key: string) {
  const body = JSON.stringify([
    ['INCR', key],
    ['EXPIRE', key, `${Math.ceil(windowMs / 1000)}`],
  ])

  const res = await fetch(`${redisUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body,
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Redis rate limit failed: ${res.statusText}`)
  }
  const result = (await res.json()) as Array<[number, number]>
  const current = result?.[0]?.[1] ?? 0
  return current > maxRequests
}

function checkMemory(key: string) {
  const now = Date.now()
  const current = memoryCounters.get(key)
  if (!current || current.expires < now) {
    memoryCounters.set(key, { count: 1, expires: now + windowMs })
    return false
  }
  current.count += 1
  return current.count > maxRequests
}

export async function isRateLimited(ip: string, path: string) {
  if (!enabled) return false
  const key = `ratelimit:${ip}:${Math.floor(Date.now() / windowMs)}`

  try {
    if (useRedis) {
      return await checkRedis(key)
    }
    return checkMemory(key)
  } catch (err) {
    console.error('[RateLimit] fallback to memory', err)
    return checkMemory(key)
  }
}
