import { BookOpen, Sprout } from 'lucide-react'
import { Resource } from '../../types'
import ResourceCard from './ResourceCard'

interface ResourceListProps {
  resources: Resource[];
  isLoading: boolean;
}

function PlantingLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <div className="relative">
        <div className="bg-garden-600 text-white rounded-full p-5 animate-bounce" style={{ animationDuration: '2s' }}>
          <Sprout className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-garden-200 rounded-full blur-sm opacity-60" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-garden-800 text-lg">Planting your seed...</p>
        <p className="text-sm text-gray-500 mt-1">Finding the best resources for you</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-garden-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ResourceList({ resources, isLoading }: ResourceListProps) {
  if (isLoading) {
    return <PlantingLoader />
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
