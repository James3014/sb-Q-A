'use client'

import { useState } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { useAffiliates } from '@/hooks/useAffiliates'
import { useAffiliateUsers } from '@/hooks/useAffiliateUsers'
import { AffiliateStats } from '@/components/affiliate/AffiliateStats'
import { AffiliateForm } from '@/components/affiliate/AffiliateForm'
import { AffiliateList } from '@/components/affiliate/AffiliateList'
import { AffiliateUserList } from '@/components/affiliate/AffiliateUserList'
import { UI_CONSTANTS } from '@/constants/affiliate'

export default function AdminAffiliatesPage() {
  const { isReady } = useAdminAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const { 
    affiliates, 
    loading, 
    error, 
    stats, 
    createAffiliate, 
    toggleAffiliate 
  } = useAffiliates()
  
  const { 
    expandedAffiliate, 
    affiliateUsers, 
    loadingUsers, 
    toggleExpanded 
  } = useAffiliateUsers()

  if (!isReady || loading) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-zinc-900 text-white">
          <AdminHeader title="🤝 合作方管理" />
          <div className="p-4 max-w-6xl mx-auto">
            <div className="text-center py-8">載入中...</div>
          </div>
        </main>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-zinc-900 text-white">
          <AdminHeader title="🤝 合作方管理" />
          <div className="p-4 max-w-6xl mx-auto">
            <div className="text-center py-8 text-red-400">
              載入失敗: {error}
            </div>
          </div>
        </main>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="🤝 合作方管理" />

        <div className="p-4 max-w-6xl mx-auto">
          <AffiliateStats stats={stats} />

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">合作方列表</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className={UI_CONSTANTS.BUTTONS.PRIMARY}
            >
              + 新增合作方
            </button>
          </div>

          {showCreateForm && (
            <AffiliateForm
              onSubmit={createAffiliate}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          <AffiliateList
            affiliates={affiliates}
            expandedAffiliate={expandedAffiliate}
            onToggleExpanded={toggleExpanded}
            onToggleStatus={toggleAffiliate}
          />

          {expandedAffiliate && (
            <AffiliateUserList
              users={affiliateUsers[expandedAffiliate] || []}
              loading={loadingUsers[expandedAffiliate] || false}
            />
          )}
        </div>
      </main>
    </AdminLayout>
  )
}
