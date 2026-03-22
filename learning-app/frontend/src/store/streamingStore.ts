import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StreamingService } from '../types'

interface StreamingStore {
  services: StreamingService[]
  toggle: (service: StreamingService) => void
}

export const useStreamingStore = create<StreamingStore>()(
  persist(
    (set) => ({
      services: [],
      toggle: (service) =>
        set((state) => ({
          services: state.services.includes(service)
            ? state.services.filter((s) => s !== service)
            : [...state.services, service],
        })),
    }),
    { name: 'streaming-preferences' }
  )
)
