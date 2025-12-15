import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'
import { uploadAndLink } from '@/lib/lessons/services/imageService'
import { setSupabaseGetter, resetSupabaseGetter } from '@/lib/lessons/repositories/imageRepository'
import { ValidationError } from '@/types/lessons'

function buildError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(req: NextRequest) {
  const auth = await authorizeAdmin(req)
  if (auth.error) return auth.error

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return buildError('Invalid form data payload')
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return buildError('Missing file')
  }

  const lessonId = typeof formData.get('lessonId') === 'string' ? String(formData.get('lessonId')) : 'temp'
  const stepParam = formData.get('stepIndex')
  const stepIndex = typeof stepParam === 'string' && !Number.isNaN(Number(stepParam)) ? Number(stepParam) : 0

  setSupabaseGetter(() => auth.supabase)
  try {
    const result = await uploadAndLink(file, lessonId, stepIndex)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ ok: false, error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: '圖片上傳失敗' }, { status: 500 })
  } finally {
    resetSupabaseGetter()
  }
}
