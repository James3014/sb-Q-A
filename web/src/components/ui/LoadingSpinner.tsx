/**
 * LoadingSpinner - 加載指示器組件
 * 顯示加載中狀態，支持多種樣式和尺寸
 */

import React from 'react'

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerVariant = 'spinner' | 'dots' | 'pulse'

export interface LoadingSpinnerProps {
  /**
   * 尺寸
   * @default 'md'
   */
  size?: SpinnerSize

  /**
   * 樣式變體
   * @default 'spinner'
   */
  variant?: SpinnerVariant

  /**
   * 顯示的文字
   */
  text?: string

  /**
   * 是否全屏居中
   * @default false
   */
  fullscreen?: boolean

  /**
   * 額外的 CSS 類名
   */
  className?: string
}

/**
 * 根據尺寸獲取大小類名
 */
const getSizeClasses = (size: SpinnerSize): string => {
  const sizes: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizes[size]
}

/**
 * 旋轉動畫 Spinner
 */
const SpinnerAnimation: React.FC<{ size: SpinnerSize }> = ({ size }) => {
  const sizeClasses = getSizeClasses(size)

  return (
    <svg
      className={`animate-spin ${sizeClasses}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

/**
 * 點狀動畫
 */
const DotsAnimation: React.FC<{ size: SpinnerSize }> = ({ size }) => {
  const dotSizes: Record<SpinnerSize, string> = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }
  const dotSize = dotSizes[size]

  return (
    <div className="flex items-center gap-1">
      <span
        className={`${dotSize} bg-current rounded-full animate-bounce`}
        style={{ animationDelay: '0ms' }}
        aria-hidden="true"
      />
      <span
        className={`${dotSize} bg-current rounded-full animate-bounce`}
        style={{ animationDelay: '150ms' }}
        aria-hidden="true"
      />
      <span
        className={`${dotSize} bg-current rounded-full animate-bounce`}
        style={{ animationDelay: '300ms' }}
        aria-hidden="true"
      />
    </div>
  )
}

/**
 * 脈衝動畫
 */
const PulseAnimation: React.FC<{ size: SpinnerSize }> = ({ size }) => {
  const sizeClasses = getSizeClasses(size)

  return (
    <div className="relative">
      <div
        className={`${sizeClasses} rounded-full bg-current opacity-75 animate-ping absolute`}
        aria-hidden="true"
      />
      <div
        className={`${sizeClasses} rounded-full bg-current`}
        aria-hidden="true"
      />
    </div>
  )
}

/**
 * LoadingSpinner 組件
 *
 * @example
 * ```tsx
 * // 基本用法
 * <LoadingSpinner />
 *
 * // 帶文字
 * <LoadingSpinner text="載入中..." />
 *
 * // 不同尺寸
 * <LoadingSpinner size="sm" />
 * <LoadingSpinner size="lg" />
 *
 * // 不同樣式
 * <LoadingSpinner variant="dots" />
 * <LoadingSpinner variant="pulse" />
 *
 * // 全屏居中
 * <LoadingSpinner fullscreen text="載入中..." />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullscreen = false,
  className = ''
}) => {
  const animation = {
    spinner: <SpinnerAnimation size={size} />,
    dots: <DotsAnimation size={size} />,
    pulse: <PulseAnimation size={size} />
  }[variant]

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-zinc-400 ${className}`}
      role="status"
      aria-live="polite"
    >
      {animation}
      {text && <p className="text-sm">{text}</p>}
      <span className="sr-only">{text || '載入中'}</span>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm z-50">
        {content}
      </div>
    )
  }

  return content
}

/**
 * 簡化的載入狀態組件（用於頁面級別）
 */
export const PageLoading: React.FC<{ text?: string }> = ({ text = '載入中...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

/**
 * 簡化的內聯載入組件（用於組件級別）
 */
export const InlineLoading: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}
