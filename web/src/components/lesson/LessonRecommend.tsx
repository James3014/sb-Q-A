import Link from 'next/link'

export function LessonRecommendations({ weakSkill, recommendations }: { weakSkill: string | null; recommendations: { id: string; title: string }[] }) {
  if (!weakSkill && !recommendations.length) {
    return (
      <section className="bg-zinc-800 rounded-lg p-4 mb-4 text-center">
        <p className="text-zinc-400 text-sm">🎯 開始練習即可看到專屬推薦！</p>
      </section>
    )
  }
  return (
    <section className="bg-gradient-to-r from-amber-900/30 to-zinc-800 rounded-lg p-4 mb-4 border border-amber-600/30">
      <h2 className="font-semibold mb-2 text-amber-400">🔥 {weakSkill ? `根據你的弱項（${weakSkill}），推薦練習` : '推薦練習'}</h2>
      <div className="space-y-2">
        {recommendations.map(r => (
          <Link key={r.id} href={`/lesson/${r.id}`} className="block bg-zinc-700/50 rounded p-2 text-sm hover:bg-zinc-700 transition">{r.title}</Link>
        ))}
      </div>
    </section>
  )
}

export function LessonSequence({ prerequisite, next, similar }: { prerequisite: { id: string; title: string } | null; next: { id: string; title: string } | null; similar: { id: string; title: string }[] }) {
  if (!prerequisite && !next && !similar.length) return null
  return (
    <section className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h2 className="font-semibold mb-3">📚 學習路徑</h2>
      <div className="space-y-2">
        {prerequisite && (
          <Link href={`/lesson/${prerequisite.id}`} className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded hover:bg-zinc-700 transition">
            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">先看</span>
            <span className="text-sm text-zinc-300 truncate">{prerequisite.title}</span>
          </Link>
        )}
        {next && (
          <Link href={`/lesson/${next.id}`} className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded hover:bg-zinc-700 transition">
            <span className="text-xs bg-green-600 px-2 py-0.5 rounded">下一步</span>
            <span className="text-sm text-zinc-300 truncate">{next.title}</span>
          </Link>
        )}
        {similar.map(s => (
          <Link key={s.id} href={`/lesson/${s.id}`} className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded hover:bg-zinc-700 transition">
            <span className="text-xs bg-zinc-600 px-2 py-0.5 rounded">相似</span>
            <span className="text-sm text-zinc-300 truncate">{s.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function LessonUnlockPRO() {
  return (
    <section className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg p-6 text-center border border-zinc-700">
      <p className="text-3xl mb-3">🔒</p>
      <h3 className="font-bold mb-2">本課程包含更多細節</h3>
      <p className="text-zinc-400 text-sm mb-4">升級 PRO 解鎖 185 堂課程 + 越變越強的儀表板</p>
      <Link href="/pricing" className="inline-block bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-medium transition">查看方案 →</Link>
    </section>
  )
}
