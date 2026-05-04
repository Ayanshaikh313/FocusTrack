// src/hooks/useRealUsage.ts
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import UsageStatsModule from "../../modules/usage-stats";
import { HourlyData, useUsageStore } from "../store/usageStore";

export function useRealUsage() {
  const [hasPermission, setHasPermission] = useState(false);
  const { setTodayUsage, setWeeklyUsage, setHourlyUsage } = useUsageStore();

  const checkAndLoad = async () => {
    const permitted = UsageStatsModule.hasPermission();
    setHasPermission(permitted);

    if (!permitted) {
      UsageStatsModule.requestPermission();
      return;
    }

    const daily = UsageStatsModule.getDailyUsage();
    const weekly = UsageStatsModule.getWeeklyUsage();
    const totalMinutes = daily.reduce((sum, app) => sum + app.duration, 0);

    setTodayUsage({
      date: new Date().toISOString().split("T")[0],
      totalMinutes,
      apps: daily,
    });

    setWeeklyUsage(weekly);

    // Safe check — only works after new EAS build with getHourlyUsage in Kotlin
    if (typeof UsageStatsModule.getHourlyUsage === "function") {
      const hourly = UsageStatsModule.getHourlyUsage() as HourlyData[];
      setHourlyUsage(hourly);
    }
  };

  useEffect(() => {
    checkAndLoad();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkAndLoad();
    });

    return () => sub.remove();
  }, []);

  return { hasPermission };
}
