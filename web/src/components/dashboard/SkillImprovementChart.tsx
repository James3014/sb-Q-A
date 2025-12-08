'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import type { ImprovementPoint } from '@/lib/improvement'

interface SkillImprovementChartProps {
  skillName: string
  data: ImprovementPoint[]
}

export function SkillImprovementChart({ skillName, data }: SkillImprovementChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // 無資料狀態
  if (data.length === 0) {
    return (
      <div className="glass-panel rounded-lg p-6 text-center border border-zinc-700/50">
        <div className="text-4xl mb-3">📈</div>
        <p className="text-sm text-zinc-400">
          「{skillName}」尚無練習數據
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          練習此技能後將出現進度曲線
        </p>
      </div>
    )
  }

  // 常數定義
  const maxRating = 5
  const minRating = 1
  const range = maxRating - minRating

  // 計算進步幅度
  const startRating = data[0]?.avg_rating || 0
  const endRating = data[data.length - 1]?.avg_rating || 0
  const improvement = endRating - startRating
  const isImproving = improvement > 0

  return (
    <div className="glass-panel rounded-lg p-6 border border-zinc-700/50">
      {/* 標題區 */}
      <div className="flex items-baseline gap-3 mb-2">
        <h3 className="font-bebas text-2xl tracking-wide">{skillName}</h3>
        <span className="text-xs text-zinc-400">進步曲線</span>
      </div>
      <p className="text-xs text-zinc-500 mb-6">過去 30 天評分變化趨勢</p>

      {/* 圖表容器 */}
      <div className="relative bg-gradient-to-b from-zinc-800/50 to-zinc-900/30 rounded-lg p-4
        border border-zinc-700/50 overflow-hidden">
        {/* 背景網格線 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {[1, 2, 3, 4, 5].map((v) => (
            <div
              key={v}
              className="absolute left-0 right-0 border-t border-zinc-600"
              style={{
                top: `${((maxRating - v) / range) * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Y 軸標籤 */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between
          text-xs text-zinc-500 select-none py-4 px-2">
          {[5, 4, 3, 2, 1].map((v) => (
            <span key={v} className="text-center leading-none font-space-mono text-xs">
              {v}⭐
            </span>
          ))}
        </div>

        {/* 實際圖表區域 */}
        <div className="ml-14 h-48 flex items-end gap-1 relative">
          {data.map((point, idx) => {
            const heightPercent = ((point.avg_rating - minRating) / range) * 100
            const isHovered = hoveredIdx === idx

            return (
              <div
                key={`${point.date}-${idx}`}
                className="flex-1 relative group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* 柱狀條背景 */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-zinc-700/30 rounded-t-sm"
                  style={{ height: '100%' }}
                />

                {/* 動畫柱狀條 */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: `${heightPercent}%`,
                    opacity: 1,
                  }}
                  transition={{
                    height: { duration: 0.6, delay: idx * 0.04, ease: 'easeOut' },
                    opacity: { duration: 0.3, delay: idx * 0.04 },
                  }}
                  className="absolute bottom-0 left-0 right-0 rounded-t
                    bg-gradient-to-t from-brand-red via-red-400 to-red-300
                    shadow-lg shadow-red-500/30 transition-all"
                  style={{
                    minHeight: '2px',
                    transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                    transformOrigin: 'bottom',
                  }}
                />

                {/* Tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      bg-zinc-950 border border-zinc-700 rounded-lg
                      text-white text-xs px-3 py-2 whitespace-nowrap
                      shadow-xl shadow-zinc-950/80 z-10
                      pointer-events-none"
                  >
                    <div className="font-bebas text-sm mb-1">
                      {new Date(point.date).toLocaleDateString('zh-TW', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex gap-3 text-[11px]">
                      <div>
                        <span className="text-zinc-400">評分</span>
                        <span className="text-amber-300 ml-1 font-bold">
                          {point.avg_rating.toFixed(1)} ⭐
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400">練習</span>
                        <span className="text-blue-300 ml-1 font-bold">
                          {point.practice_count}次
                        </span>
                      </div>
                    </div>

                    {/* 進度指示器 */}
                    {idx === 0 && (
                      <div className="text-[10px] text-zinc-500 mt-1 border-t border-zinc-700 pt-1">
                        起始點
                      </div>
                    )}
                    {idx === data.length - 1 && (
                      <div className="text-[10px] text-zinc-500 mt-1 border-t border-zinc-700 pt-1">
                        最新點
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>

        {/* X 軸標籤（僅顯示首尾） */}
        <div className="absolute bottom-0 left-0 right-0 h-8 ml-14 flex justify-between
          text-[10px] text-zinc-600 px-1 pointer-events-none">
          <span>
            {new Date(data[0].date).toLocaleDateString('zh-TW', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span>
            {new Date(data[data.length - 1].date).toLocaleDateString('zh-TW', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* 進步摘要卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 grid grid-cols-3 gap-3"
      >
        {/* 起始評分 */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-500 mb-1">起始評分</div>
          <div className="text-lg font-bebas text-white">
            {startRating.toFixed(1)} ⭐
          </div>
          <div className="text-[10px] text-zinc-600 mt-1">
            {new Date(data[0].date).toLocaleDateString('zh-TW')}
          </div>
        </div>

        {/* 進度指示器 */}
        <div className={`bg-zinc-800/50 border rounded-lg p-3 text-center ${
          isImproving
            ? 'border-green-700/50'
            : improvement < 0
            ? 'border-amber-700/50'
            : 'border-zinc-700/50'
        }`}>
          <div className="text-xs text-zinc-500 mb-1">進度</div>
          <div className={`text-xl font-bebas ${
            isImproving ? 'text-green-400' :
            improvement < 0 ? 'text-amber-400' : 'text-zinc-400'
          }`}>
            {isImproving ? '↗️' : improvement < 0 ? '↘️' : '→'}
          </div>
          <div className={`text-sm font-bold mt-1 ${
            isImproving ? 'text-green-400' :
            improvement < 0 ? 'text-amber-400' : 'text-zinc-400'
          }`}>
            {improvement > 0 ? '+' : ''}{improvement.toFixed(2)}
          </div>
        </div>

        {/* 最新評分 */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-500 mb-1">最新評分</div>
          <div className="text-lg font-bebas text-white">
            {endRating.toFixed(1)} ⭐
          </div>
          <div className="text-[10px] text-zinc-600 mt-1">
            {new Date(data[data.length - 1].date).toLocaleDateString('zh-TW')}
          </div>
        </div>
      </motion.div>

      {/* 統計摘要 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 pt-4 border-t border-zinc-700/50 grid grid-cols-2 gap-4 text-xs"
      >
        <div>
          <span className="text-zinc-500">總練習天數：</span>
          <span className="text-zinc-100 font-space-mono ml-2 font-bold">{data.length}</span>
        </div>
        <div>
          <span className="text-zinc-500">總練習次數：</span>
          <span className="text-zinc-100 font-space-mono ml-2 font-bold">
            {data.reduce((sum, d) => sum + d.practice_count, 0)}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">平均評分：</span>
          <span className="text-amber-400 font-space-mono ml-2 font-bold">
            {(data.reduce((sum, d) => sum + d.avg_rating, 0) / data.length).toFixed(2)} ⭐
          </span>
        </div>
        <div>
          <span className="text-zinc-500">評分範圍：</span>
          <span className="text-zinc-100 font-space-mono ml-2 font-bold">
            {Math.min(...data.map(d => d.avg_rating)).toFixed(1)} - {Math.max(...data.map(d => d.avg_rating)).toFixed(1)}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
