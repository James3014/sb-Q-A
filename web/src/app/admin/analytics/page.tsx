'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { ModernStatCard, LoadingSpinner, EmptyStateNew as EmptyState } from '@/components/ui'
import { adminGet } from '@/lib/adminApi'

interface AnalyticsData {
  overview: {
    totalClicks: number
    totalTrials: number
    totalConversions: number
    totalCommissions: number
    clickToTrialRate: number
    trialToConversionRate: number
    overallConversionRate: number
  }
  topPerformers: Array<{
    partner_name: string
    coupon_code: string
    clicks: number
    trials: number
    conversions: number
    commissions: number
    roi: number
    clickToTrialRate: number
    trialToConversionRate: number
  }>
  trends: {
    daily: Array<{
      date: string
      clicks: number
      trials: number
      conversions: number
    }>
  }
  insights: string[]
}

export default function AdminAnalyticsPage() {
  const { isReady } = useAdminAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d')

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await adminGet<AnalyticsData>(`/api/admin/analytics?range=${timeRange}`)
      setData(response)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isReady) loadAnalytics()
  }, [isReady, timeRange])

  if (!isReady || loading) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-zinc-900 text-white">
          <AdminHeader title="📊 推廣成效分析" />
          <div className="p-4 max-w-6xl mx-auto">
            <LoadingSpinner text="載入分析數據..." fullscreen />
          </div>
        </main>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-zinc-900 text-white">
          <AdminHeader title="📊 推廣成效分析" />
          <div className="p-4 max-w-6xl mx-auto">
            <EmptyState
              icon="📊"
              title="無法載入分析數據"
              description="請稍後再試或聯繫系統管理員"
              action={{
                label: "重新載入",
                onClick: () => loadAnalytics()
              }}
            />
          </div>
        </main>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="📊 推廣成效分析" />

        <div className="p-4 max-w-6xl mx-auto">
          {/* 時間範圍選擇 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">成效總覽</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === '7d' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                }`}
              >
                7天
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === '30d' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                }`}
              >
                30天
              </button>
            </div>
          </div>

          {/* KPI 總覽 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <ModernStatCard
              label="總點擊數"
              value={data.overview.totalClicks}
              icon="👆"
              subtitle="來自推廣連結"
            />
            <ModernStatCard
              label="總試用數"
              value={data.overview.totalTrials}
              change={`${data.overview.clickToTrialRate.toFixed(1)}%`}
              trend="neutral"
              icon="🎫"
              subtitle="啟用折扣碼"
            />
            <ModernStatCard
              label="總轉換數"
              value={data.overview.totalConversions}
              change={`${data.overview.trialToConversionRate.toFixed(1)}%`}
              trend="neutral"
              icon="✅"
              subtitle="完成付費"
            />
            <ModernStatCard
              label="總分潤額"
              value={`NT$${Math.round(data.overview.totalCommissions).toLocaleString()}`}
              icon="💰"
              subtitle="累計佣金"
            />
          </div>

          {/* 轉換漏斗 */}
          <div className="bg-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="font-bold mb-4">🔄 轉換漏斗</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{data.overview.totalClicks}</div>
                <div className="text-sm text-gray-400">點擊</div>
              </div>
              <div className="flex-1 mx-4">
                <div className="text-center text-sm text-gray-400 mb-1">
                  {data.overview.clickToTrialRate.toFixed(1)}%
                </div>
                <div className="h-2 bg-zinc-700 rounded">
                  <div 
                    className="h-2 bg-blue-500 rounded" 
                    style={{ width: `${data.overview.clickToTrialRate}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{data.overview.totalTrials}</div>
                <div className="text-sm text-gray-400">試用</div>
              </div>
              <div className="flex-1 mx-4">
                <div className="text-center text-sm text-gray-400 mb-1">
                  {data.overview.trialToConversionRate.toFixed(1)}%
                </div>
                <div className="h-2 bg-zinc-700 rounded">
                  <div 
                    className="h-2 bg-green-500 rounded" 
                    style={{ width: `${data.overview.trialToConversionRate}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{data.overview.totalConversions}</div>
                <div className="text-sm text-gray-400">付費</div>
              </div>
            </div>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-400">
                整體轉換率：<span className="text-white font-bold">{data.overview.overallConversionRate.toFixed(1)}%</span>
              </span>
            </div>
          </div>

          {/* 合作方排行榜 */}
          <div className="bg-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="font-bold mb-4">🏆 合作方排行榜</h3>
            <div className="space-y-3">
              {data.topPerformers.map((performer, index) => (
                <div key={performer.coupon_code} className="flex items-center justify-between p-3 bg-zinc-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-600' : 
                      index === 1 ? 'bg-gray-500' : 
                      index === 2 ? 'bg-amber-600' : 'bg-zinc-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{performer.partner_name}</div>
                      <div className="text-sm text-gray-400">{performer.coupon_code}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-bold text-green-400">{performer.conversions} 轉換</div>
                    <div className="text-gray-400">
                      {performer.clicks}點擊 → {performer.trials}試用 → {performer.conversions}付費
                    </div>
                    <div className="text-purple-400">NT${Math.round(performer.commissions)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 智能洞察 */}
          {data.insights.length > 0 && (
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600/30 rounded-lg p-6">
              <h3 className="font-bold mb-4">💡 智能洞察</h3>
              <div className="space-y-2">
                {data.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  )
}
