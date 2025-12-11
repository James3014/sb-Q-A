import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isRateLimited } from './lib/rateLimit'

function getClientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function middleware(req: NextRequest) {
  const provider =
    process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ||
    process.env.PAYMENT_PROVIDER ||
    'mock'

  const pathname = req.nextUrl.pathname

  if (pathname.startsWith('/api')) {
    const ip = getClientIp(req)
    if (await isRateLimited(ip, pathname)) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  if (req.nextUrl.pathname.startsWith('/mock-checkout') && provider !== 'mock') {
    const url = req.nextUrl.clone()
    url.pathname = '/pricing'
    return NextResponse.redirect(url)
  }

  const res = NextResponse.next()

  // 防止敏感頁被索引：管理後台、支付回調、mock-checkout
  const noindexPaths = ['/admin', '/mock-checkout', '/payment-success', '/payment-failure']
  if (noindexPaths.some(p => pathname.startsWith(p))) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/mock-checkout/:path*',
    '/payment-success/:path*',
    '/payment-failure/:path*',
  ],
}
