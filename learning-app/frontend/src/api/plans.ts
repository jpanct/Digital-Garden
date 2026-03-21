import client from './client'

export const plansApi = {
  getPlan: (planId: number) =>
    client.get(`/plans/${planId}`),
  updateMilestone: (planId: number, milestoneId: string, completed: boolean) =>
    client.patch(`/plans/${planId}/milestones/${milestoneId}`, { completed }),
  getProgress: (planId: number) =>
    client.get(`/plans/${planId}/progress`),
  getUserPlans: (userId: number) =>
    client.get(`/users/${userId}/plans`),
}
