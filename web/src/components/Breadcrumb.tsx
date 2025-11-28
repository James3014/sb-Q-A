import Link from 'next/link'

interface BreadcrumbProps {
  skill?: string
  lessonTitle?: string
}

export function Breadcrumb({ skill, lessonTitle }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-4 flex-wrap">
      <Link href="/" className="hover:text-white transition-colors">
        首頁
      </Link>
      {skill && (
        <>
          <span>›</span>
          <Link href={`/?skill=${encodeURIComponent(skill)}`} className="hover:text-white transition-colors">
            {skill}
          </Link>
        </>
      )}
      {lessonTitle && (
        <>
          <span>›</span>
          <span className="text-zinc-200 truncate max-w-[200px]">{lessonTitle}</span>
        </>
      )}
    </nav>
  )
}
