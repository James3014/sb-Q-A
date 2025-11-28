import Link from 'next/link'
import { vibrate } from './Button'

export function LockedState({ 
  title, 
  description, 
  showLogin = false 
}: { 
  title: string
  description: string
  showLogin?: boolean 
}) {
  return (
    <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-zinc-400 mb-6">{description}</p>
        {showLogin ? (
          <Link href="/login" className="inline-block bg-blue-600 px-6 py-3 rounded-lg">請先登入</Link>
        ) : (
          <Link href="/pricing" className="inline-block bg-amber-600 px-6 py-3 rounded-lg">查看方案</Link>
        )}
      </div>
    </main>
  )
}

export function PageHeader({ title, emoji }: { title: string; emoji?: string }) {
  const handleBack = () => vibrate(20)
  
  return (
    <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
      <div className="flex items-center gap-4">
        <Link href="/" onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-400">←</Link>
        <h1 className="text-xl font-bold">{emoji && `${emoji} `}{title}</h1>
      </div>
    </header>
  )
}

export function EmptyState({ 
  emoji, 
  title, 
  description, 
  actionText, 
  actionHref 
}: { 
  emoji: string
  title: string
  description: string
  actionText?: string
  actionHref?: string 
}) {
  return (
    <div className="text-center py-12">
      <p className="text-5xl mb-4">{emoji}</p>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-zinc-400 text-sm mb-4">{description}</p>
      {actionText && actionHref && (
        <Link href={actionHref} className="inline-block bg-blue-600 px-4 py-2 rounded-lg text-sm">
          {actionText}
        </Link>
      )}
    </div>
  )
}
