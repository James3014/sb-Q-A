import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

export async function GET(req: NextRequest) {
  const { supabase, error } = await authorizeAdmin(req)
  if (error) return error

  const { data, error: listError } = await supabase
    .from('users')
    .select('id, email, subscription_type, subscription_expires_at, trial_used, created_at')
    .order('created_at', { ascending: false })

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  return NextResponse.json({ users: data || [] })
}
