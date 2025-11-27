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

// 問題分類
export const PROBLEM_CATEGORIES = [
  { id: 'heel', label: '後刃問題', keywords: ['後刃', '後腳', '後膝'], emoji: '🦶' },
  { id: 'toe', label: '前刃問題', keywords: ['前刃', '前腳', '前膝', '前腿'], emoji: '👣' },
  { id: 'edge', label: '換刃卡卡', keywords: ['換刃', '換邊', '轉換'], emoji: '🔄' },
  { id: 'balance', label: '重心不穩', keywords: ['重心', '平衡', '居中'], emoji: '⚖️' },
  { id: 'speed', label: '速度控制', keywords: ['控速', '減速', '煞車', '太快'], emoji: '🎿' },
  { id: 'mogul', label: '蘑菇地形', keywords: ['蘑菇', '包', 'mogul'], emoji: '🍄' },
  { id: 'steep', label: '陡坡技巧', keywords: ['陡坡', '黑道', '陡'], emoji: '⛷️' },
  { id: 'stance', label: '站姿調整', keywords: ['站姿', '姿勢', '站直'], emoji: '🧍' },
]
