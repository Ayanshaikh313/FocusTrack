import { NativeModule, requireNativeModule } from 'expo-modules-core';

export interface AppUsageStat {
  appName: string;
  packageName: string;
  duration: number;
  category: 'social' | 'entertainment' | 'productivity' | 'other';
}

export interface WeeklyDay {
  date: string;
  totalMinutes: number;
}

export interface HourlyData {
  hour: number;
  minutes: number;
}

declare class UsageStatsModule extends NativeModule {
  hasPermission(): boolean;
  requestPermission(): void;
  getDailyUsage(): AppUsageStat[];
  getWeeklyUsage(): WeeklyDay[];
  getHourlyUsage(): HourlyData[];
}

export default requireNativeModule<UsageStatsModule>('UsageStats');