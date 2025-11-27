'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { SUBSCRIPTION_PLANS, SubscriptionPlanId, formatDate } from '@/lib/constants'
import { getSubscriptionStatus, calculateExpiryDate } from '@/lib/subscription'

interface User {
  id: string
  email: string
  subscription_type: string | null
  subscription_expires_at: string | null
}

interface Props {
  user: User
  onClose: () => void
  onSuccess: () => void
}

export function ActivationPanel({ user, onClose, onSuccess }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('pass_7')
  const [activating, setActivating] = useState(false)

  const status = getSubscriptionStatus(user.subscription_type, user.subscription_expires_at)

  const handleActivate = async () => {
    if (activating) return
    setActivating(true)

    const supabase = getSupabase()
    if (!supabase) {
      setActivating(false)
      return
    }

    const expiresAt = calculateExpiryDate(selectedPlan)

    const { error } = await supabase
      .from('users')
      .update({
        subscription_type: selectedPlan,
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      alert('開通失敗：' + error.message)
    } else {
      alert(`已開通 ${user.email} 的 ${selectedPlan} 方案！`)
      onSuccess()
    }
    setActivating(false)
  }

  return (
    <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6">
      <h3 className="font-bold mb-3">🔓 開通訂閱</h3>
      <p className="text-sm text-zinc-300 mb-1">用戶：{user.email}</p>
      <p className="text-xs text-zinc-500 mb-3">
        目前狀態：{status.label}
        {user.subscription_expires_at && ` (到期：${formatDate(user.subscription_expires_at)})`}
      </p>
      <div className="flex gap-2 mb-4">
        {SUBSCRIPTION_PLANS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            className={`px-3 py-2 rounded text-sm ${selectedPlan === p.id ? 'bg-blue-600' : 'bg-zinc-700'}`}
          >
            {p.label} ${p.price}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleActivate}
          disabled={activating}
          className="px-4 py-2 bg-green-600 rounded text-sm disabled:opacity-50"
        >
          {activating ? '處理中...' : '確認開通'}
        </button>
        <button onClick={onClose} className="px-4 py-2 bg-zinc-700 rounded text-sm">
          取消
        </button>
      </div>
    </div>
  )
}
