/**
 * 後台管理系統計算邏輯
 * 所有計算邏輯集中在此，便於測試和重用
 */

export interface Lesson {
  id: string
  practices: number
  avg_rating: number
  completion_rate: number
  practice_rate: number
}

export interface EffectivenessScore {
  score: number
  count: number
  reason?: string
}

export interface HealthScore {
  score: number
  components: {
    completion: number
    practice: number
  }
}

/**
 * 計算課程有效度
 * 有效度 = (平均評分 / 5) * 100
 * 需要至少 3 筆練習記錄才有效
 */
export function calculateEffectiveness(lesson: Lesson): EffectivenessScore {
  if (lesson.practices < 3) {
    return {
      score: 0,
      count: lesson.practices,
      reason: 'insufficient data (< 3 practices)'
    }
  }

  return {
    score: (lesson.avg_rating / 5) * 100,
    count: lesson.practices
  }
}

/**
 * 計算課程健康度
 * 健康度 = 滾動完成率 × 40% + 練習完成率 × 60%
 */
export function calculateHealth(lesson: Lesson): HealthScore {
  const completionComponent = lesson.completion_rate * 0.4
  const practiceComponent = lesson.practice_rate * 0.6

  return {
    score: completionComponent + practiceComponent,
    components: {
      completion: completionComponent,
      practice: practiceComponent
    }
  }
}

/**
 * 計算轉換率
 */
export function calculateConversionRate(total: number, converted: number): number {
  if (total === 0) return 0
  return (converted / total) * 100
}

/**
 * 計算佣金
 */
export function calculateCommission(amount: number, rate: number): number {
  return amount * rate
}

/**
 * 按日期範圍過濾
 */
export function filterByDateRange<T extends { created_at: string }>(
  items: T[],
  startDate: Date,
  endDate: Date
): T[] {
  const start = startDate.getTime()
  const end = endDate.getTime()

  return items.filter(item => {
    const itemDate = new Date(item.created_at).getTime()
    return itemDate >= start && itemDate <= end
  })
}

/**
 * 排序
 */
export function sortByField<T>(
  items: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (aVal === bVal) return 0

    const comparison = aVal < bVal ? -1 : 1
    return order === 'asc' ? comparison : -comparison
  })
}

/**
 * 計算統計摘要
 */
export function calculateStats(numbers: number[]): {
  sum: number
  avg: number
  min: number
  max: number
  count: number
} {
  if (numbers.length === 0) {
    return { sum: 0, avg: 0, min: 0, max: 0, count: 0 }
  }

  const sum = numbers.reduce((acc, n) => acc + n, 0)
  const avg = sum / numbers.length
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)

  return { sum, avg, min, max, count: numbers.length }
}

/**
 * 計算百分比
 */
export function calculatePercentage(value: number, total: number, decimals = 2): number {
  if (total === 0) return 0
  return Number(((value / total) * 100).toFixed(decimals))
}

/**
 * 格式化數字（千分位）
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-TW')
}

/**
 * 格式化金額（新台幣）
 */
export function formatCurrency(amount: number): string {
  return `NT$ ${formatNumber(amount)}`
}

/**
 * 分組統計
 */
export function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const groupKey = String(item[key])
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

/**
 * 計算增長率
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}
