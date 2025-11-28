import Link from 'next/link'
import { vibrate } from '@/components/ui'

export function LessonHeader() {
  const handleBack = () => vibrate(20)

  return (
    <div className="flex items-center mb-4">
      <Link 
        href="/" 
        onClick={handleBack}
        className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-xl"
      >
        ←
      </Link>
    </div>
  )
}
