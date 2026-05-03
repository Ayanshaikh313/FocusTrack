import { create } from 'zustand';

export interface AppUsage {
  appName: string;
  packageName: string;
  duration: number; // in minutes
  icon?: string;
  category: 'social' | 'entertainment' | 'productivity' | 'other';
}

export interface DailyUsage {
  date: string;
  totalMinutes: number;
  apps: AppUsage[];
}

interface UsageStore {
  todayUsage: DailyUsage | null;
  weeklyUsage: DailyUsage[];
  dailyGoalMinutes: number;
  setTodayUsage: (usage: DailyUsage) => void;
  setWeeklyUsage: (usage: DailyUsage[]) => void;
  setDailyGoal: (minutes: number) => void;
}

export const useUsageStore = create<UsageStore>((set) => ({
  todayUsage: null,
  weeklyUsage: [],
  dailyGoalMinutes: 180, // default 3 hour goal

  setTodayUsage: (usage) => set({ todayUsage: usage }),
  setWeeklyUsage: (usage) => set({ weeklyUsage: usage }),
  setDailyGoal: (minutes) => set({ dailyGoalMinutes: minutes }),
}));
