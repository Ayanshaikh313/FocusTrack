import type { StyleProp, ViewStyle } from 'react-native';

export type AppUsageStat = {
  appName: string;
  packageName: string;
  duration: number;
  category: 'social' | 'entertainment' | 'productivity' | 'other';
};

export type WeeklyDay = {
  date: string;
  totalMinutes: number;
};

export type OnLoadEventPayload = {
  url: string;
};

export type UsageStatsModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type UsageStatsViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
