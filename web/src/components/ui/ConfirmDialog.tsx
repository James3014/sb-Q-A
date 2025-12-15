/**
 * ConfirmDialog - 確認對話框組件
 * 用於確認重要操作（刪除、提交等）
 */

'use client'

import React, { useEffect, useRef } from 'react'

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info'

export interface ConfirmDialogProps {
  /**
   * 是否顯示對話框
   */
  isOpen: boolean

  /**
   * 關閉對話框回調
   */
  onClose: () => void

  /**
   * 確認回調
   */
  onConfirm: () => void | Promise<void>

  /**
   * 對話框標題
   */
  title: string

  /**
   * 對話框內容
   */
  message: string

  /**
   * 變體（決定顏色和語氣）
   * @default 'warning'
   */
  variant?: ConfirmDialogVariant

  /**
   * 確認按鈕文字
   * @default '確認'
   */
  confirmText?: string

  /**
   * 取消按鈕文字
   * @default '取消'
   */
  cancelText?: string

  /**
   * 是否正在處理（顯示 loading 狀態）
   * @default false
   */
  isLoading?: boolean
}

/**
 * 根據變體獲取樣式
 */
const getVariantStyles = (variant: ConfirmDialogVariant) => {
  const styles: Record<ConfirmDialogVariant, { icon: string; buttonClass: string }> = {
    danger: {
      icon: '⚠️',
      buttonClass: 'bg-red-600 hover:bg-red-500'
    },
    warning: {
      icon: '❗',
      buttonClass: 'bg-amber-600 hover:bg-amber-500'
    },
    info: {
      icon: 'ℹ️',
      buttonClass: 'bg-blue-600 hover:bg-blue-500'
    }
  }
  return styles[variant]
}

/**
 * ConfirmDialog 組件
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 *
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={async () => {
 *     await deleteItem()
 *     setIsOpen(false)
 *   }}
 *   title="刪除確認"
 *   message="確定要刪除此項目嗎？此操作無法撤銷。"
 *   variant="danger"
 *   confirmText="刪除"
 * />
 * ```
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'warning',
  confirmText = '確認',
  cancelText = '取消',
  isLoading = false
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const { icon, buttonClass } = getVariantStyles(variant)

  /**
   * 處理確認操作
   */
  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      console.error('Confirm action failed:', error)
    }
  }

  /**
   * ESC 鍵關閉
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isLoading, onClose])

  /**
   * 點擊背景關閉
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  /**
   * 鎖定背景滾動
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/70 backdrop-blur-sm
        p-4
      "
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        ref={dialogRef}
        className="
          bg-zinc-800 rounded-lg
          max-w-md w-full
          p-6 shadow-xl
          border border-zinc-700
          animate-in fade-in zoom-in duration-200
        "
        onClick={e => e.stopPropagation()}
      >
        {/* 圖標 + 標題 */}
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
          <div className="flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-lg font-semibold text-white"
            >
              {title}
            </h2>
          </div>
        </div>

        {/* 訊息 */}
        <p
          id="confirm-dialog-message"
          className="text-sm text-zinc-400 mb-6 pl-12"
        >
          {message}
        </p>

        {/* 按鈕 */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              px-4 py-2 rounded-lg
              bg-zinc-700 hover:bg-zinc-600
              text-white font-medium text-sm
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-lg
              ${buttonClass}
              text-white font-medium text-sm
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            `}
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
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
            )}
            {isLoading ? '處理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * useConfirmDialog Hook
 * 簡化 ConfirmDialog 的使用
 *
 * @example
 * ```tsx
 * const { openConfirm, ConfirmDialogComponent } = useConfirmDialog()
 *
 * const handleDelete = async () => {
 *   const confirmed = await openConfirm({
 *     title: '刪除確認',
 *     message: '確定要刪除嗎？',
 *     variant: 'danger'
 *   })
 *
 *   if (confirmed) {
 *     // 執行刪除
 *   }
 * }
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>刪除</button>
 *     <ConfirmDialogComponent />
 *   </>
 * )
 * ```
 */
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean
    config: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'> | null
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    config: null,
    resolve: null
  })

  const openConfirm = (
    config: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>
  ): Promise<boolean> => {
    return new Promise(resolve => {
      setDialogState({
        isOpen: true,
        config,
        resolve
      })
    })
  }

  const handleClose = () => {
    dialogState.resolve?.(false)
    setDialogState({ isOpen: false, config: null, resolve: null })
  }

  const handleConfirm = () => {
    dialogState.resolve?.(true)
    setDialogState({ isOpen: false, config: null, resolve: null })
  }

  const ConfirmDialogComponent = () => {
    if (!dialogState.config) return null

    return (
      <ConfirmDialog
        {...dialogState.config}
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    )
  }

  return {
    openConfirm,
    ConfirmDialogComponent
  }
}
