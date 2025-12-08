import { User } from '@supabase/supabase-js'

function parseEnvList(value?: string | null) {
  return (value || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
}

const ADMIN_EMAILS = parseEnvList(process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS)
const ADMIN_ROLES = parseEnvList(process.env.NEXT_PUBLIC_ADMIN_ROLES || process.env.ADMIN_ROLES || 'admin')

export function isAdminUser(user: User | null): boolean {
  if (!user) return false

  const email = user.email || ''
  if (ADMIN_EMAILS.includes(email)) return true

  const roles = (user.user_metadata?.roles as string[] | undefined) || []
  return roles.some(r => ADMIN_ROLES.includes(r))
}
