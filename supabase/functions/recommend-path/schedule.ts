// Scheduling logic for recommend-path

import { LessonPlanItem, LessonIntent, PathEngineOptions, RiderState, ScoredLesson } from './types.ts'
import { SYMPTOM_KEYWORDS } from './score.ts'

export function schedulePath(
  state: RiderState,
  scored: ScoredLesson[],
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
      const rationale = buildRationale(s, state)

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

function buildRationale(scored: ScoredLesson, state: RiderState): string[] {
  const reasons: string[] = []

  if (scored.symptomMatch > 0) {
    const matched = state.symptoms.filter(sym => {
      const kws = SYMPTOM_KEYWORDS[sym.code] || []
      return kws.some(kw => scored.lesson.what?.includes(kw) || scored.lesson.title?.includes(kw))
    })
    if (matched.length) {
      reasons.push(`針對問題：${matched.map(m => m.description).join('、')}`)
    }
  }

  if (scored.goalMatch > 0) reasons.push('符合學習目標')
  if (scored.levelMatch >= 3) reasons.push('難度適中')
  if (scored.terrainMatch > 0) reasons.push('適合常滑地形')

  return reasons.length ? reasons : ['綜合評分推薦']
}

export function buildSummary(items: LessonPlanItem[], state: RiderState): string {
  const totalDays = Math.max(...items.map(i => i.dayIndex), 0)
  const symptoms = state.symptoms.map(s => s.description).join('、')
  const goals = state.profile.goals.join('、')

  return `根據你的問題（${symptoms || '無'}）和目標（${goals || '一般進步'}），推薦 ${totalDays} 天共 ${items.length} 堂課程。`
}
