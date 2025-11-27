import { getSupabase } from './supabase'

export interface Lesson {
  id: string
  title: string
  level_tags: string[]
  slope_tags: string[]
  what: string
  why: string[]
  how: { text: string; image?: string | null }[]
  signals: { correct: string[]; wrong: string[] }
  casi: { Primary_Skill?: string | null; Core_Competency?: string | null }
  is_premium?: boolean
}

export async function getLessons(): Promise<Lesson[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('id')

  if (error) {
    console.error('[getLessons]', error)
    return []
  }

  return data || []
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getLessonById]', error)
    return null
  }

  return data
}

export async function searchLessons(query: string): Promise<Lesson[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const q = `%${query}%`
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .or(`title.ilike.${q},what.ilike.${q}`)
    .order('id')

  if (error) {
    console.error('[searchLessons]', error)
    return []
  }

  return data || []
}


// 取得相關課程（基於技能和程度）
export function getRelatedLessons(
  currentLesson: Lesson, 
  allLessons: Lesson[]
): { prerequisite: Lesson | null; next: Lesson | null; similar: Lesson[] } {
  const skill = currentLesson.casi?.Primary_Skill
  const level = currentLesson.level_tags?.[0]
  
  const sameSkill = allLessons.filter(l => 
    l.id !== currentLesson.id && l.casi?.Primary_Skill === skill
  )
  
  const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 }
  const currentLevelOrder = levelOrder[level as keyof typeof levelOrder] ?? 1
  
  // 前置課程：同技能、較低程度
  const prerequisite = sameSkill
    .filter(l => (levelOrder[l.level_tags?.[0] as keyof typeof levelOrder] ?? 1) < currentLevelOrder)
    .sort((a, b) => (levelOrder[b.level_tags?.[0] as keyof typeof levelOrder] ?? 1) - (levelOrder[a.level_tags?.[0] as keyof typeof levelOrder] ?? 1))[0] || null

  // 下一步課程：同技能、較高程度
  const next = sameSkill
    .filter(l => (levelOrder[l.level_tags?.[0] as keyof typeof levelOrder] ?? 1) > currentLevelOrder)
    .sort((a, b) => (levelOrder[a.level_tags?.[0] as keyof typeof levelOrder] ?? 1) - (levelOrder[b.level_tags?.[0] as keyof typeof levelOrder] ?? 1))[0] || null

  // 相似課程：同技能、同程度
  const similar = sameSkill.filter(l => l.level_tags?.[0] === level).slice(0, 2)

  return { prerequisite, next, similar }
}
