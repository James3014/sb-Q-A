'use client'

import Link from 'next/link'

interface PurchaseConfirmModalProps {
  isOpen: boolean
  planName: string
  price: string
  onConfirm: () => void
  onCancel: () => void
}

export function PurchaseConfirmModal({ 
  isOpen, 
  planName, 
  price, 
  onConfirm, 
  onCancel 
}: PurchaseConfirmModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onCancel}
      />

      {/* 確認對話框 */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">確認購買</h3>
          
          <div className="bg-zinc-900 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{planName}</span>
              <span className="text-xl font-bold text-blue-400">{price}</span>
            </div>
          </div>

          <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-amber-400 mb-2">⚠️ 重要提醒</h4>
            <div className="text-sm text-amber-100 space-y-1">
              <p>• 本服務屬數位內容，付款後立即開通</p>
              <p>• <strong>恕不提供退費服務</strong></p>
              <p>• 建議先體驗免費內容確認需求</p>
            </div>
          </div>

          <div className="text-xs text-zinc-400 mb-6">
            購買即表示同意 
            <Link href="/terms" className="text-blue-400 hover:underline mx-1">
              服務條款
            </Link>
            與退費政策
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-3 rounded-lg font-medium transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors"
            >
              確認購買
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
