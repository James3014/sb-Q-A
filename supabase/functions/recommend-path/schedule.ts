// Scheduling logic for recommend-path

import { LessonPlanItem, LessonIntent, PathEngineOptions, RiderState, ScoredLesson } from './types.ts'
import { SYMPTOM_KEYWORDS } from './score.ts'

export function schedulePath(
  state: RiderState,
  scored: ScoredLesson[],
  options: PathEngineOptions = {}
): LessonPlanItem[] {
  const { days = 1, perDayLessonCount = 4, includeWarmup = true } = options
  const items: LessonPlanItem[] = []
  const usedIds = new Set<string>()

  // 分離 warm-up 課程
  const warmups = scored.filter(s => s.isWarmup)
  const regular = scored.filter(s => !s.isWarmup)

  for (let day = 1; day <= days; day++) {
    let order = 1
    const dayItems: LessonPlanItem[] = []

    // 每天第一堂插入 warm-up（如果有且啟用）
    if (includeWarmup && day === 1) {
      const warmup = warmups.find(s => !usedIds.has(s.lesson.id))
      if (warmup) {
        usedIds.add(warmup.lesson.id)
        dayItems.push({
          lessonId: warmup.lesson.id,
          lessonTitle: warmup.lesson.title,
          intent: 'warmup',
          dayIndex: day,
          orderInDay: order++,
          mustDo: false,
          rationale: ['暖身練習'],
          estimatedMin: warmup.lesson.est_duration_min || 10,
        })
      }
    }

    // 填充一般課程
    for (const s of regular) {
      if (usedIds.has(s.lesson.id)) continue
      if (dayItems.length >= perDayLessonCount) break

      usedIds.add(s.lesson.id)

      const intent: LessonIntent = determineIntent(s, order, dayItems.length)
      const rationale = buildRationale(s, state)

      dayItems.push({
        lessonId: s.lesson.id,
        lessonTitle: s.lesson.title,
        intent,
        dayIndex: day,
        orderInDay: order++,
        mustDo: intent === 'build',
        rationale,
        estimatedMin: s.lesson.est_duration_min || 15,
      })
    }

    items.push(...dayItems)
  }

  return items
}

function determineIntent(scored: ScoredLesson, order: number, currentCount: number): LessonIntent {
  // 第一堂（非 warmup）為 build
  if (currentCount === 0 || (currentCount === 1 && order === 2)) {
    return 'build'
  }
  // 高症狀匹配為 diagnose
  if (scored.symptomMatch > 2) {
    return 'diagnose'
  }
  return 'apply'
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
  const hasWarmup = items.some(i => i.intent === 'warmup')

  let summary = `根據你的問題（${symptoms || '無'}）和目標（${goals || '一般進步'}），推薦 ${totalDays} 天共 ${items.length} 堂課程。`
  if (hasWarmup) summary += '包含暖身練習。'

  return summary
}
