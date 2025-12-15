/**
 * HealthView
 * 課程健康度視圖 - 純展示組件
 */

import { LessonHealth } from '@/lib/adminData'
import { Lesson } from '@/lib/lessons'

interface Props {
  health: LessonHealth[]
  allLessons: Lesson[]
}

export function HealthView({ health, allLessons }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-800 rounded-lg p-4">
        <p className="text-sm text-zinc-400 mb-2">
          🩺 課程健康度 = 滾動完成率 × 40% + 練習完成率 × 60%
        </p>
        <p className="text-xs text-zinc-500">
          低分課程需要改善（內容太長、不吸引人、或練習門檻太高）
        </p>
      </div>

      {health.length === 0 ? (
        <p className="text-zinc-500 text-center py-8">
          尚無足夠數據（需要用戶滾動和練習行為）
        </p>
      ) : (
        <div className="space-y-2">
          {health.map(item => {
            const title =
              allLessons.find(l => l.id === item.lesson_id)?.title ||
              item.lesson_id
            return (
              <div key={item.lesson_id} className="bg-zinc-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="truncate flex-1">{title}</span>
                  <span
                    className={`text-lg font-bold ${
                      item.healthScore >= 60
                        ? 'text-green-400'
                        : item.healthScore >= 40
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {item.healthScore.toFixed(0)}%
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-zinc-500">
                  <span>📜 滾動完成 {item.scrollRate.toFixed(0)}%</span>
                  <span>📝 練習完成 {item.practiceRate.toFixed(0)}%</span>
                  <span>{item.samples} 筆</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
