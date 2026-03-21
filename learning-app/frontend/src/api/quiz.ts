import client from './client'

export const quizApi = {
  generateQuiz: (planId: number, moduleId: string) =>
    client.post(`/plans/${planId}/modules/${moduleId}/quiz/generate`),
  getQuiz: (planId: number, moduleId: string) =>
    client.get(`/plans/${planId}/modules/${moduleId}/quiz`),
  submitAttempt: (quizId: number, userId: number, answers: Record<string, number>) =>
    client.post(`/quiz/${quizId}/attempt`, { user_id: userId, answers }),
  getAttempts: (quizId: number, userId: number) =>
    client.get(`/quiz/${quizId}/attempts/${userId}`),
}
