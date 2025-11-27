'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { isAdmin } from '@/lib/admin'
import { getSupabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  subscription_type: string
  subscription_expires_at: string | null
  created_at: string
}

export default function UsersPage() {
  const { user, loading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('pass_7')
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = getSupabase()
      if (!supabase) return

      const { data, error } = await supabase.rpc('get_all_users')
      
      if (error) {
        console.error('get_all_users error:', error)
      }
      
      setUsers(data || [])
      setLoadingData(false)
    }

    if (!loading && user && isAdmin(user.email)) {
      load()
    }
  }, [user, loading])

  const activateUser = async () => {
    if (!selectedUser || activating) return
    setActivating(true)

    const supabase = getSupabase()
    if (!supabase) {
      setActivating(false)
      return
    }

    // 計算到期時間
    let expiresAt: Date
    if (selectedPlan === 'pass_7') {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    } else if (selectedPlan === 'pass_30') {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    } else {
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }

    const { error } = await supabase
      .from('users')
      .update({
        subscription_type: selectedPlan,
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('id', selectedUser)

    if (error) {
      alert('開通失敗：' + error.message)
    } else {
      alert('開通成功！')
      // 重新載入
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
      setUsers(data || [])
    }

    setActivating(false)
    setSelectedUser(null)
  }

  if (loading) return <div className="min-h-screen bg-zinc-900 text-white p-4">載入中...</div>

  if (!user || !isAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-4">
        <p className="text-center mt-20 text-zinc-400">無權限存取</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">👥 用戶管理</h1>
          <Link href="/admin" className="text-sm text-zinc-400">← 返回</Link>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        {/* 開通面板 */}
        {selectedUser && (
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3">開通訂閱</h3>
            <p className="text-sm text-zinc-300 mb-3">
              用戶：{users.find(u => u.id === selectedUser)?.email}
            </p>
            <div className="flex gap-2 mb-4">
              {[
                { id: 'pass_7', label: '7天 $180' },
                { id: 'pass_30', label: '30天 $290' },
                { id: 'pro_yearly', label: '年費 $690' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`px-3 py-2 rounded text-sm ${
                    selectedPlan === p.id ? 'bg-blue-600' : 'bg-zinc-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={activateUser}
                disabled={activating}
                className="px-4 py-2 bg-green-600 rounded text-sm disabled:opacity-50"
              >
                {activating ? '處理中...' : '確認開通'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-zinc-700 rounded text-sm"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 用戶列表 */}
        <p className="text-zinc-500 text-sm mb-4">共 {users.length} 位用戶</p>

        {loadingData ? (
          <p className="text-zinc-500">載入中...</p>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm">{u.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      u.subscription_type === 'free' ? 'bg-zinc-700' : 'bg-amber-600'
                    }`}>
                      {u.subscription_type || 'free'}
                    </span>
                    {u.subscription_expires_at && (
                      <span className="text-xs text-zinc-500">
                        到期：{new Date(u.subscription_expires_at).toLocaleDateString('zh-TW')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(u.id)}
                  className="px-3 py-1 bg-blue-600 rounded text-sm"
                >
                  開通
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
