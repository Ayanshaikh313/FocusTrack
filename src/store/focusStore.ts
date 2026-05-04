import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FocusSession {
  id: string;
  durationMinutes: number;
  completedAt: string;
  blockedApps: string[];
}

interface FocusStore {
  isActive: boolean;
  durationMinutes: number;
  remainingSeconds: number;
  blockedPackages: string[];
  sessions: FocusSession[];
  streak: number;

  setDuration: (minutes: number) => void;
  startSession: () => void;
  stopSession: () => void;
  tickSecond: () => void;
  toggleBlockedApp: (packageName: string) => void;
  loadSessions: () => Promise<void>;
  saveSession: (session: FocusSession) => Promise<void>;
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  isActive: false,
  durationMinutes: 25,
  remainingSeconds: 25 * 60,
  blockedPackages: [],
  sessions: [],
  streak: 0,

  setDuration: (minutes) => set({
    durationMinutes: minutes,
    remainingSeconds: minutes * 60,
  }),

  startSession: () => set({ isActive: true }),

  stopSession: () => {
    const { durationMinutes } = get();
    set({
      isActive: false,
      remainingSeconds: durationMinutes * 60,
    });
  },

  tickSecond: () => {
    const { remainingSeconds } = get();
    if (remainingSeconds <= 0) return;
    set({ remainingSeconds: remainingSeconds - 1 });
  },

  toggleBlockedApp: (packageName) => {
    const { blockedPackages } = get();
    const updated = blockedPackages.includes(packageName)
      ? blockedPackages.filter(p => p !== packageName)
      : [...blockedPackages, packageName];
    set({ blockedPackages: updated });
    AsyncStorage.setItem('blockedPackages', JSON.stringify(updated));
  },

  loadSessions: async () => {
    const raw = await AsyncStorage.getItem('focusSessions');
    const pkgs = await AsyncStorage.getItem('blockedPackages');
    if (raw) {
      const sessions: FocusSession[] = JSON.parse(raw);
      // Calculate streak
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const hasToday = sessions.some(s =>
        new Date(s.completedAt).toDateString() === today
      );
      const hasYesterday = sessions.some(s =>
        new Date(s.completedAt).toDateString() === yesterday
      );
      const streak = hasToday ? (hasYesterday ? sessions.length : 1) : 0;
      set({ sessions, streak });
    }
    if (pkgs) set({ blockedPackages: JSON.parse(pkgs) });
  },

  saveSession: async (session) => {
    const { sessions } = get();
    const updated = [session, ...sessions];
    set({ sessions: updated });
    await AsyncStorage.setItem('focusSessions', JSON.stringify(updated));
  },
}));