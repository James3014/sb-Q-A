import { NextRequest, NextResponse } from 'next/server'

/**
 * UserCore Proxy API
 *
 * 在 HTTPS 頁面上代理對 UserCore 的請求
 * 避免 Mixed Content 錯誤（HTTPS 頁面無法直接請求 HTTP）
 */

const USER_CORE_API_BASE = 'https://user-core.zeabur.app'

export async function POST(req: NextRequest) {
  try {
    const { endpoint, body, headers } = await req.json()

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint' },
        { status: 400 }
      )
    }

    // 構建完整 URL，確保使用 HTTPS
    const url = new URL(endpoint, USER_CORE_API_BASE)
    url.protocol = 'https:'

    // 轉發請求到 UserCore
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`[UserCore Proxy] Error: ${response.status}`, text)
      return NextResponse.json(
        { error: `UserCore error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[UserCore Proxy] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint' },
        { status: 400 }
      )
    }

    // 構建完整 URL，確保使用 HTTPS
    const url = new URL(endpoint, USER_CORE_API_BASE)
    url.protocol = 'https:'

    // 轉發請求到 UserCore
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`[UserCore Proxy] Error: ${response.status}`, text)
      return NextResponse.json(
        { error: `UserCore error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[UserCore Proxy] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
