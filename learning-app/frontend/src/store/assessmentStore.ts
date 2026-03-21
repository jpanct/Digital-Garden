import { create } from 'zustand'
import { AssessmentMessage } from '../types'

interface AssessmentStore {
  sessionId: number | null;
  skill: string;
  messages: AssessmentMessage[];
  isLoading: boolean;
  setSession: (sessionId: number, skill: string) => void;
  addMessage: (message: AssessmentMessage) => void;
  setLoading: (loading: boolean) => void;
  clearAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  sessionId: null,
  skill: '',
  messages: [],
  isLoading: false,
  setSession: (sessionId: number, skill: string) => set({ sessionId, skill }),
  addMessage: (message: AssessmentMessage) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  clearAssessment: () =>
    set({ sessionId: null, skill: '', messages: [], isLoading: false }),
}))
