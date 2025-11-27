'use client'

import Link from 'next/link'
import { useAdminAuth } from '@/lib/useAdminAuth'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthorized, isReady, password, setPassword, submitPassword } = useAdminAuth()

  if (loading) {
    return <div className="min-h-screen bg-zinc-900 text-white p-4">載入中...</div>
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-4">
        <p className="text-center mt-20 text-zinc-400">無權限存取</p>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <form onSubmit={(e) => { e.preventDefault(); if (!submitPassword()) alert('密碼錯誤') }} className="w-full max-w-xs">
          <h1 className="text-xl font-bold text-center mb-6">🔐 後台驗證</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="請輸入後台密碼"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg mb-4"
            autoFocus
          />
          <button type="submit" className="w-full py-3 bg-blue-600 rounded-lg font-medium">
            進入後台
          </button>
        </form>
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
          <Link href="/admin/users" className="text-blue-400">用戶</Link>
          <Link href="/admin/feedback" className="text-blue-400">回報</Link>
          <Link href="/admin/lessons" className="text-blue-400">課程</Link>
          <Link href="/admin/monetization" className="text-blue-400">付費</Link>
          <Link href="/" className="text-zinc-400">← 前台</Link>
        </div>
      </div>
    </header>
  )
}
