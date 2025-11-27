// Types for recommend-path Edge Function

export type LessonLevel = 'beginner' | 'intermediate' | 'advanced'
export type TerrainType = 'green' | 'blue' | 'black' | 'mogul' | 'park' | 'powder' | 'tree' | 'flat' | 'all'
export type LessonIntent = 'warmup' | 'diagnose' | 'build' | 'apply' | 'recover'
export type PrereqType = 'hard' | 'soft'

export interface Symptom {
  code: string
  description: string
  severity: 1 | 2 | 3
}

export interface RiderProfile {
  id: string
  level: LessonLevel
  preferredTerrain: TerrainType[]
  avoidTerrain?: TerrainType[]
  goals: string[]
  daysRemaining?: number
}

export interface CompletedLesson {
  lessonId: string
  status: 'completed' | 'skipped' | 'struggling'
  stillWrongSignals?: string[]
  completedAt?: string
}

export interface RiderState {
  profile: RiderProfile
  symptoms: Symptom[]
  completedLessons: CompletedLesson[]
}

export interface Lesson {
  id: string
  title: string
  level_tags: LessonLevel[]
  slope_tags: TerrainType[]
  what: string
  why: string[]
  primary_skill_code?: string
  difficulty_score?: number
  est_duration_min?: number
}

export interface LessonPrerequisite {
  lesson_id: string
  prerequisite_id: string
  type: PrereqType
  note?: string
}

export interface ScoredLesson {
  lesson: Lesson
  score: number
  levelMatch: number
  goalMatch: number
  symptomMatch: number
  terrainMatch: number
  isWarmup?: boolean
}

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

export interface LearningPath {
  riderId: string
  items: LessonPlanItem[]
  summary: string
  totalDays: number
  totalLessons: number
  generatedAt: string
}

export interface PathEngineOptions {
  days?: number
  perDayLessonCount?: number
  includeWarmup?: boolean
}
