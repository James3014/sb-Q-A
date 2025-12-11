'use client'
import { PageContainer } from '@/components/ui';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmail, signUpWithEmail } from '@/lib/auth'
import { TurnstileWidget } from '@/components/TurnstileWidget'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const enableTurnstile = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (enableTurnstile && !turnstileToken) {
      setError('請完成驗證後再試')
      setLoading(false)
      return
    }

    const { error } = isLogin
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password)

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <PageContainer className="flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-zinc-400 text-sm mb-6 block">← 返回首頁</Link>
        
        <h1 className="text-2xl font-bold text-center mb-2">
          🏂 {isLogin ? '登入' : '註冊'}
        </h1>
        
        <p className="text-center text-zinc-400 text-sm mb-6">
          登入後可收藏課程、紀錄練習進度
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
            required
            minLength={6}
          />

          {enableTurnstile && (
            <TurnstileWidget onToken={setTurnstileToken} />
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '處理中...' : isLogin ? '登入' : '註冊'}
          </button>
        </form>

        <p className="text-center text-zinc-400 text-sm mt-4">
          {isLogin ? '還沒有帳號？' : '已有帳號？'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 ml-1"
          >
            {isLogin ? '註冊' : '登入'}
          </button>
        </p>
      </div>
    </PageContainer>
  )
}
