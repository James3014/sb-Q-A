import { BackButton } from '@/components/BackButton'
import { Breadcrumb } from '@/components/Breadcrumb'

interface LessonHeaderProps {
  skill?: string | null
  title?: string
}

export function LessonHeader({ skill, title }: LessonHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <BackButton />
      </div>
      <Breadcrumb skill={skill || undefined} lessonTitle={title} />
    </div>
  )
}
