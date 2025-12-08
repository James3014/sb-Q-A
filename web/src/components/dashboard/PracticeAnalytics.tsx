'use client'

import { motion } from 'framer-motion'
import type { SkillFrequency } from '@/lib/improvement'

interface PracticeAnalyticsProps {
  data: SkillFrequency[]
}

export function PracticeAnalytics({ data }: PracticeAnalyticsProps) {
  // 無資料狀態
  if (data.length === 0) {
    return (
      <div className="glass-panel rounded-lg p-6 text-center border border-zinc-700/50">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm text-zinc-400 mb-1">尚無練習記錄</p>
        <p className="text-xs text-zinc-500">至少需要 3 次練習才會顯示統計數據</p>
      </div>
    )
  }

  // 計算最大練習次數用於進度條
  const maxCount = Math.max(...data.map(d => d.practice_count), 1)

  return (
    <div className="glass-panel rounded-lg p-6 border border-zinc-700/50">
      {/* 標題區 */}
      <div className="flex items-baseline gap-2 mb-6">
        <h3 className="font-bebas text-2xl tracking-wide">練習頻率分析</h3>
        <span className="text-xs text-zinc-400 font-space-mono">過去 30 天</span>
      </div>

      {/* 技能條列表 */}
      <div className="space-y-4">
        {data.map((item, idx) => {
          const progressPercent = (item.practice_count / maxCount) * 100

          return (
            <motion.div
              key={item.skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4, ease: 'easeOut' }}
              className="group"
            >
              {/* 技能名稱與統計數據 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-medium text-zinc-100 min-w-20">
                    {item.skill}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {item.practice_count} 次
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-space-mono text-amber-400 font-bold">
                    ⭐ {item.avg_rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* 進度條容器 */}
              <div className="relative h-3 bg-zinc-700/40 rounded-full overflow-hidden border border-zinc-700/60">
                {/* 動畫背景漸層 */}
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${progressPercent}%`, opacity: 1 }}
                  transition={{
                    width: { duration: 0.8, delay: idx * 0.08 + 0.1, ease: 'easeOut' },
                    opacity: { duration: 0.3, delay: idx * 0.08 },
                  }}
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full
                    shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-shadow"
                />

                {/* 閃光效果 */}
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{
                    duration: 2,
                    delay: idx * 0.08 + 0.3,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                  }}
                  className="absolute top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </div>

              {/* 最近練習時間 */}
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-xs text-zinc-600">
                  平均評分 {item.avg_rating.toFixed(1)}/5
                </span>
                <span className="text-xs text-zinc-500">
                  最近：{new Date(item.last_practice_date).toLocaleDateString('zh-TW', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 底部摘要 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: data.length * 0.08 + 0.2 }}
        className="mt-6 pt-4 border-t border-zinc-700/50 flex justify-between text-xs text-zinc-400"
      >
        <div className="flex gap-4">
          <div>
            <span className="text-zinc-500">總技能數：</span>
            <span className="text-zinc-100 font-space-mono font-bold">{data.length}</span>
          </div>
          <div>
            <span className="text-zinc-500">總練習次：</span>
            <span className="text-zinc-100 font-space-mono font-bold">
              {data.reduce((sum, d) => sum + d.practice_count, 0)}
            </span>
          </div>
        </div>
        <div>
          <span className="text-zinc-500">平均評分：</span>
          <span className="text-amber-400 font-space-mono font-bold">
            ⭐ {(data.reduce((sum, d) => sum + d.avg_rating, 0) / data.length).toFixed(1)}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
