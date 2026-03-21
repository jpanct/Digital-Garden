import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Module } from '../../types'
import MilestoneItem from './MilestoneItem'
import ProgressBar from './ProgressBar'
import clsx from 'clsx'

interface ModuleCardProps {
  module: Module;
  planId: number;
  onMilestoneToggle: (milestoneId: string, completed: boolean) => void;
  loadingMilestoneId?: string;
}

export default function ModuleCard({ module, planId, onMilestoneToggle, loadingMilestoneId }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false)

  const completedCount = module.milestones.filter((m) => m.completed).length
  const totalCount = module.milestones.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const isComplete = completedCount === totalCount && totalCount > 0

  return (
    <div className={clsx(
      'bg-white rounded-xl border transition-shadow duration-200',
      isComplete ? 'border-garden-300 shadow-sm' : 'border-gray-200',
      'hover:shadow-md'
    )}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 cursor-pointer focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={clsx(
              'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5',
              isComplete ? 'bg-garden-100' : 'bg-gray-100'
            )}>
              <BookOpen className={clsx('w-4 h-4', isComplete ? 'text-garden-600' : 'text-gray-500')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-800 truncate">{module.title}</h3>
                {isComplete && (
                  <span className="text-xs bg-garden-100 text-garden-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    Complete
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {module.estimated_days} days
                </span>
                <span className="text-xs text-gray-500">
                  {completedCount}/{totalCount} milestones
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={clsx(
              'text-sm font-semibold',
              isComplete ? 'text-garden-600' : 'text-gray-600'
            )}>
              {percentage}%
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                isComplete ? 'bg-garden-500' : 'bg-garden-400'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-100">
          {module.description && (
            <p className="text-sm text-gray-600 mt-3 mb-3">{module.description}</p>
          )}

          <div className="space-y-1 mb-4">
            {module.milestones.map((milestone) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                onToggle={onMilestoneToggle}
                isLoading={loadingMilestoneId === milestone.id}
              />
            ))}
          </div>

          <ProgressBar value={completedCount} max={totalCount} className="mb-4" />

          <Link
            to={`/plan/${planId}/module/${module.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-garden-600 text-white text-sm rounded-lg hover:bg-garden-700 transition-colors cursor-pointer"
          >
            Study Module
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
