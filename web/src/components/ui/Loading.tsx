// Loading 全頁
export function LoadingState({ text = '載入中...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <p className="text-zinc-400">{text}</p>
    </div>
  )
}

// Loading 行內
export function LoadingText({ text = '載入中...' }: { text?: string }) {
  return <p className="text-zinc-500 text-center py-8">{text}</p>
}
