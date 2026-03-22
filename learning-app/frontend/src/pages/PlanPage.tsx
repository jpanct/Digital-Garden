import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Flower2, Calendar, Target, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import { usePlanStore } from '../store/planStore'
import { plansApi } from '../api/plans'
import { LearningPlan, MilestoneUpdateResponse } from '../types'
import GardenCanvas from '../components/garden/GardenCanvas'
import ModuleCard from '../components/plan/ModuleCard'
import ProgressBar from '../components/plan/ProgressBar'
import clsx from 'clsx'

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
}

const stageNames: Record<number, string> = {
  0: 'Seed',
  1: 'Sprout',
  2: 'Sapling',
  3: 'Blooming',
  4: 'Full Tree',
}

function RegenerateModal({ onConfirm, onCancel, isLoading }: {
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 rounded-full p-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Regenerate plan?</h2>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          This will <span className="font-semibold text-red-600">permanently delete</span> your current plan, including:
        </p>
        <ul className="text-sm text-gray-500 mb-5 space-y-1 list-disc list-inside">
          <li>All progress and completed milestones</li>
          <li>Saved resources and notes</li>
          <li>Any quizzes you've taken</li>
        </ul>

        <p className="text-sm text-gray-600 mb-6">
          A brand new plan will be generated for the same skill and level. This cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Keep my plan
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Yes, regenerate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlanPage() {
  const { planId } = useParams<{ planId: string }>()
  const { plan, setPlan, updateMilestone } = usePlanStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | undefined>(undefined)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const numericPlanId = planId ? parseInt(planId, 10) : null

  useEffect(() => {
    if (!numericPlanId) return
    if (plan?.id === numericPlanId) return

    const fetchPlan = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await plansApi.getPlan(numericPlanId)
        setPlan(response.data as LearningPlan)
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.detail || 'Failed to load plan')
        } else {
          setError('Failed to load plan')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlan()
  }, [numericPlanId, plan?.id, setPlan])

  const handleRegenerate = async () => {
    if (!numericPlanId) return
    setIsRegenerating(true)
    try {
      const response = await plansApi.regenerate(numericPlanId)
      setPlan(response.data as LearningPlan)
      setShowRegenerateModal(false)
    } catch (err: unknown) {
      console.error('Failed to regenerate plan', err)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleMilestoneToggle = async (milestoneId: string, completed: boolean) => {
    if (!numericPlanId) return
    setLoadingMilestoneId(milestoneId)
    try {
      const response = await plansApi.updateMilestone(numericPlanId, milestoneId, completed)
      updateMilestone(milestoneId, completed, response.data as MilestoneUpdateResponse)
    } catch (err: unknown) {
      console.error('Failed to update milestone', err)
    } finally {
      setLoadingMilestoneId(undefined)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-garden-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading your plan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-sm">
          <p className="text-red-600 font-medium mb-2">Failed to load plan</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-garden-600 text-white rounded-lg text-sm hover:bg-garden-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!plan) return null

  const progressPercentage = plan.total_milestones > 0
    ? Math.round((plan.completed_milestones / plan.total_milestones) * 100)
    : 0

  const levelKey = plan.level_assessed?.toLowerCase() || 'beginner'
  const levelColor = levelColors[levelKey] || levelColors.beginner

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Plan header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={clsx('text-xs px-2.5 py-1 rounded-full font-semibold capitalize', levelColor)}>
              {plan.level_assessed}
            </span>
            <span className="text-xs bg-garden-100 text-garden-700 px-2.5 py-1 rounded-full font-medium">
              {plan.skill}
            </span>
          </div>
          <button
            onClick={() => setShowRegenerateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate plan
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{plan.plan_data.title}</h1>
        <p className="text-gray-600">{plan.plan_data.description}</p>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-garden-500" />
            <span>{plan.plan_data.estimated_weeks} weeks</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="w-4 h-4 text-garden-500" />
            <span>{plan.total_milestones} milestones</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-garden-500" />
            <span>{plan.completed_milestones} completed</span>
          </div>
        </div>
      </div>

      {/* Progress + Garden section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Overall progress */}
        <div className="bg-white rounded-2xl border border-garden-100 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-garden-600" />
            Overall Progress
          </h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{plan.completed_milestones} of {plan.total_milestones} milestones</span>
              <span className="font-semibold text-garden-600">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-garden-400 to-garden-600 rounded-full transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <ProgressBar value={plan.completed_milestones} max={plan.total_milestones} className="hidden" />
          <p className="text-sm text-gray-500">
            {progressPercentage === 0 && "Your journey is just beginning! Complete milestones to grow your garden."}
            {progressPercentage > 0 && progressPercentage < 50 && "Great start! Keep going."}
            {progressPercentage >= 50 && progressPercentage < 100 && "You're more than halfway there!"}
            {progressPercentage === 100 && "Congratulations! You've completed this plan!"}
          </p>
        </div>

        {/* Garden preview */}
        <div className="bg-white rounded-2xl border border-garden-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Flower2 className="w-5 h-5 text-garden-600" />
              My Garden
            </h2>
            <Link
              to={`/garden/${plan.id}`}
              className="text-sm text-garden-600 hover:text-garden-700 font-medium hover:underline"
            >
              View Full Garden
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <GardenCanvas stage={plan.garden_stage} className="w-full max-w-xs h-40" />
            <span className="mt-2 text-sm font-medium text-garden-700">
              Stage {plan.garden_stage}: {stageNames[plan.garden_stage]}
            </span>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Learning Modules</h2>
        <div className="space-y-4">
          {plan.plan_data.modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              planId={plan.id}
              onMilestoneToggle={handleMilestoneToggle}
              loadingMilestoneId={loadingMilestoneId}
            />
          ))}
        </div>
      </div>

      {showRegenerateModal && (
        <RegenerateModal
          onConfirm={handleRegenerate}
          onCancel={() => setShowRegenerateModal(false)}
          isLoading={isRegenerating}
        />
      )}
    </div>
  )
}
