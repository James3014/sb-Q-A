import Link from 'next/link'

export function LoadingState() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <p className="text-zinc-400">載入中...</p>
    </div>
  )
}

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
  return (
    <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-zinc-400">←</Link>
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

// 進度條
export function ProgressBar({ 
  value, 
  max, 
  color = 'bg-blue-500' 
}: { 
  value: number
  max: number
  color?: string 
}) {
  const percent = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="h-2 bg-zinc-700 rounded overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

// 漏斗條（含標籤）
export function FunnelBar({ 
  label, 
  value, 
  max 
}: { 
  label: string
  value: number
  max: number 
}) {
  const percent = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 bg-zinc-700 rounded">
        <div className="h-3 rounded bg-blue-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

// 統計卡片
export function StatCard({ 
  label, 
  value, 
  color 
}: { 
  label: string
  value: string | number
  color?: string 
}) {
  return (
    <div className="bg-zinc-800 rounded-lg p-3 text-center">
      <p className="text-zinc-400 text-xs">{label}</p>
      <p className={`text-xl font-bold ${color || ''}`}>{value}</p>
    </div>
  )
}
