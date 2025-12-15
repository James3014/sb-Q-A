/**
 * LessonsContainer
 * 課程管理容器組件 - 狀態管理和業務邏輯
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LessonStat } from '@/lib/adminData'
import { LessonHeatmap } from '@/components/LessonHeatmap'
import { LessonsStatsView } from './views/LessonsStatsView'
import { EffectivenessView } from './views/EffectivenessView'
import { HealthView } from './views/HealthView'
import { ManageView } from './views/ManageView'
import type { AdminLessonsData } from '@/hooks/useAdminLessons'

interface Props {
  data: AdminLessonsData
  visibleLessons: any[]
  loading: boolean
  actionLoading: boolean
  actionError: string | null
  onRefresh: () => void
  onDelete: (id: string) => Promise<void>
}

type TabType = 'stats' | 'effectiveness' | 'health' | 'heatmap' | 'manage'

export function LessonsContainer({
  data,
  visibleLessons,
  loading,
  actionLoading,
  actionError,
  onRefresh,
  onDelete
}: Props) {
  const router = useRouter()

  // UI 狀態
  const [tab, setTab] = useState<TabType>('stats')
  const [sortBy, setSortBy] = useState<'views' | 'practices' | 'favorites'>('views')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterPremium, setFilterPremium] = useState<string>('all')

  /**
   * 篩選和排序邏輯
   */
  const filteredAndSortedLessons = useMemo(() => {
    let filtered = data.lessonStats

    // 應用篩選
    if (filterLevel !== 'all') {
      filtered = filtered.filter(l => l.level_tags?.includes(filterLevel))
    }

    if (filterPremium === 'free') {
      filtered = filtered.filter(l => !l.is_premium)
    } else if (filterPremium === 'pro') {
      filtered = filtered.filter(l => l.is_premium)
    }

    // 應用排序
    return [...filtered].sort((a, b) => b[sortBy] - a[sortBy])
  }, [data.lessonStats, filterLevel, filterPremium, sortBy])

  /**
   * 導航處理
   */
  const handleCreate = useCallback(() => {
    router.push('/admin/lessons/create')
  }, [router])

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/admin/lessons/${id}/edit`)
    },
    [router]
  )

  /**
   * Tab 按鈕配置
   */
  const tabs = [
    { key: 'stats', label: '📊 熱門' },
    { key: 'effectiveness', label: '🎯 有效度' },
    { key: 'health', label: '🩺 健康度' },
    { key: 'heatmap', label: '🔥 熱力圖' },
    { key: 'manage', label: '🛠 課程管理' }
  ] as const

  return (
    <>
      {/* Tab 切換 */}
      <div className="flex border-b border-zinc-800">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as TabType)}
            className={`flex-1 py-3 text-sm font-medium ${
              tab === t.key
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-zinc-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 內容區域 */}
      <div className="p-4 max-w-4xl mx-auto">
        {loading && tab !== 'manage' ? (
          <p className="text-zinc-500">載入中...</p>
        ) : tab === 'stats' ? (
          <LessonsStatsView
            lessons={filteredAndSortedLessons}
            filterBar={{
              filterLevel,
              onFilterLevelChange: setFilterLevel,
              filterPremium,
              onFilterPremiumChange: setFilterPremium,
              sortBy,
              onSortByChange: setSortBy
            }}
          />
        ) : tab === 'effectiveness' ? (
          <EffectivenessView effectiveness={data.effectiveness} />
        ) : tab === 'health' ? (
          <HealthView health={data.health} allLessons={data.lessons} />
        ) : tab === 'heatmap' ? (
          <LessonHeatmap lessons={data.lessons} stats={data.lessonStats} />
        ) : (
          <ManageView
            lessons={visibleLessons}
            loading={loading || actionLoading}
            error={actionError}
            onRefresh={onRefresh}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={onDelete}
          />
        )}
      </div>
    </>
  )
}
