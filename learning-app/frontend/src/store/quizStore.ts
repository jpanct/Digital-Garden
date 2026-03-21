import { create } from 'zustand'
import { Quiz, QuizResult } from '../types'

interface QuizStore {
  quiz: Quiz | null;
  answers: Record<string, number>;
  submitted: boolean;
  result: QuizResult | null;
  setQuiz: (quiz: Quiz) => void;
  setAnswer: (questionId: string, answerIndex: number) => void;
  setResult: (result: QuizResult) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  quiz: null,
  answers: {},
  submitted: false,
  result: null,
  setQuiz: (quiz: Quiz) => set({ quiz }),
  setAnswer: (questionId: string, answerIndex: number) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answerIndex } })),
  setResult: (result: QuizResult) => set({ result, submitted: true }),
  resetQuiz: () => set({ answers: {}, submitted: false, result: null }),
}))
