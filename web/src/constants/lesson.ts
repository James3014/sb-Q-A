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

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
