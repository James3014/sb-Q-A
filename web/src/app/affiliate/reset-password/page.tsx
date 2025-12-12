'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // 檢查是否有重設 token
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError('無效的重設連結，請重新申請密碼重設')
    }
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('密碼確認不符')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('密碼至少需要 8 個字元')
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabase()
      if (!supabase) throw new Error('系統初始化失敗')

      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      
      // 3 秒後跳轉到登入頁
      setTimeout(() => {
        router.push('/affiliate/login')
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : '密碼重設失敗')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-zinc-800 rounded-lg p-8 w-full max-w-md text-center">
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-6">
            <h1 className="text-xl font-bold text-green-300 mb-2">
              ✅ 密碼重設成功
            </h1>
            <p className="text-green-200 mb-4">
              您的密碼已成功更新
            </p>
            <p className="text-zinc-400 text-sm">
              3 秒後自動跳轉到登入頁面...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="bg-zinc-800 rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            🔒 設定新密碼
          </h1>
          <p className="text-zinc-400">
            請設定您的新密碼
          </p>
        </div>

        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label className="block text-zinc-300 text-sm font-medium mb-2">
              新密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="至少 8 個字元"
              required
              minLength={8}
            />
          </div>

          <div className="mb-6">
            <label className="block text-zinc-300 text-sm font-medium mb-2">
              確認新密碼
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="再次輸入新密碼"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? '更新中...' : '更新密碼'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/affiliate/login')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            返回登入頁面
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AffiliateResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white">載入中...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
