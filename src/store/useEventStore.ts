import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type EventStatus = 'Tentativo' | 'Apartado';

export interface SalonEvent {
  id: string;
  date: string; // YYYY-MM-DD
  status: EventStatus;
  soldBy: string;
  advancePayment?: string; // using string for easier input handling (e.g. "500.00")
  totalPrice?: string;
  notes?: string;
  googleCalendarId?: string;
}

interface EventStore {
  events: SalonEvent[];
  googleAccessToken: string | null;
  addEvent: (event: SalonEvent) => void;
  updateEvent: (id: string, updatedEvent: Partial<SalonEvent>) => void;
  deleteEvent: (id: string) => void;
  setGoogleAccessToken: (token: string | null) => void;
}

export const useEventStore = create<EventStore>()(
  persist(
    (set) => ({
      events: [],
      googleAccessToken: null,
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),
      updateEvent: (id, updatedEvent) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updatedEvent } : e
          ),
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
      setGoogleAccessToken: (token) => set({ googleAccessToken: token }),
    }),
    {
      name: 'salon-events-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
