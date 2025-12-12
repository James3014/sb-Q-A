'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { StatCard } from '@/components/ui'

interface Commission {
  id: string
  partner_name: string
  coupon_code: string
  user_email: string
  paid_amount: number
  commission_amount: number
  settlement_quarter: string
  status: 'pending' | 'settled' | 'paid'
  created_at: string
  settled_at?: string
  paid_at?: string
}

export default function AdminCommissionsPage() {
  const { isReady } = useAdminAuth()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    quarter: '',
    status: '',
    partner: ''
  })

  const loadCommissions = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.quarter) params.set('quarter', filter.quarter)
      if (filter.status) params.set('status', filter.status)
      if (filter.partner) params.set('partner', filter.partner)

      const res = await fetch(`/api/admin/commissions?${params}`)
      const data = await res.json()
      if (data.commissions) setCommissions(data.commissions)
    } catch (error) {
      console.error('Failed to load commissions:', error)
    }
    setLoading(false)
  }

  const markAsPaid = async (ids: string[]) => {
    try {
      const res = await fetch('/api/admin/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status: 'paid' })
      })

      if (res.ok) {
        alert(`已標記 ${ids.length} 筆分潤為已支付`)
        loadCommissions()
      } else {
        alert('操作失敗')
      }
    } catch (error) {
      alert('操作失敗')
    }
  }

  useEffect(() => {
    if (isReady) loadCommissions()
  }, [isReady, filter])

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    const settledIds = commissions.filter(c => c.status === 'settled').map(c => c.id)
    setSelectedIds(settledIds)
  }

  const totalPending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0)
  const totalSettled = commissions.filter(c => c.status === 'settled').reduce((sum, c) => sum + c.commission_amount, 0)
  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission_amount, 0)

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="💰 分潤記錄管理" />

        <div className="p-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard label="總記錄" value={commissions.length} />
            <StatCard label="待結算" value={`NT$${Math.round(totalPending)}`} color="text-amber-400" />
            <StatCard label="已結算" value={`NT$${Math.round(totalSettled)}`} color="text-blue-400" />
            <StatCard label="已支付" value={`NT$${Math.round(totalPaid)}`} color="text-green-400" />
          </div>

          {/* 篩選器 */}
          <div className="bg-zinc-800 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3">篩選條件</h3>
            <div className="grid grid-cols-3 gap-4">
              <select
                value={filter.quarter}
                onChange={(e) => setFilter({...filter, quarter: e.target.value})}
                className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
              >
                <option value="">所有季度</option>
                <option value="2025-Q4">2025-Q4</option>
                <option value="2025-Q3">2025-Q3</option>
                <option value="2025-Q2">2025-Q2</option>
                <option value="2025-Q1">2025-Q1</option>
              </select>
              
              <select
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
              >
                <option value="">所有狀態</option>
                <option value="pending">待結算</option>
                <option value="settled">已結算</option>
                <option value="paid">已支付</option>
              </select>

              <input
                type="text"
                placeholder="合作方名稱"
                value={filter.partner}
                onChange={(e) => setFilter({...filter, partner: e.target.value})}
                className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
              />
            </div>
          </div>

          {/* 批次操作 */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span>已選擇 {selectedIds.length} 筆記錄</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => markAsPaid(selectedIds)}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
                  >
                    標記為已支付
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="bg-zinc-600 hover:bg-zinc-500 px-4 py-2 rounded"
                  >
                    取消選擇
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 分潤記錄列表 */}
          {loading ? (
            <p className="text-zinc-500">載入中...</p>
          ) : commissions.length === 0 ? (
            <p className="text-zinc-500">無分潤記錄</p>
          ) : (
            <div className="bg-zinc-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
                <h3 className="font-bold">分潤記錄</h3>
                <button
                  onClick={selectAll}
                  className="text-sm bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded"
                >
                  選擇所有已結算
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-700">
                    <tr>
                      <th className="text-left p-3">選擇</th>
                      <th className="text-left p-3">合作方</th>
                      <th className="text-left p-3">折扣碼</th>
                      <th className="text-left p-3">用戶</th>
                      <th className="text-right p-3">付費金額</th>
                      <th className="text-right p-3">分潤金額</th>
                      <th className="text-center p-3">季度</th>
                      <th className="text-center p-3">狀態</th>
                      <th className="text-center p-3">建立時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map(commission => (
                      <tr key={commission.id} className="border-b border-zinc-700/50">
                        <td className="p-3">
                          {commission.status === 'settled' && (
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(commission.id)}
                              onChange={() => toggleSelect(commission.id)}
                              className="w-4 h-4"
                            />
                          )}
                        </td>
                        <td className="p-3">{commission.partner_name}</td>
                        <td className="p-3">
                          <code className="bg-zinc-700 px-2 py-1 rounded text-xs">
                            {commission.coupon_code}
                          </code>
                        </td>
                        <td className="p-3">{commission.user_email}</td>
                        <td className="text-right p-3">NT${commission.paid_amount}</td>
                        <td className="text-right p-3 text-purple-400">NT${commission.commission_amount}</td>
                        <td className="text-center p-3">{commission.settlement_quarter}</td>
                        <td className="text-center p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            commission.status === 'pending' ? 'bg-amber-900 text-amber-300' :
                            commission.status === 'settled' ? 'bg-blue-900 text-blue-300' :
                            'bg-green-900 text-green-300'
                          }`}>
                            {commission.status === 'pending' ? '待結算' :
                             commission.status === 'settled' ? '已結算' : '已支付'}
                          </span>
                        </td>
                        <td className="text-center p-3 text-zinc-400">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  )
}
