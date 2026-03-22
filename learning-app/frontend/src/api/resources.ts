import client from './client'

export const resourcesApi = {
  getResources: (planId: number, moduleId: string) =>
    client.get(`/plans/${planId}/modules/${moduleId}/resources`),
  getMediaRecommendations: (planId: number, moduleId: string, streamingServices: string[]) =>
    client.post(`/plans/${planId}/modules/${moduleId}/media`, { streaming_services: streamingServices }),
}
