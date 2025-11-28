import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: '單板教學 | CASI 認證滑雪教學',
  description: '200+ 堂滑雪板教學課程，基於 CASI 認證教學框架。雪場即時查找問題解法，戴手套也能操作。',
  manifest: '/manifest.json',
  openGraph: {
    title: '單板教學 | CASI 認證滑雪教學',
    description: '200+ 堂滑雪板教學課程，雪場即時查找問題解法',
    type: 'website',
    locale: 'zh_TW',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-slate-900">
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
