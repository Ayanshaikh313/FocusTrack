import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "FocusTrack",
  slug: "focustrack",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash-icon.png",  // changed from splash.png
    backgroundColor: "#1a1a2e",
  },
  android: {
    package: "com.yourcompany.focustrack", // replace yourcompany with your name
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#1a1a2e",
    },
    permissions: [
      "android.permission.PACKAGE_USAGE_STATS",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.SYSTEM_ALERT_WINDOW",
    ],
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-asset",
    [
      "expo-notifications",
      {
        color: "#6c63ff",
        // removed notification-icon.png since file doesn't exist yet
      },
    ],
    [
      "expo-background-fetch",
      {
        minimumInterval: 900,
      },
    ],
  ],
  extra: {
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    claudeApiKey: process.env.CLAUDE_API_KEY,
    revenueCatKey: process.env.REVENUECAT_KEY,
    eas: {
      projectId: "1c73ec6c-9b8b-4000-93d8-f39765ca680a",
    },
  },
  updates: {
    url: "https://u.expo.dev/1c73ec6c-9b8b-4000-93d8-f39765ca680a",
    enabled: true,
    fallbackToCacheTimeout: 3000,
    checkAutomatically: "ON_LOAD",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
});