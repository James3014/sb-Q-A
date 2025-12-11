'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold">服務暫時發生問題</h1>
          <p className="text-sm text-zinc-400">請稍後再試，或點按下方按鈕重新整理。</p>
          <button
            onClick={reset}
            className="mt-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
          >
            重新整理
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-xs text-left bg-zinc-900 p-3 rounded-lg overflow-auto max-h-48">
              {error.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  )
}
