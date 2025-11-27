import Link from 'next/link'

interface Props {
  isFav: boolean
  favLoading: boolean
  onToggleFav: () => void
  onShare: () => void
  showActions: boolean
}

export function LessonHeader({ isFav, favLoading, onToggleFav, onShare, showActions }: Props) {
  return (
    <div className="flex justify-between items-center mb-4">
      <Link href="/" className="text-zinc-400 hover:text-white">← 返回</Link>
      {showActions && (
        <div className="flex gap-3 items-center">
          <button onClick={onShare} className="text-xl hover:scale-110 transition">📤</button>
          <button onClick={onToggleFav} disabled={favLoading} className="text-2xl hover:scale-110 transition">
            {favLoading ? '⏳' : isFav ? '❤️' : '🤍'}
          </button>
        </div>
      )}
    </div>
  )
}
