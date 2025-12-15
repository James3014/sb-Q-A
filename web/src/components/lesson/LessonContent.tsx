'use client'

import Image from 'next/image'
import DOMPurify from 'dompurify'

export function LessonWhat({ what }: { what: string }) {
  return (
    <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-4">
      <h2 className="text-lg font-semibold mb-3 text-amber-400">😰 你可能遇到這些狀況</h2>
      <p className="text-zinc-300 text-lg leading-[1.8]">{what}</p>
    </section>
  )
}

export function LessonWhy({ why }: { why: string[] }) {
  if (!why?.length) return null
  return (
    <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-4">
      <h2 className="text-lg font-semibold mb-3 text-blue-400">🎯 練習目標</h2>
      <ul className="text-zinc-300 text-lg leading-[1.8] space-y-2">
        {why.map((w, i) => <li key={i}>• {w}</li>)}
      </ul>
    </section>
  )
}

export function LessonSteps({ steps }: { steps: { text: string; image?: string | null }[] }) {
  if (!steps?.length) return null

  // 格式化文字：粗體 + 換行 + 數字標題前斷行
  // 使用 DOMPurify 淨化 HTML 防止 XSS 攻擊
  const formatText = (text: string) => {
    const html = text
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br/>')
      // 數字標題前加換行（1. 2. 3. 或 1、2、3、）
      .replace(/(\d+[\.\、:：]\s*)/g, '<br/><b>$1</b>')
      // 移除開頭多餘的 <br/>
      .replace(/^<br\/>/, '')

    // 只允許安全的 HTML 標籤
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'br', 'strong', 'em', 'i'],
      ALLOWED_ATTR: []
    })
  }

  return (
    <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-4">
      <h2 className="text-lg font-semibold mb-4 text-green-400">🛠️ 怎麼練習</h2>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="bg-zinc-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
              <div className="flex-1">
                {step.image && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-zinc-600">
                    <Image src={step.image} alt={`步驟 ${i + 1}`} width={800} height={600} className="w-full h-auto" loading="lazy" />
                  </div>
                )}
                <p className="text-zinc-300 text-lg leading-[1.8]" dangerouslySetInnerHTML={{ __html: formatText(step.text) }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function LessonSignals({ correct, wrong }: { correct?: string[]; wrong?: string[] }) {
  if (!correct?.length && !wrong?.length) return null
  
  // 清理函數：移除 JSON 資料和 CASI 結構化內容
  const cleanSignal = (signal: string): string => {
    // 移除 JSON 區塊和 CASI 結構化資料
    return signal
      .split(/\n## 🎯 CASI 結構化數據/)[0] // 移除 CASI 資料
      .split(/```json/)[0] // 移除 JSON 區塊
      .trim()
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {correct?.length ? (
        <section className="bg-zinc-800 rounded-lg p-5 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold mb-3 text-green-400">✅ 做對時你會感覺</h2>
          <ul className="text-zinc-300 text-lg leading-[1.8] space-y-2">
            {correct.map((s, i) => <li key={i}>• {cleanSignal(s)}</li>)}
          </ul>
        </section>
      ) : null}
      {wrong?.length ? (
        <section className="bg-zinc-800 rounded-lg p-5 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold mb-3 text-red-400">❌ 做錯時你可能感覺</h2>
          <ul className="text-zinc-300 text-lg leading-[1.8] space-y-2">
            {wrong.map((s, i) => <li key={i}>• {cleanSignal(s)}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
