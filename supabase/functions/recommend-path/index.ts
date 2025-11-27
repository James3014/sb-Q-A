// Supabase Edge Function: recommend-path
// POST /functions/v1/recommend-path

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { RiderState, PathEngineOptions, LearningPath } from './types.ts'
import { filterCandidates, scoreLessons } from './score.ts'
import { schedulePath, buildSummary } from './schedule.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { riderState, options } = await req.json() as {
      riderState: RiderState
      options?: PathEngineOptions
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch lessons + prerequisites
    const [lessonsRes, prereqsRes] = await Promise.all([
      supabase
        .from('lessons')
        .select('id, title, level_tags, slope_tags, what, why, primary_skill_code, difficulty_score, est_duration_min'),
      supabase
        .from('lesson_prerequisites')
        .select('lesson_id, prerequisite_id, type, note')
    ])

    if (lessonsRes.error) throw lessonsRes.error

    const lessons = lessonsRes.data || []
    const prereqs = prereqsRes.data || []

    // Execute engine with prerequisites
    const candidates = filterCandidates(riderState, lessons, prereqs)
    const scored = scoreLessons(riderState, candidates, prereqs)
    const items = schedulePath(riderState, scored, options)
    const summary = buildSummary(items, riderState)

    const result: LearningPath = {
      riderId: riderState.profile.id,
      items,
      summary,
      totalDays: Math.max(...items.map(i => i.dayIndex), 0),
      totalLessons: items.length,
      generatedAt: new Date().toISOString(),
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
