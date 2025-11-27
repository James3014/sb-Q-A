'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { getSupabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  subscription_type: string
  subscription_expires_at: string | null
  created_at: string
}

function getStatus(user: User): { label: string; color: string } {
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { label: '免費', color: 'bg-zinc-600' }
  }
  if (user.subscription_expires_at) {
    const expires = new Date(user.subscription_expires_at)
    if (expires < new Date()) {
      return { label: '已過期', color: 'bg-red-600' }
    }
  }
  const labels: Record<string, string> = {
    pass_7: '7天',
    pass_30: '30天',
    pro_yearly: '年費',
  }
  return { label: labels[user.subscription_type] || user.subscription_type, color: 'bg-amber-600' }
}

export default function UsersPage() {
  const { isReady } = useAdminAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('pass_7')
  const [activating, setActivating] = useState(false)

  const loadUsers = async () => {
    const supabase = getSupabase()
    if (!supabase) return

    const { data, error } = await supabase.rpc('get_all_users')
    if (error) console.error('get_all_users error:', error)
    setUsers(data || [])
    setLoadingData(false)
  }

  useEffect(() => {
    if (isReady) loadUsers()
  }, [isReady])

  const activateUser = async () => {
    if (!selectedUser || activating) return
    setActivating(true)

    const supabase = getSupabase()
    if (!supabase) {
      setActivating(false)
      return
    }

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
      .eq('id', selectedUser.id)

    if (error) {
      alert('開通失敗：' + error.message)
    } else {
      alert(`已開通 ${selectedUser.email} 的 ${selectedPlan} 方案！`)
      await loadUsers()
    }

    setActivating(false)
    setSelectedUser(null)
  }

  const filtered = search
    ? users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
    : users

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="👥 用戶管理" />

      <div className="p-4 max-w-2xl mx-auto">
        {/* 搜尋 */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋 Email..."
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg mb-4"
        />

        {/* 開通面板 */}
        {selectedUser && (
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3">🔓 開通訂閱</h3>
            <p className="text-sm text-zinc-300 mb-1">用戶：{selectedUser.email}</p>
            <p className="text-xs text-zinc-500 mb-3">
              目前狀態：{getStatus(selectedUser).label}
              {selectedUser.subscription_expires_at && ` (到期：${new Date(selectedUser.subscription_expires_at).toLocaleDateString('zh-TW')})`}
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

        {/* 統計 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-zinc-800 rounded p-3 text-center">
            <p className="text-xs text-zinc-400">總用戶</p>
            <p className="text-xl font-bold">{users.length}</p>
          </div>
          <div className="bg-zinc-800 rounded p-3 text-center">
            <p className="text-xs text-zinc-400">付費中</p>
            <p className="text-xl font-bold text-amber-400">
              {users.filter(u => u.subscription_type && u.subscription_type !== 'free' && 
                (!u.subscription_expires_at || new Date(u.subscription_expires_at) > new Date())
              ).length}
            </p>
          </div>
          <div className="bg-zinc-800 rounded p-3 text-center">
            <p className="text-xs text-zinc-400">已過期</p>
            <p className="text-xl font-bold text-red-400">
              {users.filter(u => u.subscription_expires_at && new Date(u.subscription_expires_at) < new Date()).length}
            </p>
          </div>
        </div>

        <p className="text-zinc-500 text-sm mb-4">
          {search ? `搜尋結果：${filtered.length} 位` : `共 ${users.length} 位用戶`}
        </p>

        {/* 用戶列表 */}
        {loadingData ? (
          <p className="text-zinc-500">載入中...</p>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-500">找不到用戶</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => {
              const status = getStatus(u)
              return (
                <div key={u.id} className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm">{u.email}</p>
                    <div className="flex gap-2 mt-1 items-center">
                      <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>
                        {status.label}
                      </span>
                      {u.subscription_expires_at && u.subscription_type !== 'free' && (
                        <span className="text-xs text-zinc-500">
                          {new Date(u.subscription_expires_at) > new Date() ? '到期：' : '已於 '}
                          {new Date(u.subscription_expires_at).toLocaleDateString('zh-TW')}
                          {new Date(u.subscription_expires_at) <= new Date() && ' 過期'}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="px-3 py-1 bg-blue-600 rounded text-sm"
                  >
                    開通
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
    </AdminLayout>
  )
}
