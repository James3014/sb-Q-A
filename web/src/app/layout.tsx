import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: '單板教學 | CASI 認證滑雪板教學系統',
  description: '213 堂專業單板滑雪課程，涵蓋初級到進階技巧。基於 CASI 認證框架，雪場實戰優化設計。換刃、轉彎、壓力控制一次學會。',
  keywords: ['單板教學', '滑雪板教學', 'snowboard教學', 'CASI課程', '單板滑雪初學者', '滑雪板轉彎技巧', '單板換刃練習'],
  manifest: '/manifest.json',
  openGraph: {
    title: '單板教學 | CASI 認證滑雪板教學',
    description: '213 堂專業課程，雪場即時查找問題解法，戴手套也能操作',
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
