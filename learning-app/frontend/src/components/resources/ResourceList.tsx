import { BookOpen } from 'lucide-react'
import { Resource } from '../../types'
import ResourceCard from './ResourceCard'

interface ResourceListProps {
  resources: Resource[];
  isLoading: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="w-16 h-5 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 bg-gray-200 rounded mb-1 w-full" />
      <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
      <div className="h-3 bg-gray-100 rounded mb-1 w-full" />
      <div className="h-3 bg-gray-100 rounded mb-1 w-5/6" />
      <div className="h-3 bg-gray-100 rounded mb-4 w-2/3" />
      <div className="h-8 bg-gray-200 rounded-lg w-full" />
    </div>
  )
}

export default function ResourceList({ resources, isLoading }: ResourceListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No resources found</p>
        <p className="text-sm text-gray-400 mt-1">Resources will appear here once they are curated for this module.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
