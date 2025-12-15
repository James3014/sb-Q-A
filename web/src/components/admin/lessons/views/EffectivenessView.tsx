/**
 * EffectivenessView
 * 課程有效度視圖 - 純展示組件
 */

import { LessonEffectiveness } from '@/lib/adminData'

interface Props {
  effectiveness: LessonEffectiveness[]
}

export function EffectivenessView({ effectiveness }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-800 rounded-lg p-4">
        <p className="text-sm text-zinc-400 mb-2">
          🎯 課程有效度 = 用戶練習後的平均評分（至少 3 筆資料）
        </p>
        <p className="text-xs text-zinc-500">
          分數越高，代表用戶練習後感覺進步越明顯
        </p>
      </div>

      {effectiveness.length === 0 ? (
        <p className="text-zinc-500 text-center py-8">尚無足夠練習數據</p>
      ) : (
        <div className="space-y-2">
          {effectiveness.map((item, index) => (
            <div
              key={item.lesson_id}
              className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg font-bold ${
                    index < 3 ? 'text-amber-400' : 'text-zinc-500'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate">{item.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-400">
                  {item.samples} 筆
                </span>
                <span
                  className={`text-lg font-bold ${
                    item.avg_score >= 4
                      ? 'text-green-400'
                      : item.avg_score >= 3
                      ? 'text-blue-400'
                      : 'text-zinc-400'
                  }`}
                >
                  {item.avg_score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
