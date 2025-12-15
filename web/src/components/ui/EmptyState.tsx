/**
 * EmptyState - 空狀態組件
 * 當列表或數據為空時顯示友好的提示
 */

import React from 'react'

export interface EmptyStateProps {
  /**
   * 主標題
   */
  title: string

  /**
   * 描述文字
   */
  description?: string

  /**
   * 圖標（emoji 或 SVG）
   */
  icon?: React.ReactNode

  /**
   * 操作按鈕
   */
  action?: {
    label: string
    onClick: () => void
  }

  /**
   * 額外的 CSS 類名
   */
  className?: string
}

/**
 * EmptyState 組件
 *
 * @example
 * ```tsx
 * // 基本用法
 * <EmptyState
 *   title="尚無數據"
 *   description="目前還沒有任何記錄"
 * />
 *
 * // 帶圖標
 * <EmptyState
 *   icon="📭"
 *   title="信箱空空"
 *   description="您還沒有收到任何消息"
 * />
 *
 * // 帶操作按鈕
 * <EmptyState
 *   icon="➕"
 *   title="尚未創建課程"
 *   description="點擊下方按鈕創建第一個課程"
 *   action={{
 *     label: '創建課程',
 *     onClick: () => console.log('create')
 *   }}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-12 px-4 text-center
        ${className}
      `}
      role="status"
      aria-label="空狀態"
    >
      {/* 圖標 */}
      {icon && (
        <div
          className="text-6xl mb-4 opacity-50"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* 標題 */}
      <h3 className="text-lg font-semibold text-zinc-300 mb-2">{title}</h3>

      {/* 描述 */}
      {description && (
        <p className="text-sm text-zinc-500 max-w-md mb-6">{description}</p>
      )}

      {/* 操作按鈕 */}
      {action && (
        <button
          onClick={action.onClick}
          className="
            px-4 py-2 rounded-lg
            bg-blue-600 hover:bg-blue-500
            text-white font-medium text-sm
            transition-colors
          "
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/**
 * 預定義的常用空狀態
 */
export const EmptyStatePresets = {
  /**
   * 沒有數據
   */
  NoData: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="📊"
      title="尚無數據"
      description="目前還沒有任何記錄"
      {...props}
    />
  ),

  /**
   * 沒有搜尋結果
   */
  NoSearchResults: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🔍"
      title="未找到結果"
      description="請嘗試其他搜尋關鍵字"
      {...props}
    />
  ),

  /**
   * 沒有課程
   */
  NoLessons: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="📚"
      title="尚未創建課程"
      description="開始創建您的第一個課程"
      {...props}
    />
  ),

  /**
   * 沒有用戶
   */
  NoUsers: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="👥"
      title="尚無用戶"
      description="目前還沒有註冊用戶"
      {...props}
    />
  ),

  /**
   * 沒有訊息
   */
  NoMessages: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="💬"
      title="沒有訊息"
      description="您的收件箱是空的"
      {...props}
    />
  )
}
