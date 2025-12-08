'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getPracticeLogs, PracticeLog } from '@/lib/practice'
import { getLessons, Lesson } from '@/lib/lessons'
import { getImprovementData, ImprovementData } from '@/lib/improvement'
import { LoadingState, LockedState, PageHeader, PageContainer } from '@/components/ui'
import { ImprovementDashboard } from '@/components/ImprovementDashboard'
import { PracticeLogs } from '@/components/practice/PracticeLogs'
import { motion } from 'framer-motion'

// 🆕 免費用戶預覽組件
function LockedDashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* 模糊的圖表預覽 */}
      <div className="relative bg-gradient-to-b from-zinc-800/30 to-zinc-900/20 rounded-lg p-6
        border border-zinc-700/50 overflow-hidden">
        {/* 模糊層 */}
        <div className="absolute inset-0 backdrop-blur-sm bg-zinc-900/40 rounded-lg z-10
          flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="font-bebas text-2xl mb-2 text-white">深度練習分析為 PRO 功能</h3>
            <p className="text-zinc-300 text-sm mb-6">
              升級後解鎖：
            </p>
            <ul className="text-sm text-zinc-300 space-y-2 mb-6 text-left inline-block">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> 練習頻率深度分析
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> 技能進步曲線圖表
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> 個人化學習建議
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> 30 天完整統計
              </li>
            </ul>

            <Link
              href="/pricing"
              className="inline-block px-8 py-3
                bg-gradient-to-r from-amber-500 to-orange-500
                text-zinc-900 font-bebas text-lg tracking-wide rounded-lg
                shadow-lg shadow-amber-500/30
                hover:shadow-xl hover:shadow-amber-500/50
                transition-all transform hover:scale-105"
            >
              查看 PRO 方案 →
            </Link>
          </div>
        </div>

        {/* 模糊的背景圖表（視覺參考） */}
        <div className="space-y-6 pointer-events-none">
          {/* 練習頻率卡片骨架 */}
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg" />
            ))}
          </div>

          {/* 技能選擇器骨架 */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-20 bg-zinc-700/30 rounded-full" />
            ))}
          </div>

          {/* 進度曲線圖骨架 */}
          <div className="h-48 bg-gradient-to-b from-zinc-800/30 to-transparent rounded-lg" />
        </div>
      </div>

      {/* 基礎統計卡片（可見） */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel rounded-lg p-4 border border-zinc-700/50">
          <p className="text-xs text-zinc-500 mb-2">基礎功能：已啟用</p>
          <p className="text-lg font-bebas text-white">練習紀錄</p>
          <p className="text-xs text-zinc-400 mt-1">切換到「練習紀錄」標籤查看</p>
        </div>
        <div className="glass-panel rounded-lg p-4 border border-zinc-700/50">
          <p className="text-xs text-zinc-500 mb-2">升級解鎖</p>
          <p className="text-lg font-bebas text-amber-400">深度分析</p>
          <p className="text-xs text-zinc-400 mt-1">訂閱 PRO 查看全部</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function PracticePage() {
  const { user, loading, subscription, subscriptionVersion } = useAuth()
  const [logs, setLogs] = useState<PracticeLog[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [improvement, setImprovement] = useState<ImprovementData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [tab, setTab] = useState<'dashboard' | 'logs'>('logs')

  // 🆕 調整③ 功能開關（Day 30 才啟用）
  const enableAdjustment3 = process.env.NEXT_PUBLIC_ENABLE_ADJUSTMENT_3 === 'true'

  useEffect(() => {
    // 等待 auth 載入完成
    if (loading) return

    // 重置載入狀態（當 subscriptionVersion 變更時）
    setLoadingData(true)

    const load = async () => {
      const allLessons = await getLessons()
      setLessons(allLessons)
      if (user) {
        const [logsData, improvementData] = await Promise.all([
          getPracticeLogs(user.id),
          getImprovementData(user.id),
        ])
        setLogs(logsData)
        setImprovement(improvementData)
      }
      setLoadingData(false)
    }
    load()
  }, [user, loading, subscriptionVersion])

  if (loading || loadingData) return <LoadingState />

  // 🆕 未登入用戶 → 完全鎖定
  if (!user) {
    return <LockedState title="練習紀錄為付費功能" description="登入後可紀錄練習進度" showLogin={true} />
  }

  return (
    <PageContainer>
      <PageHeader title="練習中心" emoji="🏂" />

      <div className="flex border-b border-zinc-800">
        {enableAdjustment3 && (
          <button
            onClick={() => setTab('dashboard')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'dashboard' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400'}`}
          >
            📊 改善儀表板
          </button>
        )}
        <button
          onClick={() => setTab('logs')}
          className={`flex-1 py-3 text-sm font-medium ${tab === 'logs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400'}`}
        >
          📝 練習紀錄
        </button>
      </div>

      {enableAdjustment3 && tab === 'dashboard' ? (
        // 🆕 免費用戶 → 顯示預覽；PRO 用戶 → 顯示完整儀表板
        !subscription.isActive ? (
          <LockedDashboardPreview />
        ) : improvement ? (
          <ImprovementDashboard data={improvement} lessons={lessons} />
        ) : (
          <div className="p-4 text-center text-zinc-400">載入中...</div>
        )
      ) : (
        <PracticeLogs logs={logs} lessons={lessons} />
      )}
    </PageContainer>
  )
}
