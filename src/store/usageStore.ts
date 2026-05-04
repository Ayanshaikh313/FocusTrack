// src/store/usageStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppUsage {
  appName: string;
  packageName: string;
  duration: number;
  category: 'social' | 'entertainment' | 'productivity' | 'other';
}

export interface DailyUsage {
  date: string;
  totalMinutes: number;
  apps: AppUsage[];
}

export interface HourlyData {
  hour: number;
  minutes: number;
}

export interface WeeklyUsage {
  date: string;
  totalMinutes: number;
}

export interface AppLimit {
  packageName: string;
  appName: string;
  limitMinutes: number;
  enabled: boolean;
}

interface UsageStore {
  todayUsage: DailyUsage | null;
  weeklyUsage: WeeklyUsage[];
  hourlyUsage: HourlyData[];
  dailyGoalMinutes: number;
  appLimits: AppLimit[];

  setTodayUsage: (usage: DailyUsage) => void;
  setWeeklyUsage: (usage: WeeklyUsage[]) => void;
  setHourlyUsage: (usage: HourlyData[]) => void;
  setDailyGoal: (minutes: number) => void;
  setAppLimit: (limit: AppLimit) => void;
  removeAppLimit: (packageName: string) => void;
  toggleAppLimit: (packageName: string) => void;
  loadLimits: () => Promise<void>;
}

export const useUsageStore = create<UsageStore>((set, get) => ({
  todayUsage: null,
  weeklyUsage: [],
  hourlyUsage: [],
  dailyGoalMinutes: 180,
  appLimits: [],

  setTodayUsage: (usage) => set({ todayUsage: usage }),
  setWeeklyUsage: (usage) => set({ weeklyUsage: usage }),
  setHourlyUsage: (usage) => set({ hourlyUsage: usage }),
  setDailyGoal: (minutes) => set({ dailyGoalMinutes: minutes }),

  setAppLimit: async (limit) => {
    const current = get().appLimits;
    const exists = current.findIndex(l => l.packageName === limit.packageName);
    const updated = exists >= 0
      ? current.map(l => l.packageName === limit.packageName ? limit : l)
      : [...current, limit];

    set({ appLimits: updated });
    await AsyncStorage.setItem('appLimits', JSON.stringify(updated));
  },

  removeAppLimit: async (packageName) => {
    const updated = get().appLimits.filter(l => l.packageName !== packageName);
    set({ appLimits: updated });
    await AsyncStorage.setItem('appLimits', JSON.stringify(updated));
  },

  toggleAppLimit: async (packageName) => {
    const updated = get().appLimits.map(l =>
      l.packageName === packageName ? { ...l, enabled: !l.enabled } : l
    );
    set({ appLimits: updated });
    await AsyncStorage.setItem('appLimits', JSON.stringify(updated));
  },

  loadLimits: async () => {
    const raw = await AsyncStorage.getItem('appLimits');
    if (raw) set({ appLimits: JSON.parse(raw) });
  },
}));
