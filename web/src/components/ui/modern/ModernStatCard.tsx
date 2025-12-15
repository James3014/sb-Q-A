/**
 * ModernStatCard Component
 *
 * 現代化統計卡片組件，用於展示關鍵指標
 * 參考 Square UI 設計系統
 *
 * @example
 * ```tsx
 * <ModernStatCard
 *   label="總用戶數"
 *   value={1234}
 *   change="+12.5%"
 *   trend="up"
 *   icon="👥"
 *   subtitle="較上月增加"
 * />
 * ```
 */

import { ReactNode } from 'react'

/**
 * 趨勢方向
 */
export type TrendDirection = 'up' | 'down' | 'neutral'

/**
 * ModernStatCard 組件屬性
 */
export interface ModernStatCardProps {
  /** 統計標籤 */
  label: string
  /** 統計數值（支援字串或數字） */
  value: string | number
  /** 變化百分比（如 "+12.5%" 或 "-3.2%"） */
  change?: string
  /** 趨勢方向 */
  trend?: TrendDirection
  /** 圖示（emoji 或 React 節點） */
  icon?: ReactNode
  /** 副標題說明 */
  subtitle?: string
  /** 自定義 CSS 類別 */
  className?: string
}

/**
 * 格式化數值（添加千位分隔符）
 */
function formatValue(value: string | number): string {
  if (typeof value === 'string') {
    return value
  }
  return value.toLocaleString('en-US')
}

/**
 * 趨勢圖示組件
 */
function TrendIcon({ trend }: { trend: TrendDirection }) {
  if (trend === 'up') {
    return (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    )
  }

  if (trend === 'down') {
    return (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17l-5-5m0 0l5-5m-5 5h12" />
      </svg>
    )
  }

  return null
}

/**
 * ModernStatCard 組件
 */
export function ModernStatCard({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  subtitle,
  className = '',
}: ModernStatCardProps) {
  // 趨勢顏色映射
  const trendColors: Record<TrendDirection, string> = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-zinc-400',
  }

  const trendColor = trendColors[trend]
  const formattedValue = formatValue(value)

  return (
    <div
      className={`group relative rounded-lg border border-zinc-800 bg-zinc-900/50 p-6
                  transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50
                  ${className}`}
    >
      <div className="flex items-start justify-between">
        {/* 左側：標籤和數值 */}
        <div className="flex-1">
          {/* 標籤 */}
          <p className="text-sm font-medium text-zinc-400">{label}</p>

          {/* 數值和趨勢 */}
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-white">
              {formattedValue}
            </p>

            {/* 趨勢指標 */}
            {change && (
              <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                <TrendIcon trend={trend} />
                <span>{change}</span>
              </div>
            )}
          </div>

          {/* 副標題 */}
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>

        {/* 右側：圖示 */}
        {icon && (
          <div className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 預設統計卡片模板
 */
export const ModernStatCardPresets = {
  /** 用戶統計 */
  Users: (count: number, change?: string) => (
    <ModernStatCard
      label="總用戶數"
      value={count}
      change={change}
      trend={change && change.startsWith('+') ? 'up' : change && change.startsWith('-') ? 'down' : 'neutral'}
      icon="👥"
    />
  ),

  /** 收入統計 */
  Revenue: (amount: string, change?: string) => (
    <ModernStatCard
      label="總收入"
      value={amount}
      change={change}
      trend={change && change.startsWith('+') ? 'up' : change && change.startsWith('-') ? 'down' : 'neutral'}
      icon="💰"
    />
  ),

  /** 轉換率統計 */
  Conversion: (rate: string, change?: string) => (
    <ModernStatCard
      label="轉換率"
      value={rate}
      change={change}
      trend={change && change.startsWith('+') ? 'up' : change && change.startsWith('-') ? 'down' : 'neutral'}
      icon="📊"
    />
  ),

  /** 點擊統計 */
  Clicks: (count: number, change?: string) => (
    <ModernStatCard
      label="總點擊數"
      value={count}
      change={change}
      trend={change && change.startsWith('+') ? 'up' : change && change.startsWith('-') ? 'down' : 'neutral'}
      icon="👆"
    />
  ),
}
