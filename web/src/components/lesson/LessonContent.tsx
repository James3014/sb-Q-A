export function LessonWhat({ what }: { what: string }) {
  return (
    <section className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h2 className="font-semibold mb-2 text-amber-400">😰 你可能遇到這些狀況</h2>
      <p className="text-zinc-300 leading-relaxed">{what}</p>
    </section>
  )
}

export function LessonWhy({ why }: { why: string[] }) {
  if (!why?.length) return null
  return (
    <section className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h2 className="font-semibold mb-2 text-blue-400">🎯 練習目標</h2>
      <ul className="text-zinc-300 space-y-1">
        {why.map((w, i) => <li key={i}>• {w}</li>)}
      </ul>
    </section>
  )
}

export function LessonSteps({ steps }: { steps: { text: string; image?: string | null }[] }) {
  if (!steps?.length) return null
  return (
    <section className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h2 className="font-semibold mb-3 text-green-400">🛠️ 怎麼練習</h2>
      <div className="space-y-4">
        {steps.map((step, i) => {
          const text = step.text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^\d+\.\s*/, '').replace(/^-\s*/, '')
          return (
            <div key={i} className="bg-zinc-700/50 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
                <div className="flex-1">
                  {step.image && <div className="mb-2 rounded-lg overflow-hidden bg-zinc-600"><img src={step.image} alt={`步驟 ${i + 1}`} className="w-full" /></div>}
                  <p className="text-zinc-300 text-sm" dangerouslySetInnerHTML={{ __html: text }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function LessonSignals({ correct, wrong }: { correct?: string[]; wrong?: string[] }) {
  if (!correct?.length && !wrong?.length) return null
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      {correct?.length ? (
        <section className="bg-zinc-800 rounded-lg p-4 border-l-4 border-green-500">
          <h2 className="font-semibold mb-2 text-green-400">✅ 做對時你會感覺</h2>
          <ul className="text-zinc-300 text-sm space-y-1">{correct.map((s, i) => <li key={i}>• {s}</li>)}</ul>
        </section>
      ) : null}
      {wrong?.length ? (
        <section className="bg-zinc-800 rounded-lg p-4 border-l-4 border-red-500">
          <h2 className="font-semibold mb-2 text-red-400">❌ 做錯時你可能感覺</h2>
          <ul className="text-zinc-300 text-sm space-y-1">{wrong.map((s, i) => <li key={i}>• {s}</li>)}</ul>
        </section>
      ) : null}
    </div>
  )
}
