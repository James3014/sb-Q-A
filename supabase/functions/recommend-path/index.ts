// Supabase Edge Function: recommend-path
// POST /functions/v1/recommend-path

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================
// Types (inline to avoid import issues)
// ============================================
type LessonLevel = 'beginner' | 'intermediate' | 'advanced'
type TerrainType = 'green' | 'blue' | 'black' | 'mogul' | 'park' | 'powder' | 'tree' | 'flat' | 'all'
type LessonIntent = 'diagnose' | 'build' | 'apply' | 'recover'

interface Symptom {
  code: string
  description: string
  severity: 1 | 2 | 3
}

interface RiderProfile {
  id: string
  level: LessonLevel
  preferredTerrain: TerrainType[]
  avoidTerrain?: TerrainType[]
  goals: string[]
  daysRemaining?: number
}

interface CompletedLesson {
  lessonId: string
  status: 'completed' | 'skipped' | 'struggling'
  stillWrongSignals?: string[]
  completedAt?: string
}

interface RiderState {
  profile: RiderProfile
  symptoms: Symptom[]
  completedLessons: CompletedLesson[]
}

interface Lesson {
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

interface LessonPlanItem {
  lessonId: string
  lessonTitle?: string
  intent: LessonIntent
  dayIndex: number
  orderInDay: number
  mustDo: boolean
  rationale: string[]
  estimatedMin?: number
}

interface PathEngineOptions {
  days?: number
  perDayLessonCount?: number
}

// ============================================
// Symptom Keywords Mapping
// ============================================
const SYMPTOM_KEYWORDS: Record<string, string[]> = {
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
// Engine Functions
// ============================================
function filterCandidates(state: RiderState, lessons: Lesson[]): Lesson[] {
  const completedIds = new Set(
    state.completedLessons
      .filter(c => c.status === 'completed' && !c.stillWrongSignals?.length)
      .map(c => c.lessonId)
  )

  return lessons.filter(lesson => {
    if (completedIds.has(lesson.id)) return false

    const lessonLevels = lesson.level_tags || []
    if (state.profile.level === 'beginner' && lessonLevels.includes('advanced')) return false
    if (state.profile.level === 'intermediate') {
      if (lessonLevels.includes('advanced') && !lessonLevels.includes('intermediate')) {
        if (lesson.difficulty_score && lesson.difficulty_score > 3) return false
      }
    }

    if (state.profile.avoidTerrain?.length) {
      const lessonTerrains = lesson.slope_tags || []
      const onlyAvoid = lessonTerrains.every(t => state.profile.avoidTerrain!.includes(t))
      if (onlyAvoid && lessonTerrains.length > 0) return false
    }

    return true
  })
}

function scoreLessons(state: RiderState, candidates: Lesson[]) {
  const recentIds = new Set(
    state.completedLessons
      .filter(c => c.completedAt && (Date.now() - new Date(c.completedAt).getTime()) / 86400000 <= 2)
      .map(c => c.lessonId)
  )

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

    const score = 2 * levelMatch + 3 * Math.min(goalMatch, 5) + 3 * Math.min(symptomMatch, 5) + terrainMatch + novelty

    return { lesson, score, levelMatch, goalMatch, symptomMatch, terrainMatch }
  }).sort((a, b) => b.score - a.score)
}

function schedulePath(
  state: RiderState,
  scored: { lesson: Lesson; score: number; symptomMatch: number }[],
  options: PathEngineOptions = {}
): LessonPlanItem[] {
  const { days = 1, perDayLessonCount = 4 } = options
  const items: LessonPlanItem[] = []
  const usedIds = new Set<string>()

  for (let day = 1; day <= days; day++) {
    let order = 1

    for (const s of scored) {
      if (usedIds.has(s.lesson.id)) continue
      if (items.filter(i => i.dayIndex === day).length >= perDayLessonCount) break

      usedIds.add(s.lesson.id)
      
      const intent: LessonIntent = order === 1 ? 'build' : (s.symptomMatch > 2 ? 'diagnose' : 'apply')
      const rationale: string[] = []
      
      if (s.symptomMatch > 0) {
        const matched = state.symptoms.filter(sym => {
          const kws = SYMPTOM_KEYWORDS[sym.code] || []
          return kws.some(kw => s.lesson.what?.includes(kw) || s.lesson.title?.includes(kw))
        })
        if (matched.length) rationale.push(`針對問題：${matched.map(m => m.description).join('、')}`)
      }
      if (rationale.length === 0) rationale.push('綜合評分推薦')

      items.push({
        lessonId: s.lesson.id,
        lessonTitle: s.lesson.title,
        intent,
        dayIndex: day,
        orderInDay: order++,
        mustDo: order === 2,
        rationale,
        estimatedMin: s.lesson.est_duration_min || 15,
      })
    }
  }

  return items
}

// ============================================
// Main Handler
// ============================================
serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { riderState, options } = await req.json() as {
      riderState: RiderState
      options?: PathEngineOptions
    }

    // 建立 Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 取得課程資料
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('id, title, level_tags, slope_tags, what, why, primary_skill_code, difficulty_score, est_duration_min')

    if (error) throw error

    // 執行推薦引擎
    const candidates = filterCandidates(riderState, lessons || [])
    const scored = scoreLessons(riderState, candidates)
    const items = schedulePath(riderState, scored, options)

    const totalDays = Math.max(...items.map(i => i.dayIndex), 0)
    const symptoms = riderState.symptoms.map(s => s.description).join('、')
    const goals = riderState.profile.goals.join('、')

    const result = {
      riderId: riderState.profile.id,
      items,
      summary: `根據你的問題（${symptoms || '無'}）和目標（${goals || '一般進步'}），推薦 ${totalDays} 天共 ${items.length} 堂課程。`,
      totalDays,
      totalLessons: items.length,
      generatedAt: new Date().toISOString(),
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
