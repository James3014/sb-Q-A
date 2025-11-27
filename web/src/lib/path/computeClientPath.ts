// 前端 Path 呈現工具
// 重運算由 Edge Function 處理，這裡只做 UI 轉換

import { LearningPath, LessonPlanItem } from '@/types/path'

// 依天數分組
export function groupByDay(items: LessonPlanItem[]): Map<number, LessonPlanItem[]> {
  const map = new Map<number, LessonPlanItem[]>()
  for (const item of items) {
    const list = map.get(item.dayIndex) || []
    list.push(item)
    map.set(item.dayIndex, list)
  }
  return map
}

// Intent 顯示名稱
export const INTENT_LABELS: Record<string, string> = {
  warmup: '🔥 暖身',
  build: '🎯 核心',
  diagnose: '🔍 診斷',
  apply: '💪 應用',
  recover: '🔄 複習',
}

// 計算總時間
export function getTotalMinutes(items: LessonPlanItem[]): number {
  return items.reduce((sum, i) => sum + (i.estimatedMin || 15), 0)
}

// 格式化時間
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} 分鐘`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} 小時 ${m} 分鐘` : `${h} 小時`
}

// 取得 mustDo 課程
export function getMustDoLessons(path: LearningPath): LessonPlanItem[] {
  return path.items.filter(i => i.mustDo)
}

// 取得今日課程
export function getTodayLessons(path: LearningPath, dayIndex = 1): LessonPlanItem[] {
  return path.items.filter(i => i.dayIndex === dayIndex)
}
