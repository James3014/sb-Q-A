// Learning Path Engine v1
// Supabase Edge Function 會呼叫這些函數

import { Lesson, LessonPrerequisite, Skill, Tag } from '@/types/lesson'
import { RiderState, Symptom, SYMPTOM_CODES } from '@/types/rider'
import { LearningPath, LessonPlanItem, ScoredLesson, PathEngineOptions, LessonIntent } from '@/types/path'

// ============================================
// Symptom → Keyword Mapping
// ============================================
const SYMPTOM_KEYWORDS: Record<string, string[]> = {
  [SYMPTOM_CODES.REAR_SEAT]: ['後座', '後腳', '後重', '壓後', '重心後'],
  [SYMPTOM_CODES.FEAR_SPEED]: ['控速', '減速', '速度', '煞車', '太快'],
  [SYMPTOM_CODES.ICE_CHATTER]: ['冰面', '抖', '震動', '突突', '硬雪'],
  [SYMPTOM_CODES.EDGE_STUCK]: ['換刃', '卡', '卡頓', '不順'],
  [SYMPTOM_CODES.MOGUL_FEAR]: ['蘑菇', '包', 'mogul'],
  [SYMPTOM_CODES.WEAK_TOESIDE]: ['前刃', '前腳', 'toeside'],
  [SYMPTOM_CODES.WEAK_HEELSIDE]: ['後刃', 'heelside'],
  [SYMPTOM_CODES.STANDING_TALL]: ['站直', '站太直', '起身'],
  [SYMPTOM_CODES.COUNTER_ROTATION]: ['反擰', '上下分離', '扭曲'],
  [SYMPTOM_CODES.LOCKED_KNEES]: ['膝蓋', '鎖死', '膝直'],
}

// Goal → Skill Code Mapping
const GOAL_SKILL_MAP: Record<string, string[]> = {
  control_speed: ['PRESSURE_CONTROL', 'TIMING_COORD'],
  moguls_intro: ['PRESSURE_CONTROL', 'TIMING_COORD'],
  powder_intro: ['STANCE_BALANCE', 'PRESSURE_CONTROL'],
  ice_stability: ['EDGE_CONTROL', 'STANCE_BALANCE'],
  park_intro: ['TIMING_COORD', 'ROTATION'],
  carving_intro: ['EDGE_CONTROL', 'PRESSURE_CONTROL'],
  general_progress: ['STANCE_BALANCE', 'EDGE_CONTROL'],
}

// ============================================
// Step 1: Filter Candidates
// ============================================
export function filterCandidates(state: RiderState, lessons: Lesson[]): Lesson[] {
  const { profile, completedLessons } = state
  const completedIds = new Set(
    completedLessons
      .filter(c => c.status === 'completed' && !c.stillWrongSignals?.length)
      .map(c => c.lessonId)
  )

  return lessons.filter(lesson => {
    // 排除已完全掌握的課
    if (completedIds.has(lesson.id)) return false

    // 難度帶寬檢查
    const lessonLevels = lesson.levelTags || []
    if (profile.level === 'beginner') {
      if (lessonLevels.includes('advanced')) return false
    } else if (profile.level === 'intermediate') {
      // 允許全部，但進階課要 difficultyScore <= 3
      if (lessonLevels.includes('advanced') && !lessonLevels.includes('intermediate')) {
        if (lesson.difficultyScore && lesson.difficultyScore > 3) return false
      }
    }

    // 地形過濾
    if (profile.avoidTerrain?.length) {
      const lessonTerrains = lesson.slopeTags || []
      const onlyAvoidTerrain = lessonTerrains.every(t => profile.avoidTerrain!.includes(t))
      if (onlyAvoidTerrain && lessonTerrains.length > 0) return false
    }

    return true
  })
}

