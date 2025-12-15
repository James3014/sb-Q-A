/**
 * Common Types
 * 通用的跨模塊類型定義
 */

/**
 * ==================
 * 基礎工具類型
 * ==================
 */

/**
 * 使某些字段可選
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 使某些字段必需
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 深度只讀
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度部分可選
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * ==================
 * 常用枚舉類型
 * ==================
 */

/**
 * 訂閱類型
 */
export type SubscriptionType = 'free' | 'pro'

/**
 * 難度等級
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

/**
 * 課程標籤
 */
export type LessonTag =
  | 'heel'
  | 'toe'
  | 'forward'
  | 'switch'
  | 'carving'
  | 'freestyle'
  | 'powder'

/**
 * 用戶角色
 */
export type UserRole = 'user' | 'admin'

/**
 * 狀態類型
 */
export type Status = 'active' | 'inactive' | 'pending' | 'expired'

/**
 * ==================
 * ID 類型
 * ==================
 */

/**
 * UUID 類型（字符串別名）
 */
export type UUID = string

/**
 * 時間戳類型（ISO 8601 字符串）
 */
export type Timestamp = string

/**
 * ==================
 * API 相關
 * ==================
 */

/**
 * API 錯誤響應
 */
export interface ApiError {
  message: string
  code: string
  statusCode?: number
  details?: any
}

/**
 * 分頁響應
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 排序選項
 */
export interface SortOption {
  field: string
  order: 'asc' | 'desc'
}

/**
 * 查詢參數
 */
export interface QueryParams {
  page?: number
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filter?: Record<string, any>
}

/**
 * ==================
 * 日期時間相關
 * ==================
 */

/**
 * 日期範圍
 */
export interface DateRange {
  start: Date | string
  end: Date | string
}

/**
 * ==================
 * 統計相關
 * ==================
 */

/**
 * 數值統計
 */
export interface NumericStats {
  total: number
  average: number
  min: number
  max: number
  count: number
}

/**
 * 趨勢數據
 */
export interface TrendData {
  label: string
  value: number
  change?: number // 變化百分比
  date?: string
}

/**
 * ==================
 * UI 相關
 * ==================
 */

/**
 * 選項類型（用於下拉選單等）
 */
export interface Option<T = string> {
  label: string
  value: T
  disabled?: boolean
}

/**
 * 選項組
 */
export interface OptionGroup<T = string> {
  label: string
  options: Option<T>[]
}

/**
 * Tab 項
 */
export interface TabItem {
  key: string
  label: string
  icon?: string
  badge?: number
  disabled?: boolean
}

/**
 * 麵包屑項
 */
export interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

/**
 * ==================
 * 文件上傳相關
 * ==================
 */

/**
 * 文件類型
 */
export type FileType = 'image' | 'video' | 'audio' | 'document' | 'other'

/**
 * 上傳文件信息
 */
export interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
}

/**
 * ==================
 * 事件相關
 * ==================
 */

/**
 * 事件日誌
 */
export interface EventLog {
  id: string
  event: string
  user_id?: string
  data?: any
  timestamp: Timestamp
  ip?: string
  userAgent?: string
}

/**
 * ==================
 * 配置相關
 * ==================
 */

/**
 * 環境類型
 */
export type Environment = 'development' | 'staging' | 'production'

/**
 * 功能開關
 */
export interface FeatureFlag {
  key: string
  enabled: boolean
  description?: string
  environments?: Environment[]
}
