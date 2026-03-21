import client from './client'

export const assessmentApi = {
  start: (skill: string, userId: number) =>
    client.post('/assessment/start', { skill, user_id: userId }),
  respond: (sessionId: number, answer: string) =>
    client.post('/assessment/respond', { session_id: sessionId, answer }),
  getSession: (sessionId: number) =>
    client.get(`/assessment/${sessionId}`),
}
