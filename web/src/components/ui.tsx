import Link from 'next/link'

// 載入狀態
export function LoadingState() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-4">
      <p className="text-center text-zinc-400 mt-20">載入中...</p>
    </main>
  )
}

// 付費鎖定狀態
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
    <main className="min-h-screen bg-zinc-900 text-white p-4">
      <Link href="/" className="text-zinc-400 text-sm">← 返回首頁</Link>
      <div className="text-center mt-20">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-zinc-400 mb-2">{title}</p>
        <p className="text-zinc-500 text-sm mb-6">{description}</p>
        <Link href="/pricing" className="inline-block bg-amber-600 px-6 py-3 rounded-lg mr-3">
          查看方案
        </Link>
        {showLogin && (
          <Link href="/login" className="inline-block bg-zinc-700 px-6 py-3 rounded-lg">
            登入
          </Link>
        )}
      </div>
    </main>
  )
}

// 頁面 Header
export function PageHeader({ title, emoji }: { title: string; emoji?: string }) {
  return (
    <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-zinc-400">←</Link>
        <h1 className="text-xl font-bold">{emoji && `${emoji} `}{title}</h1>
      </div>
    </header>
  )
}

// 空狀態
export function EmptyState({
  emoji,
  title,
  description,
  actionText,
  actionHref,
}: {
  emoji: string
  title: string
  description: string
  actionText: string
  actionHref: string
}) {
  return (
    <div className="text-center mt-20">
      <p className="text-5xl mb-4">{emoji}</p>
      <p className="text-zinc-400 mb-2">{title}</p>
      <p className="text-zinc-500 text-sm mb-6">{description}</p>
      <Link href={actionHref} className="inline-block bg-blue-600 px-6 py-3 rounded-lg">
        {actionText}
      </Link>
    </div>
  )
}
