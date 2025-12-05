import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const provider =
    process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ||
    process.env.PAYMENT_PROVIDER ||
    'mock'

  if (req.nextUrl.pathname.startsWith('/mock-checkout') && provider !== 'mock') {
    const url = req.nextUrl.clone()
    url.pathname = '/pricing'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/mock-checkout'],
}
