'use client'

import Link from 'next/link'
import { useAdminAuth } from '@/lib/useAdminAuth'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthorized } = useAdminAuth()

  if (loading) {
    return <div className="min-h-screen bg-zinc-900 text-white p-4">載入中...</div>
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-4">
        <p className="text-center mt-20 text-zinc-400">無權限存取（需要管理員帳號）</p>
        <p className="text-center mt-4">
          <Link href="/login" className="text-blue-400">前往登入</Link>
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export function AdminHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/admin" className="text-blue-400">Dashboard</Link>
          <Link href="/admin/users" className="text-blue-400">用戶</Link>
          <Link href="/admin/feedback" className="text-blue-400">回報</Link>
          <Link href="/admin/lessons" className="text-blue-400">課程</Link>
          <Link href="/admin/monetization" className="text-blue-400">付費</Link>
          <Link href="/admin/affiliates" className="text-blue-400">合作方</Link>
          <Link href="/admin/commissions" className="text-blue-400">分潤</Link>
          <Link href="/admin/analytics" className="text-blue-400">分析</Link>
          <Link href="/" className="text-zinc-400">← 前台</Link>
        </div>
      </div>
    </header>
  )
}
