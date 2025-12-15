/**
 * StatusBadge - 狀態標籤組件
 * 用於顯示各種狀態（活躍、已過期、待處理等）
 */

import React from 'react'

export type StatusVariant =
  | 'success' // 綠色 - 成功、活躍、啟用
  | 'error' // 紅色 - 錯誤、已過期、停用
  | 'warning' // 黃色 - 警告、待處理
  | 'info' // 藍色 - 信息、進行中
  | 'neutral' // 灰色 - 中性、默認

export type StatusSize = 'sm' | 'md' | 'lg'

export interface StatusBadgeProps {
  /**
   * 狀態變體（決定顏色）
   */
  variant: StatusVariant

  /**
   * 顯示文字
   */
  children: React.ReactNode

  /**
   * 尺寸
   * @default 'md'
   */
  size?: StatusSize

  /**
   * 是否顯示圓點指示器
   * @default false
   */
  showDot?: boolean

  /**
   * 額外的 CSS 類名
   */
  className?: string
}

/**
 * 根據變體獲取顏色類名
 */
const getVariantClasses = (variant: StatusVariant): string => {
  const variants: Record<StatusVariant, string> = {
    success: 'bg-green-900 text-green-300 border-green-700',
    error: 'bg-red-900 text-red-300 border-red-700',
    warning: 'bg-amber-900 text-amber-300 border-amber-700',
    info: 'bg-blue-900 text-blue-300 border-blue-700',
    neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700'
  }
  return variants[variant]
}

/**
 * 根據變體獲取圓點顏色類名
 */
const getDotClasses = (variant: StatusVariant): string => {
  const dots: Record<StatusVariant, string> = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
    neutral: 'bg-zinc-400'
  }
  return dots[variant]
}

/**
 * 根據尺寸獲取大小類名
 */
const getSizeClasses = (size: StatusSize): string => {
  const sizes: Record<StatusSize, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }
  return sizes[size]
}

/**
 * StatusBadge 組件
 *
 * @example
 * ```tsx
 * // 基本用法
 * <StatusBadge variant="success">已啟用</StatusBadge>
 * <StatusBadge variant="error">已過期</StatusBadge>
 * <StatusBadge variant="warning">待處理</StatusBadge>
 *
 * // 帶圓點指示器
 * <StatusBadge variant="success" showDot>在線</StatusBadge>
 *
 * // 不同尺寸
 * <StatusBadge variant="info" size="sm">小</StatusBadge>
 * <StatusBadge variant="info" size="lg">大</StatusBadge>
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  children,
  size = 'md',
  showDot = false,
  className = ''
}) => {
  const variantClasses = getVariantClasses(variant)
  const sizeClasses = getSizeClasses(size)
  const dotClasses = getDotClasses(variant)

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-md border font-medium whitespace-nowrap
        ${variantClasses}
        ${sizeClasses}
        ${className}
      `}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotClasses}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

/**
 * 預定義的常用狀態標籤
 */
export const StatusBadgePresets = {
  Active: () => <StatusBadge variant="success" showDot>活躍</StatusBadge>,
  Inactive: () => <StatusBadge variant="neutral">停用</StatusBadge>,
  Expired: () => <StatusBadge variant="error">已過期</StatusBadge>,
  Pending: () => <StatusBadge variant="warning">待處理</StatusBadge>,
  Processing: () => <StatusBadge variant="info" showDot>處理中</StatusBadge>,
  Completed: () => <StatusBadge variant="success">已完成</StatusBadge>,
  Failed: () => <StatusBadge variant="error">失敗</StatusBadge>
}
