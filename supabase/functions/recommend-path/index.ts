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
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { riderState, options } = await req.json() as {
      riderState: RiderState
      options?: PathEngineOptions
    }

    // Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch lessons
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('id, title, level_tags, slope_tags, what, why, primary_skill_code, difficulty_score, est_duration_min')

    if (error) throw error

    // Execute engine
    const candidates = filterCandidates(riderState, lessons || [])
    const scored = scoreLessons(riderState, candidates)
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
