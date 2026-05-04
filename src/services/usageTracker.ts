// src/services/usageTracker.ts
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { logUsageToFirestore } from "./firebase";
import UsageStatsModule from "../../modules/usage-stats";

const TASK_NAME = "USAGE_SYNC_TASK";

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const stats = UsageStatsModule.getDailyUsage();
    await logUsageToFirestore(stats);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60 * 15,     // every 15 minutes
    stopOnTerminate: false,        // keep running after app close
    startOnBoot: true,             // restart after device reboot
  });
}
