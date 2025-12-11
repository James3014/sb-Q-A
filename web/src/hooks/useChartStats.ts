import type { ImprovementPoint } from '@/lib/improvement'

/** 圖表統計計算結果 */
export interface ChartStats {
  /** 起始評分 */
  startRating: number
  /** 最新評分 */
  endRating: number
  /** 進步幅度 (endRating - startRating) */
  improvement: number
  /** 是否正在進步 */
  isImproving: boolean
  /** 總練習天數 */
  totalDays: number
  /** 總練習次數 */
  totalPractices: number
  /** 平均評分 */
  averageRating: number
  /** 最低評分 */
  minRating: number
  /** 最高評分 */
  maxRating: number
  /** 起始日期 */
  startDate: string
  /** 最新日期 */
  endDate: string
}

/** 圖表常數 */
export const CHART_CONSTANTS = {
  MAX_RATING: 5,
  MIN_RATING: 1,
  RATING_RANGE: 4, // MAX - MIN
} as const

/**
 * 計算圖表統計數據
 * 純函數，無副作用，方便測試
 */
export function calculateChartStats(data: ImprovementPoint[]): ChartStats | null {
  if (data.length === 0) return null

  const startRating = data[0]?.avg_rating || 0
  const endRating = data[data.length - 1]?.avg_rating || 0
  const improvement = endRating - startRating

  const totalPractices = data.reduce((sum, d) => sum + d.practice_count, 0)
  const averageRating = data.reduce((sum, d) => sum + d.avg_rating, 0) / data.length
  const ratings = data.map(d => d.avg_rating)

  return {
    startRating,
    endRating,
    improvement,
    isImproving: improvement > 0,
    totalDays: data.length,
    totalPractices,
    averageRating,
    minRating: Math.min(...ratings),
    maxRating: Math.max(...ratings),
    startDate: data[0].date,
    endDate: data[data.length - 1].date,
  }
}

/**
 * 計算單一資料點的柱狀高度百分比
 */
export function calculateBarHeight(rating: number): number {
  const { MAX_RATING, MIN_RATING, RATING_RANGE } = CHART_CONSTANTS
  return ((rating - MIN_RATING) / RATING_RANGE) * 100
}

/**
 * 格式化日期為中文短格式
 */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * 格式化日期為中文完整格式
 */
export function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW')
}
