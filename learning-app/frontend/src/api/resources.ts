import client from './client'

export const resourcesApi = {
  getResources: (planId: number, moduleId: string) =>
    client.get(`/plans/${planId}/modules/${moduleId}/resources`),
}
