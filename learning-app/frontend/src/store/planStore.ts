import { create } from 'zustand'
import { LearningPlan, MilestoneUpdateResponse } from '../types'

interface PlanStore {
  plan: LearningPlan | null;
  setPlan: (plan: LearningPlan) => void;
  updateMilestone: (milestoneId: string, completed: boolean, response: MilestoneUpdateResponse) => void;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanStore>((set) => ({
  plan: null,
  setPlan: (plan: LearningPlan) => set({ plan }),
  updateMilestone: (milestoneId: string, completed: boolean, response: MilestoneUpdateResponse) => {
    set((state) => {
      if (!state.plan) return state

      const updatedModules = state.plan.plan_data.modules.map((module) => ({
        ...module,
        milestones: module.milestones.map((milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, completed }
            : milestone
        ),
      }))

      return {
        plan: {
          ...state.plan,
          completed_milestones: response.completed_milestones,
          garden_stage: response.garden_stage,
          plan_data: {
            ...state.plan.plan_data,
            modules: updatedModules,
          },
        },
      }
    })
  },
  clearPlan: () => set({ plan: null }),
}))
