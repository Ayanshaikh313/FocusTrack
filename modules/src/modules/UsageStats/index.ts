// src/modules/UsageStats/index.ts
import { NativeModule, requireNativeModule } from "expo-modules-core";

export interface AppUsageStat {
  appName: string;
  packageName: string;
  duration: number; // minutes
  category: "social" | "entertainment" | "productivity" | "other";
}

export interface WeeklyDay {
  date: string;
  totalMinutes: number;
}

declare class UsageStatsModule extends NativeModule {
  hasPermission(): boolean;
  requestPermission(): void;
  getDailyUsage(): AppUsageStat[];
  getWeeklyUsage(): WeeklyDay[];
}

export default requireNativeModule<UsageStatsModule>("UsageStats");
