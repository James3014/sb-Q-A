import { getLessonById, getLessons } from '@/lib/lessons'
import { notFound } from 'next/navigation'
import LessonDetail from '@/components/LessonDetail'

export function generateStaticParams() {
  return getLessons().map(l => ({ id: l.id }))
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lesson = getLessonById(id)
  if (!lesson) notFound()

  return <LessonDetail lesson={lesson} />
}
