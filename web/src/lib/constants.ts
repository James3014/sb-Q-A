// 程度標籤
export const LEVEL_NAMES: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '進階',
}

// 雪道標籤
export const SLOPE_NAMES: Record<string, string> = {
  green: '綠道',
  blue: '藍道',
  black: '黑道',
  mogul: '蘑菇',
  powder: '粉雪',
  park: '公園',
  tree: '樹林',
  flat: '平地',
  all: '全地形',
}

// 技能對應推薦課程關鍵字
export const SKILL_RECOMMENDATIONS: Record<string, string[]> = {
  '用刃': ['後刃卡住', '刃轉換', '邊刃掌控'],
  '旋轉': ['下肢旋轉', '軸轉技巧', '轉彎控制'],
  '壓力控制': ['壓力轉換', '重心控制', '彈跳吸收'],
  '站姿與平衡': ['基本站姿', '重心居中', '平衡練習'],
  '時機與協調性': ['節奏控制', '動作連貫', '時機掌握'],
}

// 問題分類
export const PROBLEM_CATEGORIES = [
  { id: 'heel', label: '後刃問題', keywords: ['後刃', '後腳', '後膝'], emoji: '🦶', isPro: false },
  { id: 'toe', label: '前刃問題', keywords: ['前刃', '前腳', '前膝', '前腿'], emoji: '👣', isPro: false },
  { id: 'edge', label: '換刃卡卡', keywords: ['換刃', '換邊', '轉換'], emoji: '🔄', isPro: false },
  { id: 'balance', label: '重心不穩', keywords: ['重心', '平衡', '居中'], emoji: '⚖️', isPro: false },
  { id: 'speed', label: '速度控制', keywords: ['控速', '減速', '煞車', '太快'], emoji: '🏂', isPro: false },
  { id: 'mogul', label: '蘑菇地形', keywords: ['蘑菇', '包', 'mogul'], emoji: '🍄', isPro: false },
  { id: 'steep', label: '陡坡技巧', keywords: ['陡坡', '黑道', '陡'], emoji: '⬇️', isPro: false },
  { id: 'stance', label: '站姿調整', keywords: ['站姿', '姿勢', '站直'], emoji: '🧍', isPro: false },
  // 🆕 進階技巧分類（PRO 專屬）
  { id: 'pro_advanced', label: '進階技巧 🏔️', keywords: ['進階', '高級', '黑道', 'PRO'], emoji: '🔒', isPro: true },
]

// 訂閱方案
export const SUBSCRIPTION_PLANS = [
  { id: 'pass_7', label: '7天', price: 180, days: 7 },
  { id: 'pass_30', label: '30天', price: 290, days: 30 },
  { id: 'pro_yearly', label: '年費', price: 690, days: 365 },
] as const

export type SubscriptionPlanId = typeof SUBSCRIPTION_PLANS[number]['id']

// 回報類型
export const FEEDBACK_TYPES = [
  { id: 'bug', label: '🐛 我遇到問題' },
  { id: 'lesson_request', label: '📚 希望新增課程' },
  { id: 'feature_request', label: '✨ 希望新增功能' },
  { id: 'other', label: '💬 其他建議' },
]

// 回報類型標籤（後台用）
export const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  bug: '🐛 問題',
  lesson_request: '📚 課程許願',
  feature_request: '✨ 功能許願',
  other: '💬 其他',
}

// 日期格式化
export function formatDate(date: string | Date, style: 'short' | 'full' = 'full'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (style === 'short') {
    return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
  }
  return d.toLocaleDateString('zh-TW')
}
