'use client'

import { useState } from 'react'
import { vibrate } from '@/components/ui'
import { InlinePracticeCard } from '@/components/practice/InlinePracticeCard'

interface Props {
  isFav: boolean
  favLoading: boolean
  onToggleFav: () => void
  onShare: () => void
  onPractice: (ratings: { r1: number; r2: number; r3: number }) => Promise<void>
  showPractice: boolean
  isCompleted?: boolean
}

export function BottomActionBar({ 
  isFav, 
  favLoading, 
  onToggleFav, 
  onShare, 
  onPractice,
  showPractice,
  isCompleted 
}: Props) {
  const [showCard, setShowCard] = useState(false)

  const handleFav = () => {
    vibrate(20)
    onToggleFav()
  }

  const handleShare = () => {
    vibrate(20)
    onShare()
  }

  const handlePracticeClick = () => {
    vibrate([50, 30, 50])
    setShowCard(true)
  }

  return (
    <>
      {/* 嵌入式評分卡 */}
      {showCard && (
        <InlinePracticeCard 
          onSubmit={async (ratings) => {
            await onPractice(ratings)
          }}
          onClose={() => setShowCard(false)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-700 px-4 py-3 pb-safe z-40">
        <div className="max-w-lg mx-auto">
          {/* 次要按鈕（收藏 + 分享，移到頂部） */}
          <div className="flex gap-3 mb-3">
            <button 
              onClick={handleFav} 
              disabled={favLoading}
              className="flex-1 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-sm font-semibold flex items-center justify-center gap-2"
            >
              {favLoading ? '⏳' : isFav ? '❤️ 已收藏' : '🤍 收藏'}
            </button>

            <button 
              onClick={handleShare}
              className="flex-1 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-sm font-semibold flex items-center justify-center gap-2"
            >
              📤 分享
            </button>
          </div>

          {/* 主按鈕（完成練習，獨立一行） */}
          {showPractice && (
            <button 
              onClick={handlePracticeClick}
              className="w-full h-14 rounded-2xl font-bold text-lg transition-all active:scale-98 shadow-lg"
              style={{ 
                backgroundColor: isCompleted ? 'var(--btn-success-bg)' : 'var(--btn-primary-bg)',
                color: isCompleted ? 'var(--btn-success-text)' : 'var(--btn-primary-text)',
                boxShadow: isCompleted ? 'none' : '0 10px 30px -10px rgba(251, 191, 36, 0.3)'
              }}
            >
              {isCompleted ? '✓ 今天已練習' : '🏂 完成練習'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
