'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { fetchAdminUsers, AdminUser } from '@/lib/adminData'
import { StatCard } from '@/components/ui'
import { ActivationPanel } from '@/components/ActivationPanel'
import { getSubscriptionStatus } from '@/lib/subscription'
import { formatDate } from '@/lib/constants'

interface UserWithCoupon extends AdminUser {
  coupon_code?: string
  coupon_used_at?: string
}

export default function UsersPage() {
  const { isReady } = useAdminAuth()
  const [users, setUsers] = useState<UserWithCoupon[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithCoupon | null>(null)

  const loadUsers = async () => {
    const data = await fetchAdminUsers()
    if (data?.users) {
      // 獲取折扣碼使用記錄
      const usersWithCoupons = await Promise.all(
        data.users.map(async (user) => {
          try {
            const res = await fetch('/api/admin/users/coupon-usage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id })
            })
            const couponData = await res.json()
            return {
              ...user,
              coupon_code: couponData.coupon_code,
              coupon_used_at: couponData.used_at
            }
          } catch {
            return user
          }
        })
      )
      setUsers(usersWithCoupons)
    }
    setLoadingData(false)
  }

  useEffect(() => {
    if (isReady) loadUsers()
  }, [isReady])

  const filtered = search
    ? users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
    : users

  const activeCount = users.filter(u => {
    const status = getSubscriptionStatus(u.subscription_type, u.subscription_expires_at)
    return u.subscription_type && u.subscription_type !== 'free' && !status.isExpired
  }).length

  const expiredCount = users.filter(u => {
    const status = getSubscriptionStatus(u.subscription_type, u.subscription_expires_at)
    return status.isExpired
  }).length

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="👥 用戶管理" />

        <div className="p-4 max-w-2xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋 Email..."
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg mb-4"
          />

          {selectedUser && (
            <ActivationPanel
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onSuccess={() => { loadUsers(); setSelectedUser(null) }}
            />
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard label="總用戶" value={users.length} />
            <StatCard label="付費中" value={activeCount} color="text-amber-400" />
            <StatCard label="已過期" value={expiredCount} color="text-red-400" />
          </div>

          <p className="text-zinc-500 text-sm mb-4">
            {search ? `搜尋結果：${filtered.length} 位` : `共 ${users.length} 位用戶`}
          </p>

          {loadingData ? (
            <p className="text-zinc-500">載入中...</p>
          ) : filtered.length === 0 ? (
            <p className="text-zinc-500">找不到用戶</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(u => {
                const status = getSubscriptionStatus(u.subscription_type, u.subscription_expires_at)
                return (
                  <div key={u.id} className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm">{u.email}</p>
                      <div className="flex gap-2 mt-1 items-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>{status.label}</span>
                        {u.subscription_expires_at && u.subscription_type !== 'free' && (
                          <span className="text-xs text-zinc-500">
                            {status.isExpired ? '已於 ' : '到期：'}
                            {formatDate(u.subscription_expires_at)}
                            {status.isExpired && ' 過期'}
                          </span>
                        )}
                        {u.coupon_code && (
                          <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                            折扣碼：{u.coupon_code}
                          </span>
                        )}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(u)} className="px-3 py-1 bg-blue-600 rounded text-sm">
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
