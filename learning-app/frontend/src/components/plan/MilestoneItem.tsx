import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Milestone } from '../../types'
import clsx from 'clsx'

interface MilestoneItemProps {
  milestone: Milestone;
  onToggle: (id: string, completed: boolean) => void;
  isLoading?: boolean;
}

export default function MilestoneItem({ milestone, onToggle, isLoading }: MilestoneItemProps) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(milestone.completed)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    setOptimisticCompleted(milestone.completed)
  }, [milestone.completed])

  const handleToggle = () => {
    if (isLoading) return
    const newCompleted = !optimisticCompleted
    setOptimisticCompleted(newCompleted)
    if (newCompleted) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)
    }
    onToggle(milestone.id, newCompleted)
  }

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-3 rounded-lg transition-all duration-200',
        optimisticCompleted ? 'bg-garden-50' : 'hover:bg-gray-50',
        showCelebration && 'animate-grow'
      )}
    >
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="flex-shrink-0 mt-0.5 cursor-pointer focus:outline-none"
        aria-label={optimisticCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-garden-500 animate-spin" />
        ) : optimisticCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-garden-600" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 hover:text-garden-400 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={clsx(
            'text-sm leading-snug transition-all duration-300',
            optimisticCompleted ? 'line-through text-gray-400' : 'text-gray-700'
          )}
        >
          {milestone.text}
        </span>
        {showCelebration && (
          <span className="ml-2 text-xs text-garden-600 font-medium animate-fade-in">
            Great job!
          </span>
        )}
      </div>
    </div>
  )
}