// ============================================
// Step 2: Score Lessons
// ============================================
export function scoreLessons(
  state: RiderState,
  candidates: Lesson[],
  skills: Skill[]
): ScoredLesson[] {
  const { profile, symptoms, completedLessons } = state
  const recentLessonIds = new Set(
    completedLessons
      .filter(c => {
        if (!c.completedAt) return false
        const daysDiff = (Date.now() - new Date(c.completedAt).getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 2
      })
      .map(c => c.lessonId)
  )

  return candidates.map(lesson => {
    const breakdown = {
      levelMatch: scoreLevelMatch(lesson, profile.level),
      goalMatch: scoreGoalMatch(lesson, profile.goals),
      symptomMatch: scoreSymptomMatch(lesson, symptoms),
      terrainMatch: scoreTerrainMatch(lesson, profile.preferredTerrain),
      novelty: recentLessonIds.has(lesson.id) ? -3 : 0,
    }

    const score =
      2 * breakdown.levelMatch +
      3 * breakdown.goalMatch +
      3 * breakdown.symptomMatch +
      1 * breakdown.terrainMatch +
      1 * breakdown.novelty

    return { lessonId: lesson.id, score, breakdown }
  }).sort((a, b) => b.score - a.score)
}

function scoreLevelMatch(lesson: Lesson, riderLevel: string): number {
  const levels = lesson.levelTags || []
  if (levels.includes(riderLevel as any)) return 3
  if (riderLevel === 'intermediate') {
    if (levels.includes('beginner') || levels.includes('advanced')) return 1
  }
  return 0
}

function scoreGoalMatch(lesson: Lesson, goals: string[]): number {
  let score = 0
  const skillCode = lesson.primarySkillCode

  for (const goal of goals) {
    const targetSkills = GOAL_SKILL_MAP[goal] || []
    if (skillCode && targetSkills.includes(skillCode)) {
      score += 2
    }
  }

  // 檢查 slope tags 與 goal 的關聯
  const slopeTags = lesson.slopeTags || []
  if (goals.includes('moguls_intro') && slopeTags.includes('mogul')) score += 3
  if (goals.includes('powder_intro') && slopeTags.includes('powder')) score += 3
  if (goals.includes('park_intro') && slopeTags.includes('park')) score += 3

  return Math.min(score, 5)
}

function scoreSymptomMatch(lesson: Lesson, symptoms: Symptom[]): number {
  let score = 0
  const lessonText = `${lesson.what} ${lesson.title} ${lesson.why?.join(' ') || ''}`

  for (const symptom of symptoms) {
    const keywords = SYMPTOM_KEYWORDS[symptom.code] || []
    const hasMatch = keywords.some(kw => lessonText.includes(kw))
    if (hasMatch) {
      score += symptom.severity
    }
  }

  return Math.min(score, 5)
}

function scoreTerrainMatch(lesson: Lesson, preferred: string[]): number {
  const slopeTags = lesson.slopeTags || []
  const hasPreferred = slopeTags.some(t => preferred.includes(t))
  return hasPreferred ? 1 : 0
}

// ============================================
// Step 3: Schedule Path
// ============================================
export function schedulePath(
  state: RiderState,
  scored: ScoredLesson[],
  lessons: Lesson[],
  prereqs: LessonPrerequisite[],
  options: PathEngineOptions = {}
): LessonPlanItem[] {
  const { days = 1, perDayLessonCount = 4 } = options
  const lessonMap = new Map(lessons.map(l => [l.id, l]))
  const items: LessonPlanItem[] = []
  const usedIds = new Set<string>()

  for (let day = 1; day <= days; day++) {
    const dayItems: LessonPlanItem[] = []
    let order = 1

    // 1. 選核心 build 課程（score 最高）
    const core = scored.find(s => !usedIds.has(s.lessonId))
    if (!core) break

    usedIds.add(core.lessonId)
    const coreLesson = lessonMap.get(core.lessonId)
    dayItems.push({
      lessonId: core.lessonId,
      lessonTitle: coreLesson?.title,
      intent: 'build',
      dayIndex: day,
      orderInDay: order++,
      mustDo: true,
      rationale: buildRationale(core, state, coreLesson),
      estimatedMin: coreLesson?.estDurationMin || 15,
    })

    // 2. 填充其他課程
    while (dayItems.length < perDayLessonCount) {
      const next = scored.find(s => !usedIds.has(s.lessonId))
      if (!next) break

      usedIds.add(next.lessonId)
      const nextLesson = lessonMap.get(next.lessonId)
      
      // 決定 intent
      let intent: LessonIntent = 'apply'
      if (dayItems.length === 1 && next.breakdown.symptomMatch > 2) {
        intent = 'diagnose'
      }

      dayItems.push({
        lessonId: next.lessonId,
        lessonTitle: nextLesson?.title,
        intent,
        dayIndex: day,
        orderInDay: order++,
        mustDo: false,
        rationale: buildRationale(next, state, nextLesson),
        estimatedMin: nextLesson?.estDurationMin || 15,
      })
    }

    items.push(...dayItems)
  }

  return items
}

function buildRationale(scored: ScoredLesson, state: RiderState, lesson?: Lesson): string[] {
  const reasons: string[] = []
  const { breakdown } = scored

  if (breakdown.symptomMatch > 0) {
    const matchedSymptoms = state.symptoms
      .filter(s => {
        const keywords = SYMPTOM_KEYWORDS[s.code] || []
        const text = `${lesson?.what || ''} ${lesson?.title || ''}`
        return keywords.some(kw => text.includes(kw))
      })
      .map(s => s.description)
    if (matchedSymptoms.length) {
      reasons.push(`針對問題：${matchedSymptoms.join('、')}`)
    }
  }

  if (breakdown.goalMatch > 0) {
    reasons.push('符合學習目標')
  }

  if (breakdown.levelMatch >= 3) {
    reasons.push('難度適中')
  }

  if (breakdown.terrainMatch > 0) {
    reasons.push('適合常滑地形')
  }

  return reasons.length ? reasons : ['綜合評分推薦']
}

// ============================================
// Step 4: Build Summary
// ============================================
export function buildSummary(items: LessonPlanItem[], state: RiderState): string {
  const totalLessons = items.length
  const totalDays = Math.max(...items.map(i => i.dayIndex), 0)
  const symptoms = state.symptoms.map(s => s.description).join('、')
  const goals = state.profile.goals.join('、')

  return `根據你的問題（${symptoms || '無'}）和目標（${goals || '一般進步'}），` +
    `推薦 ${totalDays} 天共 ${totalLessons} 堂課程的學習路徑。`
}

// ============================================
// Main Entry Point
// ============================================
export function recommendPath(
  state: RiderState,
  lessons: Lesson[],
  skills: Skill[],
  prereqs: LessonPrerequisite[],
  options?: PathEngineOptions
): LearningPath {
  // 1. 過濾候選
  const candidates = filterCandidates(state, lessons)

  // 2. 評分
  const scored = scoreLessons(state, candidates, skills)

  // 3. 排程
  const items = schedulePath(state, scored, lessons, prereqs, options)

  // 4. 產生摘要
  const summary = buildSummary(items, state)

  return {
    riderId: state.profile.id,
    items,
    summary,
    totalDays: Math.max(...items.map(i => i.dayIndex), 0),
    totalLessons: items.length,
    generatedAt: new Date().toISOString(),
  }
}
