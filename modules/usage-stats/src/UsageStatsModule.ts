import { NativeModule, requireNativeModule } from 'expo';

import { AppUsageStat, HourlyData, UsageStatsModuleEvents, WeeklyDay } from './UsageStats.types';

declare class UsageStatsModule extends NativeModule<UsageStatsModuleEvents> {
  hasPermission(): boolean;
  requestPermission(): void;
  getDailyUsage(): AppUsageStat[];
  getWeeklyUsage(): WeeklyDay[];
  getHourlyUsage(): HourlyData[];
}

// This call loads the native module object from the JSI.
export default requireNativeModule<UsageStatsModule>('UsageStats');
