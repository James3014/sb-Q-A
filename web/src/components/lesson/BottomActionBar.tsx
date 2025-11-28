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
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* 收藏按鈕 - 48px */}
          <button 
            onClick={handleFav} 
            disabled={favLoading}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-2xl"
          >
            {favLoading ? '⏳' : isFav ? '❤️' : '🤍'}
          </button>

          {/* 主按鈕 - 完成練習 */}
          {showPractice && (
            <button 
              onClick={handlePracticeClick}
              className="flex-1 h-14 rounded-xl font-bold text-lg transition-all active:scale-95"
              style={{ 
                backgroundColor: isCompleted ? 'var(--btn-success-bg)' : 'var(--btn-primary-bg)',
                color: isCompleted ? 'var(--btn-success-text)' : 'var(--btn-primary-text)'
              }}
            >
              {isCompleted ? '✓ 今天已練習' : '🏂 完成練習'}
            </button>
          )}

          {/* 分享按鈕 - 48px */}
          <button 
            onClick={handleShare}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-2xl"
          >
            📤
          </button>
        </div>
      </div>
    </>
  )
}
