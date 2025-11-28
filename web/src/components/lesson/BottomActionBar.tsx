'use client'

import { vibrate } from '@/components/ui'

interface Props {
  isFav: boolean
  favLoading: boolean
  onToggleFav: () => void
  onShare: () => void
  onPractice: () => void
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
  const handleFav = () => {
    vibrate(20)
    onToggleFav()
  }

  const handleShare = () => {
    vibrate(20)
    onShare()
  }

  const handlePractice = () => {
    vibrate([50, 30, 50])
    onPractice()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-700 px-4 py-3 pb-safe z-50">
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
            onClick={handlePractice}
            className={`flex-1 h-14 rounded-xl font-bold text-lg transition-all active:scale-95 ${
              isCompleted 
                ? 'bg-green-700 hover:bg-green-600' 
                : 'bg-blue-700 hover:bg-blue-600'
            }`}
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
  )
}
