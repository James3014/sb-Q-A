export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_IMAGE_WIDTH = 1200
export const MAX_IMAGE_HEIGHT = 1200

export const REQUIRED_LESSON_FIELDS = [
  'title',
  'what',
  'why',
  'how',
  'level_tags',
  'slope_tags',
] as const

export const LESSON_API_ENDPOINTS = {
  lessons: '/api/admin/lessons',
  upload: '/api/admin/upload',
} as const

export const LEVEL_OPTIONS = ['初級', '中級', '進階'] as const
export const SLOPE_OPTIONS = [
  '綠線',
  '紅線',
  '黑線',
  '饅頭',
  '粉雪',
  '公園',
  '樹林',
  '平地',
  '全地形'
] as const

// 中英文 tag 對照表（資料庫用英文，UI 用中文）
export const LEVEL_TAG_MAP: Record<string, string> = {
  'beginner': '初級',
  'intermediate': '中級',
  'advanced': '進階',
  '初級': 'beginner',
  '中級': 'intermediate',
  '進階': 'advanced',
}

export const SLOPE_TAG_MAP: Record<string, string> = {
  'green': '綠線',
  'blue': '紅線',
  'black': '黑線',
  'mogul': '饅頭',
  'powder': '粉雪',
  'park': '公園',
  'tree': '樹林',
  'flat': '平地',
  'all-terrain': '全地形',
  '綠線': 'green',
  '紅線': 'blue',
  '黑線': 'black',
  '饅頭': 'mogul',
  '粉雪': 'powder',
  '公園': 'park',
  '樹林': 'tree',
  '平地': 'flat',
  '全地形': 'all-terrain',
}

// 英文轉中文
export function levelTagToDisplay(tag: string): string {
  return LEVEL_TAG_MAP[tag] || tag
}

export function slopeTagToDisplay(tag: string): string {
  return SLOPE_TAG_MAP[tag] || tag
}

// 中文轉英文（用於儲存）
export function levelTagToDb(tag: string): string {
  return LEVEL_TAG_MAP[tag] || tag
}

export function slopeTagToDb(tag: string): string {
  return SLOPE_TAG_MAP[tag] || tag
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
