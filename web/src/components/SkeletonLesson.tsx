'use client'

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-zinc-700 rounded animate-pulse ${className}`} />
}

export default function SkeletonLesson() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="w-8 h-8 rounded-full" />
          <SkeletonBlock className="h-6 w-48" />
          <div className="ml-auto flex gap-2">
            <SkeletonBlock className="w-10 h-10 rounded-full" />
            <SkeletonBlock className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Title */}
        <SkeletonBlock className="h-8 w-3/4" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>

        {/* What section */}
        <div className="bg-zinc-800 rounded-lg p-5">
          <SkeletonBlock className="h-6 w-40 mb-3" />
          <SkeletonBlock className="h-5 w-full mb-2" />
          <SkeletonBlock className="h-5 w-4/5" />
        </div>

        {/* Why section */}
        <div className="bg-zinc-800 rounded-lg p-5">
          <SkeletonBlock className="h-6 w-32 mb-3" />
          <SkeletonBlock className="h-5 w-full mb-2" />
          <SkeletonBlock className="h-5 w-3/4" />
        </div>

        {/* Steps section */}
        <div className="bg-zinc-800 rounded-lg p-5">
          <SkeletonBlock className="h-6 w-36 mb-4" />
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-700/50 rounded-lg p-4 mb-3 flex gap-3">
              <SkeletonBlock className="w-7 h-7 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <SkeletonBlock className="h-5 w-full mb-2" />
                <SkeletonBlock className="h-5 w-2/3" />
              </div>
            </div>
          ))}
        </div>

        {/* Signals */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-800 rounded-lg p-5 border-l-4 border-zinc-600">
            <SkeletonBlock className="h-6 w-32 mb-3" />
            <SkeletonBlock className="h-5 w-full mb-2" />
            <SkeletonBlock className="h-5 w-3/4" />
          </div>
          <div className="bg-zinc-800 rounded-lg p-5 border-l-4 border-zinc-600">
            <SkeletonBlock className="h-6 w-32 mb-3" />
            <SkeletonBlock className="h-5 w-full mb-2" />
            <SkeletonBlock className="h-5 w-3/4" />
          </div>
        </div>
      </div>
    </main>
  )
}
