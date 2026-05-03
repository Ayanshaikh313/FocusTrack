import { useEffect } from 'react';
import { useUsageStore } from '../store/usageStore';

const MOCK_TODAY = {
  date: new Date().toISOString().split('T')[0],
  totalMinutes: 688,
  apps: [
    {
      appName: 'Brave',
      packageName: 'com.brave.browser',
      duration: 129,
      category: 'productivity' as const,
    },
    {
      appName: 'Instagram',
      packageName: 'com.instagram.android',
      duration: 73,
      category: 'social' as const,
    },
    {
      appName: 'VS Code',
      packageName: 'com.microsoft.vscode',
      duration: 65,
      category: 'productivity' as const,
    },
    {
      appName: 'VLC for Android',
      packageName: 'org.videolan.vlc',
      duration: 59,
      category: 'entertainment' as const,
    },
    {
      appName: 'WhatsApp',
      packageName: 'com.whatsapp',
      duration: 52,
      category: 'social' as const,
    },
    {
      appName: 'YouTube',
      packageName: 'com.google.android.youtube',
      duration: 48,
      category: 'entertainment' as const,
    },
    {
      appName: 'Chrome',
      packageName: 'com.android.chrome',
      duration: 44,
      category: 'productivity' as const,
    },
    {
      appName: 'LinkedIn',
      packageName: 'com.linkedin.android',
      duration: 39,
      category: 'social' as const,
    },
    {
      appName: 'Gmail',
      packageName: 'com.google.android.gm',
      duration: 31,
      category: 'productivity' as const,
    },
    {
      appName: 'Spotify',
      packageName: 'com.spotify.music',
      duration: 148,
      category: 'entertainment' as const,
    },
  ],
};

const MOCK_WEEKLY = [
  { date: '2025-04-24', totalMinutes: 612, apps: [] },
  { date: '2025-04-25', totalMinutes: 645, apps: [] },
  { date: '2025-04-26', totalMinutes: 588, apps: [] },
  { date: '2025-04-27', totalMinutes: 701, apps: [] },
  { date: '2025-04-28', totalMinutes: 642, apps: [] },
  { date: '2025-04-29', totalMinutes: 677, apps: [] },
  { date: '2025-04-30', totalMinutes: 688, apps: [] },
];

export function useMockUsage() {
  const { setTodayUsage, setWeeklyUsage } = useUsageStore();

  useEffect(() => {
    setTodayUsage(MOCK_TODAY);
    setWeeklyUsage(MOCK_WEEKLY);
  }, []);
}
