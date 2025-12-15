import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'
import { updateLessonWithValidation } from '@/lib/lessons/services/lessonService'
import {
  getLessonById,
  softDeleteLesson,
  setSupabaseGetter,
  resetSupabaseGetter,
} from '@/lib/lessons/repositories/lessonRepository'
import type { Lesson, CreateLessonInput } from '@/types/lessons'
import { ValidationError, NotFoundError } from '@/types/lessons'

async function withLessonSupabase<T>(client: any, callback: () => Promise<T>): Promise<T> {
  setSupabaseGetter(() => client)
  try {
    return await callback()
  } finally {
    resetSupabaseGetter()
  }
}

function handleLessonError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json({ ok: false, error: error.errors }, { status: 400 })
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 404 })
  }
  return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
}

const parseBody = async (req: NextRequest) => {
  try {
    return (await req.json()) as Partial<CreateLessonInput>
  } catch {
    throw new ValidationError({ base: 'Invalid JSON body' })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorizeAdmin(req)
  if (auth.error) return auth.error

  let payload: Partial<CreateLessonInput>
  try {
    payload = await parseBody(req)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ ok: false, error: error.errors }, { status: 400 })
    }
    throw error
  }

  try {
    const lesson = await withLessonSupabase(auth.supabase, () => updateLessonWithValidation(id, payload))
    return NextResponse.json({ ok: true, lesson }, { status: 200 })
  } catch (error) {
    return handleLessonError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorizeAdmin(req)
  if (auth.error) return auth.error

  try {
    await withLessonSupabase(auth.supabase, () => softDeleteLesson(id))
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    return handleLessonError(error)
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorizeAdmin(req)
  if (auth.error) return auth.error

  try {
    const lesson = await withLessonSupabase(auth.supabase, () => getLessonById(id))
    if ((lesson as Lesson & { deleted_at?: string | null }).deleted_at) {
      return NextResponse.json({ ok: false, error: 'Lesson not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, lesson }, { status: 200 })
  } catch (error) {
    return handleLessonError(error)
  }
}
