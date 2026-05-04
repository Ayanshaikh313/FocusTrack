package expo.modules.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Calendar

class UsageStatsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("UsageStats")

    Function("hasPermission") {
      val context = appContext.reactContext ?: return@Function false
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        appOps.unsafeCheckOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          context.packageName
        )
      } else {
        appOps.checkOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          context.packageName
        )
      }
      mode == AppOpsManager.MODE_ALLOWED
    }

    Function("requestPermission") {
      val context = appContext.reactContext ?: return@Function null
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
      intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
      context.startActivity(intent)
      null
    }

    Function("getDailyUsage") {
      val context = appContext.reactContext ?: return@Function emptyList<Map<String, Any>>()
      val usageStatsManager =
        context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

      val calendar = Calendar.getInstance()
      calendar.set(Calendar.HOUR_OF_DAY, 0)
      calendar.set(Calendar.MINUTE, 0)
      calendar.set(Calendar.SECOND, 0)
      calendar.set(Calendar.MILLISECOND, 0)
      val startTime = calendar.timeInMillis
      val endTime = System.currentTimeMillis()

      val stats = usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        startTime,
        endTime
      )

      val pm = context.packageManager

      stats
        .filter { it.totalTimeInForeground > 0 }
        .sortedByDescending { it.totalTimeInForeground }
        .take(15)
        .mapNotNull { stat ->
          try {
            val appInfo = pm.getApplicationInfo(stat.packageName, 0)
            val appName = pm.getApplicationLabel(appInfo).toString()
            val durationMinutes = (stat.totalTimeInForeground / 1000 / 60).toInt()

            if (durationMinutes < 1) {
              return@mapNotNull null
            }

            mapOf(
              "appName" to appName,
              "packageName" to stat.packageName,
              "duration" to durationMinutes,
              "category" to getCategoryForPackage(stat.packageName)
            )
          } catch (_: Exception) {
            null
          }
        }
    }

    Function("getWeeklyUsage") {
      val context = appContext.reactContext ?: return@Function emptyList<Map<String, Any>>()
      val usageStatsManager =
        context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

      val result = mutableListOf<Map<String, Any>>()

      repeat(7) { daysAgo ->
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_YEAR, -daysAgo)
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        val startTime = calendar.timeInMillis

        calendar.set(Calendar.HOUR_OF_DAY, 23)
        calendar.set(Calendar.MINUTE, 59)
        calendar.set(Calendar.SECOND, 59)
        calendar.set(Calendar.MILLISECOND, 999)
        val endTime = calendar.timeInMillis

        val stats = usageStatsManager.queryUsageStats(
          UsageStatsManager.INTERVAL_DAILY,
          startTime,
          endTime
        )

        val totalMinutes = stats
          .sumOf { it.totalTimeInForeground / 1000 / 60 }
          .toInt()

        val dateStr = String.format(
          "%04d-%02d-%02d",
          calendar.get(Calendar.YEAR),
          calendar.get(Calendar.MONTH) + 1,
          calendar.get(Calendar.DAY_OF_MONTH)
        )

        result.add(0, mapOf("date" to dateStr, "totalMinutes" to totalMinutes))
      }

      result
    }
  }

  private fun getCategoryForPackage(packageName: String): String {
    val social = listOf(
      "instagram",
      "facebook",
      "twitter",
      "snapchat",
      "tiktok",
      "whatsapp",
      "telegram",
      "linkedin"
    )
    val entertainment = listOf(
      "youtube",
      "netflix",
      "spotify",
      "hotstar",
      "prime",
      "vlc",
      "mx",
      "jio"
    )
    val productivity = listOf(
      "gmail",
      "docs",
      "sheets",
      "notion",
      "slack",
      "teams",
      "chrome",
      "brave",
      "firefox"
    )

    return when {
      social.any { packageName.contains(it) } -> "social"
      entertainment.any { packageName.contains(it) } -> "entertainment"
      productivity.any { packageName.contains(it) } -> "productivity"
      else -> "other"
    }
  }
}
