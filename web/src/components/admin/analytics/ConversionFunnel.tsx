'use client'

import { useState } from 'react'

export interface AnalyticsOverview {
  totalClicks: number
  totalTrials: number
  totalConversions: number
  clickToTrialRate: number
  trialToConversionRate: number
  overallConversionRate: number
}

export interface ConversionFunnelProps {
  data: AnalyticsOverview
}

type StageType = 'clicks' | 'trials' | 'conversions' | null

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const [hoveredStage, setHoveredStage] = useState<StageType>(null)

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  const getClicksPerConversion = () => {
    if (data.overallConversionRate === 0) return 0
    return Math.round(100 / data.overallConversionRate)
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">🔄 轉換漏斗</h3>

      <div className="flex items-center justify-between">
        {/* 點擊階段 */}
        <div
          className="relative text-center cursor-pointer"
          onMouseEnter={() => setHoveredStage('clicks')}
          onMouseLeave={() => setHoveredStage(null)}
        >
          <div className={`text-3xl font-bold text-yellow-400 transition-all ${
            hoveredStage === 'clicks' ? 'scale-110' : ''
          }`}>
            {formatNumber(data.totalClicks)}
          </div>
          <div className="text-sm text-gray-400 mt-1">點擊</div>

          {/* Tooltip */}
          {hoveredStage === 'clicks' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2
                            bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                            text-xs text-white whitespace-nowrap shadow-xl z-10">
              來自推廣連結的點擊數
            </div>
          )}
        </div>

        {/* 轉換率進度條 (點擊→試用) */}
        <div className="flex-1 mx-6">
          <div className="text-center text-sm font-medium text-gray-400 mb-2">
            {data.clickToTrialRate.toFixed(1)}% 轉換
          </div>
          <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-blue-500
                         rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, data.clickToTrialRate)}%` }}
            />
          </div>
        </div>

        {/* 試用階段 */}
        <div
          className="relative text-center cursor-pointer"
          onMouseEnter={() => setHoveredStage('trials')}
          onMouseLeave={() => setHoveredStage(null)}
        >
          <div className={`text-3xl font-bold text-blue-400 transition-all ${
            hoveredStage === 'trials' ? 'scale-110' : ''
          }`}>
            {formatNumber(data.totalTrials)}
          </div>
          <div className="text-sm text-gray-400 mt-1">試用</div>

          {hoveredStage === 'trials' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2
                            bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                            text-xs text-white whitespace-nowrap shadow-xl z-10">
              啟用折扣碼試用的用戶數
            </div>
          )}
        </div>

        {/* 第二段轉換率 (試用→付費) */}
        <div className="flex-1 mx-6">
          <div className="text-center text-sm font-medium text-gray-400 mb-2">
            {data.trialToConversionRate.toFixed(1)}% 轉換
          </div>
          <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-green-500
                         rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, data.trialToConversionRate)}%` }}
            />
          </div>
        </div>

        {/* 付費階段 */}
        <div
          className="relative text-center cursor-pointer"
          onMouseEnter={() => setHoveredStage('conversions')}
          onMouseLeave={() => setHoveredStage(null)}
        >
          <div className={`text-3xl font-bold text-green-400 transition-all ${
            hoveredStage === 'conversions' ? 'scale-110' : ''
          }`}>
            {formatNumber(data.totalConversions)}
          </div>
          <div className="text-sm text-gray-400 mt-1">付費</div>

          {hoveredStage === 'conversions' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2
                            bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                            text-xs text-white whitespace-nowrap shadow-xl z-10">
              完成付費訂閱的用戶數
            </div>
          )}
        </div>
      </div>

      {/* 整體轉換率 */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <div className="text-center">
          <span className="text-sm text-gray-400">
            整體轉換率：
          </span>
          <span className="ml-2 text-lg font-bold text-white">
            {data.overallConversionRate.toFixed(2)}%
          </span>
          {data.overallConversionRate > 0 && (
            <span className="ml-2 text-xs text-zinc-500">
              (每 {getClicksPerConversion()} 次點擊 → 1 次付費)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
