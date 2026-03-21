import { Link, useNavigate, useParams } from 'react-router-dom'
import { Sprout, BookOpen, Flower2, LayoutDashboard, PlusCircle } from 'lucide-react'
import { usePlanStore } from '../../store/planStore'
import clsx from 'clsx'

interface SidebarProps {
  onClose?: () => void;
}

const stageIcons: Record<number, string> = {
  0: '🌱',
  1: '🌿',
  2: '🌳',
  3: '🌸',
  4: '🎋',
}

const stageNames: Record<number, string> = {
  0: 'Seed',
  1: 'Sprout',
  2: 'Sapling',
  3: 'Blooming',
  4: 'Full Tree',
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { plan } = usePlanStore()
  const navigate = useNavigate()
  const { planId, moduleId } = useParams()

  const handleNewSkill = () => {
    navigate('/')
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-garden-200 w-64">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-garden-100">
        <Sprout className="text-garden-600 w-7 h-7" />
        <span className="text-xl font-bold text-garden-800">Digital Garden</span>
      </div>

      {/* Plan info */}
      {plan && (
        <div className="px-4 py-3 bg-garden-50 border-b border-garden-100">
          <p className="text-xs text-garden-600 uppercase tracking-wider font-semibold mb-1">Current Plan</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{plan.plan_data.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-garden-100 text-garden-700 px-2 py-0.5 rounded-full">
              {plan.skill}
            </span>
            <span className="text-xs text-gray-500">
              {stageIcons[plan.garden_stage]} {stageNames[plan.garden_stage]}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {plan && (
          <>
            <Link
              to={`/plan/${plan.id}`}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                planId && !moduleId
                  ? 'bg-garden-100 text-garden-800'
                  : 'text-gray-600 hover:bg-garden-50 hover:text-garden-700'
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Link>

            <Link
              to={`/garden/${plan.id}`}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                window.location.pathname.includes('/garden/')
                  ? 'bg-garden-100 text-garden-800'
                  : 'text-gray-600 hover:bg-garden-50 hover:text-garden-700'
              )}
            >
              <Flower2 className="w-4 h-4" />
              My Garden
            </Link>

            {/* Divider */}
            <div className="pt-2 pb-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider px-3 font-semibold">Modules</p>
            </div>

            {/* Module links */}
            {plan.plan_data.modules.map((module) => {
              const completed = module.milestones.filter((m) => m.completed).length
              const total = module.milestones.length
              const isActive = moduleId === module.id
              return (
                <Link
                  key={module.id}
                  to={`/plan/${plan.id}/module/${module.id}`}
                  onClick={onClose}
                  className={clsx(
                    'flex items-start gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-garden-100 text-garden-800 font-medium'
                      : 'text-gray-600 hover:bg-garden-50 hover:text-garden-700'
                  )}
                >
                  <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate leading-snug">{module.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {completed}/{total} milestones
                    </p>
                  </div>
                </Link>
              )
            })}
          </>
        )}

        {!plan && (
          <div className="px-3 py-4 text-center">
            <Sprout className="w-10 h-10 text-garden-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Start learning to see your plan here</p>
          </div>
        )}
      </nav>

      {/* New Skill button */}
      <div className="p-3 border-t border-garden-100">
        <button
          onClick={handleNewSkill}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-garden-600 text-white rounded-lg text-sm font-medium hover:bg-garden-700 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          New Skill
        </button>
      </div>
    </div>
  )
}
