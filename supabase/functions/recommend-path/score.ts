// Scoring logic for recommend-path

import { Lesson, RiderState, ScoredLesson, LessonPrerequisite } from './types.ts'

// Symptom → Keyword mapping
export const SYMPTOM_KEYWORDS: Record<string, string[]> = {
  rear_seat: ['後座', '後腳', '後重', '壓後', '重心後'],
  fear_speed: ['控速', '減速', '速度', '煞車', '太快'],
  ice_chatter: ['冰面', '抖', '震動', '突突', '硬雪'],
  edge_stuck: ['換刃', '卡', '卡頓', '不順'],
  mogul_fear: ['蘑菇', '包', 'mogul'],
  weak_toeside: ['前刃弱', '前刃不穩'],
  weak_heelside: ['後刃弱', '後刃不穩'],
  standing_tall: ['站直', '站太直', '起身'],
  counter_rotation: ['反擰', '上下分離', '扭曲'],
  locked_knees: ['膝蓋', '鎖死', '膝直'],
}

// Goal → Skill mapping
export const GOAL_SKILL_MAP: Record<string, string[]> = {
  control_speed: ['PRESSURE_CONTROL', 'TIMING_COORD'],
  moguls_intro: ['PRESSURE_CONTROL', 'TIMING_COORD'],
  powder_intro: ['STANCE_BALANCE', 'PRESSURE_CONTROL'],
  ice_stability: ['EDGE_CONTROL', 'STANCE_BALANCE'],
  park_intro: ['TIMING_COORD', 'ROTATION'],
  carving_intro: ['EDGE_CONTROL', 'PRESSURE_CONTROL'],
  general_progress: ['STANCE_BALANCE', 'EDGE_CONTROL'],
}

// Warm-up 課程關鍵字（基礎站姿、平地練習）
const WARMUP_KEYWORDS = ['平地', '站姿', '居中', '企鵝', '基礎']

export function filterCandidates(
  state: RiderState,
  lessons: Lesson[],
  prereqs?: LessonPrerequisite[]
): Lesson[] {
  const completedIds = new Set(
    state.completedLessons
      .filter(c => c.status === 'completed' && !c.stillWrongSignals?.length)
      .map(c => c.lessonId)
  )

  // 建立 hard prerequisite map
  const hardPrereqMap = new Map<string, string[]>()
  if (prereqs) {
    for (const p of prereqs) {
      if (p.type === 'hard') {
        const list = hardPrereqMap.get(p.lesson_id) || []
        list.push(p.prerequisite_id)
        hardPrereqMap.set(p.lesson_id, list)
      }
    }
  }

  return lessons.filter(lesson => {
    if (completedIds.has(lesson.id)) return false

    // Hard prerequisite 檢查：必須先完成
    const hardPrereqs = hardPrereqMap.get(lesson.id)
    if (hardPrereqs?.length) {
      const allMet = hardPrereqs.every(pid => completedIds.has(pid))
      if (!allMet) return false
    }

    const levels = lesson.level_tags || []
    if (state.profile.level === 'beginner' && levels.includes('advanced')) return false
    if (state.profile.level === 'intermediate') {
      if (levels.includes('advanced') && !levels.includes('intermediate')) {
        if (lesson.difficulty_score && lesson.difficulty_score > 3) return false
      }
    }

    if (state.profile.avoidTerrain?.length) {
      const terrains = lesson.slope_tags || []
      if (terrains.length > 0 && terrains.every(t => state.profile.avoidTerrain!.includes(t))) {
        return false
      }
    }

    return true
  })
}

export function scoreLessons(
  state: RiderState,
  candidates: Lesson[],
  prereqs?: LessonPrerequisite[]
): ScoredLesson[] {
  const recentIds = new Set(
    state.completedLessons
      .filter(c => c.completedAt && (Date.now() - new Date(c.completedAt).getTime()) / 86400000 <= 2)
      .map(c => c.lessonId)
  )

  const completedIds = new Set(
    state.completedLessons.filter(c => c.status === 'completed').map(c => c.lessonId)
  )

  // Soft prerequisite map
  const softPrereqMap = new Map<string, string[]>()
  if (prereqs) {
    for (const p of prereqs) {
      if (p.type === 'soft') {
        const list = softPrereqMap.get(p.lesson_id) || []
        list.push(p.prerequisite_id)
        softPrereqMap.set(p.lesson_id, list)
      }
    }
  }

  return candidates.map(lesson => {
    const levelMatch = lesson.level_tags?.includes(state.profile.level) ? 3 : 1

    let goalMatch = 0
    for (const goal of state.profile.goals) {
      const skills = GOAL_SKILL_MAP[goal] || []
      if (lesson.primary_skill_code && skills.includes(lesson.primary_skill_code)) goalMatch += 2
      if (goal === 'moguls_intro' && lesson.slope_tags?.includes('mogul')) goalMatch += 3
      if (goal === 'powder_intro' && lesson.slope_tags?.includes('powder')) goalMatch += 3
    }

    let symptomMatch = 0
    const text = `${lesson.what} ${lesson.title} ${lesson.why?.join(' ') || ''}`
    for (const symptom of state.symptoms) {
      const keywords = SYMPTOM_KEYWORDS[symptom.code] || []
      if (keywords.some(kw => text.includes(kw))) symptomMatch += symptom.severity
    }

    const terrainMatch = lesson.slope_tags?.some(t => state.profile.preferredTerrain.includes(t)) ? 1 : 0
    const novelty = recentIds.has(lesson.id) ? -3 : 0

    // Soft prerequisite bonus：如果前置課程已完成，加分
    let prereqBonus = 0
    const softPrereqs = softPrereqMap.get(lesson.id)
    if (softPrereqs?.length) {
      const metCount = softPrereqs.filter(pid => completedIds.has(pid)).length
      prereqBonus = metCount > 0 ? 2 : -1 // 有完成加分，沒完成小扣分
    }

    // Warm-up 識別
    const isWarmup = WARMUP_KEYWORDS.some(kw => lesson.title?.includes(kw) || lesson.what?.includes(kw))

    const score = 2 * levelMatch + 3 * Math.min(goalMatch, 5) + 3 * Math.min(symptomMatch, 5) + terrainMatch + novelty + prereqBonus

    return { lesson, score, levelMatch, goalMatch, symptomMatch, terrainMatch, isWarmup }
  }).sort((a, b) => b.score - a.score)
}
