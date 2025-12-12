'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { StatCard } from '@/components/ui'
import { adminGet } from '@/lib/adminApi'

interface Affiliate {
  id: string
  partner_name: string
  contact_email: string
  commission_rate: number
  is_active: boolean
  total_trials: number
  total_conversions: number
  conversion_rate: number
  total_commissions: number
  created_at: string
}

interface AffiliateUser {
  id: string
  email: string
  subscription_type: string
  subscription_expires_at: string
  trial_used: boolean
  created_at: string
}

export default function AdminAffiliatesPage() {
  const { isReady } = useAdminAuth()
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null)
  const [affiliateUsers, setAffiliateUsers] = useState<Record<string, AffiliateUser[]>>({})
  const [loadingUsers, setLoadingUsers] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    partner_name: '',
    contact_email: '',
    coupon_code: '',
    commission_rate: 0.15
  })
  const [creating, setCreating] = useState(false)

  const loadAffiliates = async () => {
    try {
      const data = await adminGet<{ affiliates: Affiliate[] }>('/api/admin/affiliates')
      if (data?.affiliates) setAffiliates(data.affiliates)
    } catch (error) {
      console.error('Failed to load affiliates:', error)
    }
    setLoading(false)
  }

  const loadAffiliateUsers = async (partnerId: string) => {
    if (affiliateUsers[partnerId]) return // 已載入過

    setLoadingUsers(prev => ({ ...prev, [partnerId]: true }))
    
    try {
      const data = await adminGet<{ users: AffiliateUser[] }>(`/api/admin/affiliates/users?partner_id=${partnerId}`)
      
      if (data?.users) {
        setAffiliateUsers(prev => ({ ...prev, [partnerId]: data.users }))
      }
    } catch (error) {
      console.error('Failed to load affiliate users:', error)
    } finally {
      setLoadingUsers(prev => ({ ...prev, [partnerId]: false }))
    }
  }

  const toggleExpand = (partnerId: string) => {
    if (expandedAffiliate === partnerId) {
      setExpandedAffiliate(null)
    } else {
      setExpandedAffiliate(partnerId)
      loadAffiliateUsers(partnerId)
    }
  }

  const createAffiliate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const res = await fetch('/api/admin/affiliates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await res.json()
      
      if (res.ok) {
        alert(`合作方帳號建立成功！\n\n帳號: ${result.partner.contact_email}\n折扣碼: ${result.partner.coupon_code}\n\n請將登入資訊發送給合作方。`)
        setFormData({ partner_name: '', contact_email: '', coupon_code: '', commission_rate: 0.15 })
        setShowCreateForm(false)
        loadAffiliates()
      } else {
        alert(`建立失敗: ${result.error}`)
      }
    } catch (error) {
      alert('建立失敗，請稍後再試')
    } finally {
      setCreating(false)
    }
  }

  const toggleAffiliate = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive })
      })
      loadAffiliates()
    } catch (error) {
      console.error('Failed to toggle affiliate:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW')
  }

  const getSubscriptionStatus = (user: AffiliateUser) => {
    if (!user.subscription_expires_at) return '無訂閱'
    
    const expiresAt = new Date(user.subscription_expires_at)
    const now = new Date()
    
    if (expiresAt > now) {
      return `${user.subscription_type} (到期：${formatDate(user.subscription_expires_at)})`
    } else {
      return '已過期'
    }
  }

  useEffect(() => {
    if (isReady) loadAffiliates()
  }, [isReady])

  const activeCount = affiliates.filter(a => a.is_active).length
  const totalTrials = affiliates.reduce((sum, a) => sum + a.total_trials, 0)
  const totalCommissions = affiliates.reduce((sum, a) => sum + a.total_commissions, 0)

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="🤝 合作方管理" />

        <div className="p-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard label="總合作方" value={affiliates.length} />
            <StatCard label="啟用中" value={activeCount} color="text-green-400" />
            <StatCard label="總試用數" value={totalTrials} color="text-blue-400" />
            <StatCard label="總分潤" value={`NT$${Math.round(totalCommissions)}`} color="text-purple-400" />
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">合作方列表</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
            >
              + 新增合作方
            </button>
          </div>

          {/* 創建表單 */}
          {showCreateForm && (
            <div className="bg-zinc-800 rounded-lg p-6 mb-6">
              <h3 className="font-bold mb-4">新增合作方</h3>
              <form onSubmit={createAffiliate} className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="合作方名稱"
                  value={formData.partner_name}
                  onChange={(e) => setFormData({...formData, partner_name: e.target.value})}
                  className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="聯絡 Email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="專屬折扣碼"
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({...formData, coupon_code: e.target.value.toUpperCase()})}
                  className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="分潤率 (0.15 = 15%)"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
                  className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
                  step="0.01"
                  min="0"
                  max="1"
                />
                <div className="col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-600 px-4 py-2 rounded"
                  >
                    {creating ? '建立中...' : '建立帳號'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-zinc-600 hover:bg-zinc-500 px-4 py-2 rounded"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 合作方列表 */}
          {loading ? (
            <p className="text-zinc-500">載入中...</p>
          ) : affiliates.length === 0 ? (
            <p className="text-zinc-500">尚無合作方</p>
          ) : (
            <div className="space-y-3">
              {affiliates.map(affiliate => (
                <div key={affiliate.id} className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleExpand(affiliate.id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {expandedAffiliate === affiliate.id ? '▼' : '▶'} 
                      </button>
                      <div>
                        <h3 className="font-bold">{affiliate.partner_name}</h3>
                        <p className="text-sm text-zinc-400">{affiliate.contact_email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAffiliate(affiliate.id, affiliate.is_active)}
                      className={`px-3 py-1 rounded text-xs ${
                        affiliate.is_active 
                          ? 'bg-red-600 hover:bg-red-500' 
                          : 'bg-green-600 hover:bg-green-500'
                      }`}
                    >
                      {affiliate.is_active ? '停用' : '啟用'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">狀態：</span>
                      <span className={affiliate.is_active ? 'text-green-400' : 'text-red-400'}>
                        {affiliate.is_active ? '啟用' : '停用'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">試用數：</span>
                      <span>{affiliate.total_trials}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">轉換數：</span>
                      <span>{affiliate.total_conversions}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">轉換率：</span>
                      <span>{affiliate.conversion_rate}%</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">總分潤：</span>
                      <span className="text-purple-400">NT${Math.round(affiliate.total_commissions)}</span>
                    </div>
                  </div>

                  {/* 展開的用戶列表 */}
                  {expandedAffiliate === affiliate.id && (
                    <div className="mt-4 pt-4 border-t border-zinc-700">
                      <h4 className="font-medium mb-3 text-zinc-300">
                        👥 合作方用戶 ({affiliate.total_trials} 人)
                      </h4>
                      
                      {loadingUsers[affiliate.id] ? (
                        <p className="text-zinc-500 text-sm">載入用戶中...</p>
                      ) : affiliateUsers[affiliate.id]?.length === 0 ? (
                        <p className="text-zinc-500 text-sm">尚無用戶</p>
                      ) : (
                        <div className="space-y-2">
                          {affiliateUsers[affiliate.id]?.map(user => (
                            <div key={user.id} className="bg-zinc-700 rounded p-3 text-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{user.email}</p>
                                  <p className="text-zinc-400">
                                    註冊：{formatDate(user.created_at)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`font-medium ${
                                    user.subscription_expires_at && new Date(user.subscription_expires_at) > new Date()
                                      ? 'text-green-400' 
                                      : 'text-zinc-400'
                                  }`}>
                                    {getSubscriptionStatus(user)}
                                  </p>
                                  <p className="text-zinc-500">
                                    {user.trial_used ? '已使用試用' : '未使用試用'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  )
}
