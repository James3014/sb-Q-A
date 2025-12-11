export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <div className="text-4xl">🔍</div>
        <h1 className="text-xl font-bold">找不到頁面</h1>
        <p className="text-sm text-zinc-400">連結可能已失效，請返回首頁或重新檢查網址。</p>
        <a
          className="inline-block px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
          href="/"
        >
          返回首頁
        </a>
      </div>
    </main>
  )
}
