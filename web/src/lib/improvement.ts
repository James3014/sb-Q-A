import { getSupabase } from './supabase'

export interface ScoreRecord {
  date: string
  score: number
  lesson_id: string
}

export interface SkillStats {
  skill: string
  score: number
  count: number
}

export interface TrendStats {
  date: string
  count: number
}

export interface PracticeRecord {
  lesson_id: string
  title: string
  score: number
  date: string
}

export interface ImprovementData {
  improvement: number
  scores: ScoreRecord[]
  skills: SkillStats[]
  trend: TrendStats[]
  recentPractice: PracticeRecord[]
  totalPractices: number
}

// 🆕 新增介面：技能練習頻率分析
export interface SkillFrequency {
  skill: string
  practice_count: number
  avg_rating: number
  last_practice_date: string
}

// 🆕 新增介面：技能進步曲線資料點
export interface ImprovementPoint {
  date: string
  avg_rating: number
  practice_count: number
}

export async function getImprovementData(userId: string): Promise<ImprovementData | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const [improvement, scores, skills, trend, recent] = await Promise.all([
    supabase.rpc('get_improvement_score', { p_user_id: userId }),
    supabase.rpc('get_practice_scores', { p_user_id: userId }),
    supabase.rpc('get_skill_radar', { p_user_id: userId }),
    supabase.rpc('get_practice_trend', { p_user_id: userId, p_days: 30 }),
    supabase
      .from('practice_logs')
      .select('lesson_id, rating, created_at, lessons(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  interface RawPracticeLog {
    lesson_id: string
    rating: number
    created_at: string
    lessons: { title: string } | null
  }

  const recentPractice: PracticeRecord[] = (recent.data || []).map((r: unknown) => {
    const log = r as RawPracticeLog
    return {
      lesson_id: log.lesson_id,
      title: log.lessons?.title || log.lesson_id,
      score: log.rating || 0,
      date: log.created_at,
    }
  })

  return {
    improvement: improvement.data || 0,
    scores: scores.data || [],
    skills: skills.data || [],
    trend: trend.data || [],
    recentPractice,
    totalPractices: scores.data?.length || 0,
  }
}

// 🆕 查詢函數：獲取技能練習頻率分析（過去 30 天）
export async function getPracticeFrequencyBySkill(
  userId: string,
  days: number = 30
): Promise<SkillFrequency[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  try {
    const { data, error } = await supabase.rpc('get_practice_frequency_by_skill', {
      p_user_id: userId,
      p_days: days,
    })

    if (error) {
      console.error('Error fetching practice frequency:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Exception fetching practice frequency:', err)
    return []
  }
}

// 🆕 查詢函數：獲取單個技能的進步曲線（時間序列）
export async function getSkillImprovementCurve(
  userId: string,
  skill: string,
  days: number = 30
): Promise<ImprovementPoint[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  try {
    const { data, error } = await supabase.rpc('get_skill_improvement_curve', {
      p_user_id: userId,
      p_skill: skill,
      p_days: days,
    })

    if (error) {
      console.error('Error fetching skill curve:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Exception fetching skill curve:', err)
    return []
  }
}
