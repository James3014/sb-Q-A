// Learning Path Engine - Rider Types

import { LessonLevel, TerrainType } from './lesson-v3'

// ============================================
// Riding Goals
// ============================================
export type RidingGoal =
  | 'control_speed'
  | 'moguls_intro'
  | 'powder_intro'
  | 'ice_stability'
  | 'park_intro'
  | 'carving_intro'
  | 'general_progress'

// ============================================
// Symptom (問題/症狀)
// ============================================
export interface Symptom {
  code: string
  description: string
  severity: 1 | 2 | 3 // 1 = 有點困擾, 3 = 核心痛點
}

// 預定義的症狀代碼
export const SYMPTOM_CODES = {
  REAR_SEAT: 'rear_seat',           // 後座
  FEAR_SPEED: 'fear_speed',         // 怕速度
  ICE_CHATTER: 'ice_chatter',       // 冰面抖
  EDGE_STUCK: 'edge_stuck',         // 換刃卡
  MOGUL_FEAR: 'mogul_fear',         // 蘑菇恐懼
  WEAK_TOESIDE: 'weak_toeside',     // 前刃弱
  WEAK_HEELSIDE: 'weak_heelside',   // 後刃弱
  STANDING_TALL: 'standing_tall',   // 站太直
  COUNTER_ROTATION: 'counter_rotation', // 上下分離
  LOCKED_KNEES: 'locked_knees',     // 膝蓋鎖死
} as const

export type SymptomCode = typeof SYMPTOM_CODES[keyof typeof SYMPTOM_CODES]

// ============================================
// Rider Profile
// ============================================
export interface RiderProfile {
  id: string
  level: LessonLevel
  preferredTerrain: TerrainType[]
  avoidTerrain?: TerrainType[]
  goals: RidingGoal[]
  daysRemaining?: number
  sessionDurationMin?: number
  ageGroup?: 'kid' | 'adult'
  notes?: string
}

// ============================================
// Completed Lesson Record
// ============================================
export interface CompletedLesson {
  lessonId: string
  status: 'completed' | 'skipped' | 'struggling'
  rating?: 1 | 2 | 3 | 4 | 5
  stillWrongSignals?: string[]
  masteredSignals?: string[]
  completedAt?: string
}

// ============================================
// Rider State (Engine Input)
// ============================================
export interface RiderState {
  profile: RiderProfile
  symptoms: Symptom[]
  completedLessons: CompletedLesson[]
}
