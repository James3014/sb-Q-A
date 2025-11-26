import lessonsData from '@/data/lessons.json'

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

const lessons = lessonsData as unknown as Lesson[]

export function getLessons(): Lesson[] {
  return lessons
}

export function getLessonById(id: string): Lesson | null {
  return lessons.find(l => l.id === id) || null
}

export interface FilterOptions {
  level?: string
  slope?: string
  skill?: string
  search?: string
}

export function filterLessons(options: FilterOptions): Lesson[] {
  let result = lessons

  if (options.level) {
    result = result.filter(l => l.level_tags.includes(options.level!))
  }
  if (options.slope) {
    result = result.filter(l => l.slope_tags.includes(options.slope!))
  }
  if (options.skill) {
    result = result.filter(l => l.casi?.Primary_Skill === options.skill)
  }
  if (options.search) {
    const s = options.search.toLowerCase()
    result = result.filter(l =>
      l.what?.toLowerCase().includes(s) ||
      l.title?.toLowerCase().includes(s) ||
      l.why?.some(w => w.toLowerCase().includes(s))
    )
  }

  return result
}

export function getAllTags() {
  const levels = new Set<string>()
  const slopes = new Set<string>()
  const skills = new Set<string>()

  lessons.forEach(l => {
    l.level_tags?.forEach(t => levels.add(t))
    l.slope_tags?.forEach(t => slopes.add(t))
    if (l.casi?.Primary_Skill) skills.add(l.casi.Primary_Skill)
  })

  return {
    levels: Array.from(levels),
    slopes: Array.from(slopes),
    skills: Array.from(skills)
  }
}
