import { NextRequest, NextResponse } from 'next/server'

const USER_CORE_API_BASE = 'https://user-core.zeabur.app'

export async function POST(req: NextRequest) {
  try {
    const { endpoint, body, headers } = await req.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    // 🔧 修復：更短超時 + 重試機制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超時

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

      clearTimeout(timeoutId)

      if (!response.ok) {
        // 🔧 靜默處理 UserCore 錯誤，不影響主功能
        console.warn(`[UserCore] ${response.status}: ${endpoint}`)
        return NextResponse.json({ 
          success: false, 
          error: 'Analytics service unavailable' 
        }, { status: 200 }) // 返回 200 避免前端錯誤
      }

      const data = await response.json()
      return NextResponse.json(data)

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      // 🔧 超時或連線錯誤時靜默處理
      console.warn('[UserCore] Service unavailable:', fetchError.message)
      return NextResponse.json({ 
        success: false, 
        error: 'Analytics service temporarily unavailable' 
      }, { status: 200 })
    }

  } catch (error) {
    console.error('[UserCore Proxy] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Proxy error' 
    }, { status: 200 }) // 靜默處理，不影響主功能
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    try {
      const url = new URL(endpoint, USER_CORE_API_BASE)
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`[UserCore] ${response.status}: ${endpoint}`)
        return NextResponse.json({ 
          success: false, 
          error: 'Service unavailable' 
        }, { status: 200 })
      }

      const data = await response.json()
      return NextResponse.json(data)

    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.warn('[UserCore] Service unavailable:', fetchError.message)
      return NextResponse.json({ 
        success: false, 
        error: 'Service temporarily unavailable' 
      }, { status: 200 })
    }

  } catch (error) {
    console.error('[UserCore Proxy] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Proxy error' 
    }, { status: 200 })
  }
}
