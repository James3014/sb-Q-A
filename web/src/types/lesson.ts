// Schema v3 TypeScript Types

// ============================================
// Enums
// ============================================
export type LessonLevel = 'beginner' | 'intermediate' | 'advanced'
export type TerrainType = 'green' | 'blue' | 'black' | 'mogul' | 'park' | 'powder' | 'tree' | 'flat' | 'all'
export type SkillCategory = 'stance' | 'edge' | 'pressure' | 'rotation' | 'timing_coord' | 'tactics'
export type PrereqType = 'hard' | 'soft'
export type TagScope = 'pedagogy' | 'product' | 'marketing' | 'symptom'

// ============================================
// Lesson Step & Signals
// ============================================
export interface LessonStep {
  text: string
  image?: string | null
}

export interface LessonSignals {
  correct: string[]
  wrong: string[]
}

// ============================================
// CASI Metadata
// ============================================
export interface CASIMetadata {
  Core_Competency?: string
  Advanced_Competency?: string
  Primary_Skill?: string
  CASI_Skill?: string[]
  Fault_What?: string
  Goal_Why?: string
  Drill_How?: string
  source_file?: string
  source_checksum?: string
  match_confidence?: number
  [key: string]: unknown
}

// ============================================
// Core Entities
// ============================================
export interface Skill {
  id: number
  code: string
  name: string
  nameEn?: string
  category: SkillCategory
  description?: string
}

export interface Competency {
  id: number
  code: string
  name: string
  description?: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  scope: TagScope
  description?: string
}

// ============================================
// Lesson (Schema v3)
// ============================================
export interface Lesson {
  id: string
  slug?: string
  title: string
  shortTitle?: string

  levelTags: LessonLevel[]
  slopeTags: TerrainType[]

  what: string
  why: string[]
  how: LessonStep[]
  signals: LessonSignals

  casiRaw?: CASIMetadata | null
  primarySkillCode?: string | null
  coreCompetencyCode?: string | null

  isPremium: boolean
  estDurationMin?: number | null
  difficultyScore?: number | null

  createdAt?: string
  updatedAt?: string
}

// ============================================
// Relations
// ============================================
export interface LessonSkillLink {
  lessonId: string
  skillId: number
  weight: number // 1-5
}

export interface LessonPrerequisite {
  lessonId: string
  prerequisiteId: string
  type: PrereqType
  note?: string
}

export interface LessonTagLink {
  lessonId: string
  tagId: number
}

// ============================================
// Lesson with Relations (for API responses)
// ============================================
export interface LessonWithRelations extends Lesson {
  skills?: Skill[]
  prerequisites?: Lesson[]
  tags?: Tag[]
}
