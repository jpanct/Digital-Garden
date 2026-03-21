import { create } from 'zustand'
import { User } from '../types'

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem('digital-garden-user')
    if (stored) {
      return JSON.parse(stored) as User
    }
  } catch {
    // ignore parse errors
  }
  return null
}

export const useUserStore = create<UserStore>((set) => ({
  user: loadUserFromStorage(),
  setUser: (user: User) => {
    localStorage.setItem('digital-garden-user', JSON.stringify(user))
    set({ user })
  },
  clearUser: () => {
    localStorage.removeItem('digital-garden-user')
    set({ user: null })
  },
}))
