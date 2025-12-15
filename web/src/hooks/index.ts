/**
 * Custom Hooks 統一匯出
 *
 * 使用指引：
 * - useLessonDetailData  → 課程詳情頁所有資料（收藏、練習、推薦）
 * - useCheckout          → 購買流程狀態管理
 * - useChartStats        → 圖表統計計算（純函數）
 * - useAccessibleLessons → 依權限篩選可存取課程
 * - useSnowMode          → 雪景模式切換
 * - useHomePersistence   → 首頁狀態持久化
 * - useScrollRestoration → 滾動位置恢復
 * - useScrollDepth       → 滾動深度追蹤
 * - useCardAnimation     → 卡片動畫控制
 */

// 資料載入 hooks
export { useLessonDetailData } from './useLessonDetailData'
export { useCheckout, type CheckoutStatus } from './useCheckout'
export { useAccessibleLessons } from './useAccessibleLessons'

// 計算 hooks
export {
  calculateChartStats,
  calculateBarHeight,
  formatDateShort,
  formatDateFull,
  CHART_CONSTANTS,
  type ChartStats,
} from './useChartStats'

// UI/UX hooks
export { useSnowMode } from './useSnowMode'
export { useHomePersistence } from './useHomePersistence'
export { useScrollRestoration } from './useScrollRestoration'
export { useScrollDepth } from './useScrollDepth'
export { useCardAnimation } from './useCardAnimation'

// Lesson CMS hooks
export { useLessonForm } from './lessons/useLessonForm'
export { useImageUpload } from './lessons/useImageUpload'
export { useFormValidation } from './lessons/useFormValidation'
