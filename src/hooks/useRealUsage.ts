// src/hooks/useRealUsage.ts
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import UsageStatsModule from "../../modules/usage-stats";
import { useUsageStore } from "../store/usageStore";

export function useRealUsage() {
  const [hasPermission, setHasPermission] = useState(false);
  const { setTodayUsage, setWeeklyUsage } = useUsageStore();

  const checkAndLoad = async () => {
    const permitted = UsageStatsModule.hasPermission();
    setHasPermission(permitted);

    if (!permitted) {
      UsageStatsModule.requestPermission(); // opens settings
      return;
    }

    // Load real data
    const daily = UsageStatsModule.getDailyUsage();
    const weekly = UsageStatsModule.getWeeklyUsage();

    const totalMinutes = daily.reduce((sum, app) => sum + app.duration, 0);

    setTodayUsage({
      date: new Date().toISOString().split("T")[0],
      totalMinutes,
      apps: daily,
    });

    setWeeklyUsage(weekly);
  };

  useEffect(() => {
    checkAndLoad();

    // Reload when user comes back from settings
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkAndLoad();
    });

    return () => sub.remove();
  }, []);

  return { hasPermission };
}
