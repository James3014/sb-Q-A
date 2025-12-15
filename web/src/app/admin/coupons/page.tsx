'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { StatCard, LoadingSpinner, EmptyState, StatusBadge } from '@/components/ui'

interface Coupon {
  id: string
  code: string
  plan_id: string
  plan_label: string
  is_active: boolean
  used_count: number
  max_uses: number | null
  valid_until: string | null
  created_at: string
}

export default function CouponsPage() {
  const { isReady } = useAdminAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState('')
  const [creating, setCreating] = useState(false)

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (data.coupons) setCoupons(data.coupons)
    } catch (error) {
      console.error('Failed to load coupons:', error)
    }
    setLoading(false)
  }

  const createCoupon = async () => {
    if (!newCode.trim()) return
    
    setCreating(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.toUpperCase(),
          plan_id: 'pass_7',
          plan_label: '7天試用',
          max_uses: 100
        })
      })
      
      if (res.ok) {
        setNewCode('')
        loadCoupons()
      }
    } catch (error) {
      console.error('Failed to create coupon:', error)
    }
    setCreating(false)
  }

  const toggleCoupon = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive })
      })
      loadCoupons()
    } catch (error) {
      console.error('Failed to toggle coupon:', error)
    }
  }

  const copyLink = (code: string) => {
    const link = `https://www.snowskill.app/pricing?coupon=${code}`
    navigator.clipboard.writeText(link)
    alert('連結已複製到剪貼簿！')
  }

  useEffect(() => {
    if (isReady) loadCoupons()
  }, [isReady])

  const activeCount = coupons.filter(c => c.is_active).length
  const totalUsed = coupons.reduce((sum, c) => sum + c.used_count, 0)

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="🎫 折扣碼管理" />

        <div className="p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="總折扣碼" value={coupons.length} />
            <StatCard label="啟用中" value={activeCount} color="text-green-400" />
            <StatCard label="總使用次數" value={totalUsed} color="text-blue-400" />
          </div>

          {/* 創建新折扣碼 */}
          <div className="bg-zinc-800 rounded-lg p-4 mb-6">
            <h2 className="font-bold mb-3">🆕 創建新折扣碼</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="輸入折扣碼（如：WINTER2025）"
                className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
                maxLength={20}
              />
              <button
                onClick={createCoupon}
                disabled={!newCode.trim() || creating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-600 rounded"
              >
                {creating ? '創建中...' : '創建'}
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              自動設定為 7 天試用，最多 100 次使用，有效期至 2025-12-31
            </p>
          </div>

          {/* 折扣碼列表 */}
          <div className="space-y-3">
            {loading ? (
              <LoadingSpinner text="載入折扣碼..." />
            ) : coupons.length === 0 ? (
              <EmptyState
                emoji="🎫"
                title="尚無折扣碼"
                description="創建第一個折扣碼來開始推廣"
                actionText="創建折扣碼"
                actionHref="#"
              />
            ) : (
              coupons.map(coupon => (
                <div key={coupon.id} className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{coupon.code}</h3>
                      <p className="text-sm text-zinc-400">{coupon.plan_label}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyLink(coupon.code)}
                        className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded"
                      >
                        複製連結
                      </button>
                      <button
                        onClick={() => toggleCoupon(coupon.id, coupon.is_active)}
                        className={`text-xs px-3 py-1 rounded ${
                          coupon.is_active 
                            ? 'bg-red-600 hover:bg-red-500' 
                            : 'bg-green-600 hover:bg-green-500'
                        }`}
                      >
                        {coupon.is_active ? '停用' : '啟用'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">狀態：</span>
                      <StatusBadge
                        variant={coupon.is_active ? 'success' : 'error'}
                        size="sm"
                        showDot
                      >
                        {coupon.is_active ? '啟用' : '停用'}
                      </StatusBadge>
                    </div>
                    <div>
                      <span className="text-zinc-500">使用次數：</span>
                      <span>{coupon.used_count}/{coupon.max_uses || '無限'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">有效期：</span>
                      <span>{coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : '永久'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">創建：</span>
                      <span>{new Date(coupon.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-zinc-700 rounded text-xs">
                    <span className="text-zinc-400">分享連結：</span>
                    <span className="ml-2 text-blue-300">
                      https://www.snowskill.app/pricing?coupon={coupon.code}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
