import { Video, Book, Code, GraduationCap, FileText, ExternalLink } from 'lucide-react'
import { Resource } from '../../types'
import clsx from 'clsx'

interface ResourceCardProps {
  resource: Resource;
}

const typeConfig = {
  video: {
    icon: Video,
    color: 'bg-red-50 text-red-600 border-red-100',
    badge: 'bg-red-100 text-red-700',
    label: 'Video',
  },
  github: {
    icon: Code,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    badge: 'bg-gray-200 text-gray-700',
    label: 'GitHub',
  },
  course: {
    icon: GraduationCap,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Course',
  },
  book: {
    icon: Book,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Book',
  },
  article: {
    icon: FileText,
    color: 'bg-green-50 text-green-600 border-green-100',
    badge: 'bg-green-100 text-green-700',
    label: 'Article',
  },
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const config = typeConfig[resource.resource_type] || typeConfig.article
  const Icon = config.icon

  return (
    <div className={clsx(
      'flex flex-col bg-white rounded-xl border p-4 hover:shadow-md transition-shadow duration-200',
      config.color
    )}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={clsx('p-2 rounded-lg', config.badge.split(' ')[0])}>
          <Icon className={clsx('w-4 h-4', config.color.split(' ')[1])} />
        </div>
        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', config.badge)}>
          {resource.source || config.label}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug">
        {resource.title}
      </h3>

      <p className="text-xs text-gray-500 flex-1 line-clamp-3 mb-3 leading-relaxed">
        {resource.description}
      </p>

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          'inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer',
          'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
        )}
      >
        Open Resource
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}
