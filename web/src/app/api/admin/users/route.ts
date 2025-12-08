import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

export async function GET(req: NextRequest) {
  const { supabase, error } = await authorizeAdmin(req)
  if (error) return error

  const { data, error: listError } = await supabase.rpc('get_all_users')
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  return NextResponse.json({ users: data || [] })
}
