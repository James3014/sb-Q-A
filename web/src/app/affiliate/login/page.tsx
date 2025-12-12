'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

export default function AffiliateLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = getSupabase()
      if (!supabase) throw new Error('系統初始化失敗')

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        setError(loginError.message === 'Invalid login credentials' 
          ? 'Email 或密碼錯誤' 
          : loginError.message)
        return
      }

      // 檢查是否為合作方帳號
      const { data: partner, error: partnerError } = await supabase
        .from('affiliate_partners')
        .select('id, partner_name, is_active')
        .eq('supabase_user_id', data.user.id)
        .single()

      if (partnerError || !partner) {
        await supabase.auth.signOut()
        setError('此帳號不是合作方帳號')
        return
      }

      if (!partner.is_active) {
        await supabase.auth.signOut()
        setError('合作方帳號已被停用，請聯繫管理員')
        return
      }

      // 登入成功，跳轉到儀表板
      router.push('/affiliate/dashboard')

    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = getSupabase()
      if (!supabase) throw new Error('系統初始化失敗')

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/affiliate/reset-password`
      })

      if (error) {
        setError(error.message)
        return
      }

      setResetSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '重設失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="bg-zinc-800 rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            🤝 合作方登入
          </h1>
          <p className="text-zinc-400">
            {resetMode ? '重設密碼' : '登入您的合作方帳號'}
          </p>
        </div>

        {resetSent ? (
          <div className="text-center">
            <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 mb-4">
              <p className="text-green-300">
                ✅ 密碼重設連結已發送到您的 Email
              </p>
            </div>
            <button
              onClick={() => {
                setResetSent(false)
                setResetMode(false)
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              返回登入
            </button>
          </div>
        ) : (
          <form onSubmit={resetMode ? handleReset : handleLogin}>
            <div className="mb-4">
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {!resetMode && (
              <div className="mb-6">
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  密碼
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}

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
              {loading ? '處理中...' : resetMode ? '發送重設連結' : '登入'}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setResetMode(!resetMode)
                  setError('')
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {resetMode ? '返回登入' : '忘記密碼？'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-700 text-center">
          <p className="text-zinc-500 text-sm">
            需要協助？請聯繫 
            <a href="mailto:support@snowskill.app" className="text-blue-400 hover:text-blue-300 ml-1">
              support@snowskill.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
