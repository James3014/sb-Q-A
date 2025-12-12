import { NextRequest, NextResponse } from 'next/server'

const USER_CORE_API_BASE = 'https://user-core.zeabur.app'

// 🎯 單一職責：錯誤處理
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error'
}

// 🎯 單一職責：靜默回應
function silentResponse(message: string) {
  return NextResponse.json({ 
    success: false, 
    error: message 
  }, { status: 200 })
}

// 🎯 單一職責：超時控制
function createTimeoutController(ms: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), ms)
  return { controller, cleanup: () => clearTimeout(timeoutId) }
}

export async function POST(req: NextRequest) {
  try {
    const { endpoint, body, headers } = await req.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    const { controller, cleanup } = createTimeoutController(3000)

    try {
      const url = new URL(endpoint, USER_CORE_API_BASE)
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      cleanup()

      if (!response.ok) {
        console.warn(`[UserCore] ${response.status}: ${endpoint}`)
        return silentResponse('Analytics service unavailable')
      }

      const data = await response.json()
      return NextResponse.json(data)

    } catch (fetchError) {
      cleanup()
      console.warn('[UserCore] Service unavailable:', getErrorMessage(fetchError))
      return silentResponse('Analytics service temporarily unavailable')
    }

  } catch (error) {
    console.error('[UserCore Proxy] Error:', getErrorMessage(error))
    return silentResponse('Proxy error')
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    const { controller, cleanup } = createTimeoutController(3000)

    try {
      const url = new URL(endpoint, USER_CORE_API_BASE)
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      })

      cleanup()

      if (!response.ok) {
        console.warn(`[UserCore] ${response.status}: ${endpoint}`)
        return silentResponse('Service unavailable')
      }

      const data = await response.json()
      return NextResponse.json(data)

    } catch (fetchError) {
      cleanup()
      console.warn('[UserCore] Service unavailable:', getErrorMessage(fetchError))
      return silentResponse('Service temporarily unavailable')
    }

  } catch (error) {
    console.error('[UserCore Proxy] Error:', getErrorMessage(error))
    return silentResponse('Proxy error')
  }
}
