// Learning Path Engine - Output Types

// ============================================
// Lesson Intent (課程意圖)
// ============================================
export type LessonIntent = 
  | 'diagnose'  // 診斷/暖身
  | 'build'     // 建立核心技能
  | 'apply'     // 應用到實際情境
  | 'recover'   // 修正/恢復

// ============================================
// Learning Path Item
// ============================================
export interface LessonPlanItem {
  lessonId: string
  lessonTitle?: string
  intent: LessonIntent
  dayIndex: number
  orderInDay: number
  mustDo: boolean
  rationale: string[]
  estimatedMin?: number
}

// ============================================
// Learning Path (Engine Output)
// ============================================
export interface LearningPath {
  riderId: string
  items: LessonPlanItem[]
  summary: string
  totalDays: number
  totalLessons: number
  generatedAt: string
}

// ============================================
// Scored Lesson (Internal)
// ============================================
export interface ScoredLesson {
  lessonId: string
  score: number
  breakdown: {
    levelMatch: number
    goalMatch: number
    symptomMatch: number
    terrainMatch: number
    novelty: number
  }
}

// ============================================
// Engine Options
// ============================================
export interface PathEngineOptions {
  days?: number
  perDayLessonCount?: number
  perDayDurationMin?: number
  includeWarmup?: boolean
  prioritizePremium?: boolean
}
