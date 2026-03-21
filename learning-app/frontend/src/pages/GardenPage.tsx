import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Sprout, ArrowLeft, Star, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { usePlanStore } from '../store/planStore'
import { plansApi } from '../api/plans'
import { LearningPlan } from '../types'
import GardenCanvas from '../components/garden/GardenCanvas'
import clsx from 'clsx'

const stageNames: Record<number, string> = {
  0: 'Seed',
  1: 'Sprout',
  2: 'Sapling',
  3: 'Blooming',
  4: 'Full Tree',
}

const stageDescriptions: Record<number, string> = {
  0: 'Your learning journey is just beginning. Plant the seed of knowledge!',
  1: 'You\'re making progress! The first green shoots are emerging from the soil.',
  2: 'Your skills are growing strong. The sapling stands tall with new leaves.',
  3: 'Beautiful blooms of knowledge are appearing. You\'re truly blossoming!',
  4: 'You\'ve grown a magnificent tree of knowledge! A true master of your craft.',
}

const stageEncouragement: Record<number, string> = {
  0: 'Every expert was once a beginner. Start completing milestones to watch your garden grow!',
  1: 'You\'re off to a great start! Keep learning and your plant will grow stronger.',
  2: 'Halfway there! Each milestone completed brings new growth to your garden.',
  3: 'Almost there! Your dedication is really showing in your beautiful garden.',
  4: 'You did it! Share your knowledge and plant new seeds of learning.',
}

const MILESTONES_PER_STAGE = 5

function ConfettiPiece({ index }: { index: number }) {
  const colors = ['#22c55e', '#4ade80', '#fde68a', '#fbcfe8', '#bfdbfe', '#ef4444']
  const color = colors[index % colors.length]
  const left = (index * 7.3) % 100
  const delay = (index * 0.15) % 3

  return (
    <div
      className="fixed top-0 w-2 h-2 rounded-sm pointer-events-none z-50"
      style={{
        left: `${left}%`,
        backgroundColor: color,
        animation: `fall 3s ease-in ${delay}s forwards`,
      }}
    />
  )
}

export default function GardenPage() {
  const { planId } = useParams<{ planId: string }>()
  const { plan, setPlan } = usePlanStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const numericPlanId = planId ? parseInt(planId, 10) : null

  useEffect(() => {
    if (!numericPlanId) return
    if (plan?.id === numericPlanId) return
    const fetchPlan = async () => {
      setIsLoading(true)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-garden-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!plan) return null

  const stage = plan.garden_stage
  const isFullTree = stage === 4
  const progressPercentage = plan.total_milestones > 0
    ? Math.round((plan.completed_milestones / plan.total_milestones) * 100)
    : 0

  // Calculate milestones to next stage
  const milestonesForNextStage = (stage + 1) * MILESTONES_PER_STAGE
  const milestonesInCurrentStage = plan.completed_milestones - stage * MILESTONES_PER_STAGE
  const stageProgress = isFullTree ? MILESTONES_PER_STAGE : Math.min(milestonesInCurrentStage, MILESTONES_PER_STAGE)
  const stageProgressPct = Math.round((stageProgress / MILESTONES_PER_STAGE) * 100)

  // Milestones needed for next stage
  const milestonesNeeded = isFullTree ? 0 : Math.max(0, milestonesForNextStage - plan.completed_milestones)

  // Upcoming incomplete milestones
  const incompleteMilestones = plan.plan_data.modules
    .flatMap((m) => m.milestones.filter((ms) => !ms.completed))
    .slice(0, milestonesNeeded || 3)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Confetti for stage 4 */}
      {isFullTree && (
        <div>
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
          <style>{`
            @keyframes fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Back link */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          to={`/plan/${plan.id}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-garden-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plan
        </Link>
      </div>

      {/* Plan info */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sprout className="w-5 h-5 text-garden-600" />
          <span className="text-sm font-medium text-garden-600">{plan.skill}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">{plan.plan_data.title}</h1>
      </div>

      {/* Large Garden Canvas */}
      <div className="bg-gradient-to-b from-sky-100 to-garden-50 rounded-3xl overflow-hidden border border-garden-200 shadow-lg mb-8">
        <GardenCanvas stage={stage} className="w-full h-80" />
      </div>

      {/* Stage info */}
      <div className={clsx(
        'rounded-2xl p-6 mb-6 border',
        isFullTree
          ? 'bg-gradient-to-br from-garden-50 to-garden-100 border-garden-300'
          : 'bg-white border-garden-100 shadow-sm'
      )}>
        <div className="flex items-center gap-3 mb-3">
          {isFullTree && <Star className="w-6 h-6 text-amber-400 fill-amber-400" />}
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Stage {stage}: {stageNames[stage]}
            </h2>
            <p className="text-gray-600 text-sm mt-0.5">{stageDescriptions[stage]}</p>
          </div>
        </div>

        {/* Progress stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center bg-white rounded-xl p-3 border border-garden-100">
            <p className="text-2xl font-bold text-garden-600">{plan.completed_milestones}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="text-center bg-white rounded-xl p-3 border border-garden-100">
            <p className="text-2xl font-bold text-gray-800">{plan.total_milestones}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="text-center bg-white rounded-xl p-3 border border-garden-100">
            <p className="text-2xl font-bold text-garden-600">{progressPercentage}%</p>
            <p className="text-xs text-gray-500">Progress</p>
          </div>
        </div>

        {/* Stage progress bar */}
        {!isFullTree && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Stage {stage} progress</span>
              <span>{stageProgress}/{MILESTONES_PER_STAGE} milestones</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-garden-400 to-garden-600 rounded-full transition-all duration-500"
                style={{ width: `${stageProgressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {milestonesNeeded > 0
                ? `${milestonesNeeded} more milestone${milestonesNeeded !== 1 ? 's' : ''} to reach Stage ${stage + 1}: ${stageNames[stage + 1]}`
                : 'Stage complete!'}
            </p>
          </div>
        )}
      </div>

      {/* Encouragement */}
      <div className="bg-garden-50 border border-garden-200 rounded-2xl p-5 mb-6">
        <p className="text-garden-800 text-sm leading-relaxed font-medium">
          {stageEncouragement[stage]}
        </p>
      </div>

      {/* Next milestones */}
      {!isFullTree && incompleteMilestones.length > 0 && (
        <div className="bg-white rounded-2xl border border-garden-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-garden-600" />
            Next milestones to complete
          </h3>
          <div className="space-y-2">
            {incompleteMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                <div className="w-2 h-2 rounded-full bg-garden-300 flex-shrink-0" />
                {milestone.text}
              </div>
            ))}
          </div>
          <Link
            to={`/plan/${plan.id}`}
            className="mt-4 inline-flex items-center gap-2 text-sm text-garden-600 font-medium hover:text-garden-700 transition-colors"
          >
            View all milestones
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
