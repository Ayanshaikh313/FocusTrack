import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import auth from "@react-native-firebase/auth";
import { useRealUsage } from "../../src/hooks/useRealUsage";
import { AppUsage, useUsageStore } from "../../src/store/usageStore";

const PAGE_BG = "#f5f3f1";
const CARD_BG = "#ffffff";
const SHADOW = "#1f2937";
const PURPLE = "#8b5cf6";
const GREEN = "#16c443";
const CYAN = "#27c2f1";
const ORANGE = "#f59e0b";
const SOFT_ORANGE = "#fff0e6";

const TREND_SERIES = {
  social: [38, 18, 6, 6, 6, 6, 6, 6, 5, 26, 7, 18, 16, 8, 20, 14, 22, 25, 20, 8],
  desktop: [0, 0, 0, 0, 0, 0, 0, 0, 8, 52, 41, 53, 39, 8, 0, 8, 54, 31, 12, 6],
  mobile: [0, 0, 0, 0, 0, 0, 0, 0, 5, 20, 17, 28, 30, 18, 3, 7, 48, 20, 10, 5],
};

const APP_VISUALS: Record<
  string,
  {
    bg: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
    bar: string;
  }
> = {
  Brave: {
    bg: "#fff2eb",
    icon: "shield-search",
    iconColor: "#fb5d00",
    bar: GREEN,
  },
  Instagram: {
    bg: "#fff0fb",
    icon: "instagram",
    iconColor: "#d946ef",
    bar: PURPLE,
  },
  "VS Code": {
    bg: "#eef7ff",
    icon: "microsoft-visual-studio-code",
    iconColor: "#0ea5e9",
    bar: GREEN,
  },
  "VLC for Android": {
    bg: "#fff8ed",
    icon: "cone",
    iconColor: "#f59e0b",
    bar: GREEN,
  },
  WhatsApp: {
    bg: "#ecfff3",
    icon: "whatsapp",
    iconColor: "#16a34a",
    bar: GREEN,
  },
  YouTube: {
    bg: "#fff0f0",
    icon: "youtube",
    iconColor: "#ef4444",
    bar: PURPLE,
  },
};

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hours) {
    return `${mins}m`;
  }

  return `${hours}h ${mins}m`;
}

function formatLongDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const secs = (minutes * 37) % 60;

  if (!hours) {
    return `${mins}m ${secs}s`;
  }

  return `${hours}h ${mins}m ${secs}s`;
}

function buildPolylinePoints(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  const stepX = width / (values.length - 1);

  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  const stepX = width / (values.length - 1);
  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = height - (value / max) * height;
    return { x, y };
  });

  const topPath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return `${topPath} L ${width} ${height} L 0 ${height} Z`;
}

function SearchHeader({ userName }: { userName: string }) {
  return (
    <View style={styles.searchShell}>
      <View style={styles.searchBar}>
        <Ionicons name="menu" size={28} color="#111827" />
        <Text style={styles.searchText}>Search in FocusTrack, {userName}</Text>
        <View style={styles.medalWrap}>
          <Ionicons name="trophy-outline" size={24} color={ORANGE} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>25</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function PromoBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.bannerIcon}>
        <MaterialCommunityIcons name="broom" size={22} color={ORANGE} />
      </View>
      <Text style={styles.bannerText}>
        Save hours every week with a cleaner inbox. No more distractions.
      </Text>
      <Ionicons name="close" size={26} color={ORANGE} />
    </View>
  );
}

function FilterRow() {
  return (
    <View style={styles.filtersRow}>
      <View style={styles.dayPicker}>
        <Pressable style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={22} color="#1f2937" />
        </Pressable>
        <View style={styles.dayPill}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={24} color={PURPLE} />
          <Text style={styles.dayPillText}>Today</Text>
        </View>
        <Pressable style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
        </Pressable>
      </View>

      <View style={styles.dropdownPill}>
        <Text style={styles.dropdownText}>All Categories</Text>
        <Ionicons name="chevron-down" size={18} color="#111827" />
      </View>
    </View>
  );
}

function UsageChartCard() {
  const chartWidth = 292;
  const chartHeight = 132;

  const series = useMemo(
    () => [
      {
        key: "desktop",
        label: "Desktop App",
        color: GREEN,
        duration: "5h 13m 33s",
        values: TREND_SERIES.desktop,
      },
      {
        key: "social",
        label: "Mobile App",
        color: PURPLE,
        duration: "3h 20m 59s",
        values: TREND_SERIES.social,
      },
      {
        key: "mobile",
        label: "Desktop Web",
        color: CYAN,
        duration: "2h 54m 19s",
        values: TREND_SERIES.mobile,
      },
    ],
    []
  );

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartTopRow}>
        <Text style={styles.chartTopLabel}>59m 44s</Text>
        <View style={styles.chartModePill}>
          <MaterialCommunityIcons name="chart-box" size={18} color="#fff" />
          <MaterialCommunityIcons name="chart-line" size={18} color="#fff" />
        </View>
      </View>

      <View style={styles.chartFrame}>
        <Svg width={chartWidth} height={chartHeight}>
          {Array.from({ length: 20 }).map((_, index) => {
            const x = (chartWidth / 19) * index;
            return <Line key={index} x1={x} y1={0} x2={x} y2={chartHeight} stroke="#d1d5db" strokeWidth="1" />;
          })}

          {series.map((item) => (
            <Path
              key={`${item.key}-area`}
              d={buildAreaPath(item.values, chartWidth, chartHeight)}
              fill={item.color}
              opacity={0.12}
            />
          ))}

          {series.map((item) => (
            <Polyline
              key={item.key}
              points={buildPolylinePoints(item.values, chartWidth, chartHeight)}
              fill="none"
              stroke={item.color}
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {series.map((item) =>
            item.values.map((value, index) => {
              const max = Math.max(...item.values, 1);
              const x = (chartWidth / (item.values.length - 1)) * index;
              const y = chartHeight - (value / max) * chartHeight;
              return <Circle key={`${item.key}-${index}`} cx={x} cy={y} r="3.7" fill={item.color} />;
            })
          )}
        </Svg>
      </View>

      <View style={styles.chartAxisRow}>
        <Text style={styles.axisText}>12am</Text>
        <Text style={styles.axisTextCenter}>Noon</Text>
        <Text style={styles.axisText}>8pm</Text>
      </View>

      <View style={styles.legendGrid}>
        {series.map((item) => (
          <View key={item.key} style={styles.legendBlock}>
            <View style={styles.legendNameRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendName}>{item.label}</Text>
            </View>
            <Text style={styles.legendDuration}>{item.duration}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalUsageRow}>
        <Ionicons name="eye-outline" size={24} color="#111827" />
        <Text style={styles.totalUsageLabel}>Total Usage:</Text>
        <Text style={styles.totalUsageValue}>11h 28m 51s</Text>
        <Ionicons name="arrow-forward" size={22} color={PURPLE} />
      </View>
    </View>
  );
}

function SetupCard() {
  return (
    <View style={styles.setupCard}>
      <Text style={styles.setupTitle}>Complete FocusTrack Setup (1/2)</Text>
      <View style={styles.setupAction}>
        <Text style={styles.setupShow}>Show</Text>
        <Ionicons name="chevron-down" size={18} color={PURPLE} />
      </View>
    </View>
  );
}

function AppListCard({ apps, totalMinutes }: { apps: AppUsage[]; totalMinutes: number }) {
  return (
    <View style={styles.appListCard}>
      {apps.slice(0, 6).map((app) => {
        const visual = APP_VISUALS[app.appName] ?? {
          bg: "#f3f4f6",
          icon: "apps",
          iconColor: "#6b7280",
          bar: GREEN,
        };
        const percentage = ((app.duration / totalMinutes) * 100).toFixed(1);

        return (
          <View key={app.packageName} style={styles.appListRow}>
            <View style={[styles.appIconShell, { backgroundColor: visual.bg }]}>
              <MaterialCommunityIcons name={visual.icon} size={34} color={visual.iconColor} />
            </View>

            <View style={styles.appMeta}>
              <View style={styles.appMetaTop}>
                <Text style={styles.appListName}>{app.appName}</Text>
                <Text style={styles.appListDuration}>{formatLongDuration(app.duration)}</Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressActive,
                    {
                      width: `${Math.max((app.duration / totalMinutes) * 100, 8)}%`,
                      backgroundColor: visual.bar,
                    },
                  ]}
                />
              </View>

              <Text style={styles.appListPercent}>{percentage}%</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function DashboardScreen() {
const { hasPermission } = useRealUsage();
  const insets = useSafeAreaInsets();
  const { todayUsage } = useUsageStore();
  const user = auth().currentUser;
  const userName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Ayan";

  if (!todayUsage) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading your stats...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }}
      showsVerticalScrollIndicator={false}
    >
      <SearchHeader userName={userName} />
      <PromoBanner />
      <FilterRow />
      <UsageChartCard />
      <SetupCard />
      <AppListCard apps={todayUsage.apps} totalMinutes={todayUsage.totalMinutes} />

      <TouchableOpacity style={styles.signOutChip} onPress={() => auth().signOut()}>
        <Text style={styles.signOutText}>Sign Out</Text>
        <Text style={styles.signOutTime}>{formatMinutes(todayUsage.totalMinutes)} today</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAGE_BG,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  searchShell: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  searchBar: {
    backgroundColor: CARD_BG,
    minHeight: 88,
    borderRadius: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  searchText: {
    flex: 1,
    marginLeft: 18,
    fontSize: 17,
    color: "#2f2f2f",
  },
  medalWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#f5c542",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -10,
    right: -12,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffa928",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  banner: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: SOFT_ORANGE,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerIcon: {
    marginRight: 14,
  },
  bannerText: {
    flex: 1,
    color: "#ef8a22",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  dayPicker: {
    flex: 1.1,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  arrowButton: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPill: {
    flex: 1,
    minHeight: 60,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  dayPillText: {
    color: PURPLE,
    fontSize: 18,
    fontWeight: "500",
  },
  dropdownPill: {
    flex: 0.95,
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "500",
  },
  chartCard: {
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4,
  },
  chartTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  chartTopLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginLeft: 42,
  },
  chartModePill: {
    backgroundColor: "#d8b4fe",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 8,
  },
  chartFrame: {
    alignItems: "center",
    marginBottom: 8,
  },
  chartAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  axisText: {
    color: "#8c8c8c",
    fontSize: 14,
  },
  axisTextCenter: {
    color: "#8c8c8c",
    fontSize: 14,
    marginLeft: 20,
  },
  legendGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 18,
  },
  legendBlock: {
    flex: 1,
  },
  legendNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendName: {
    color: "#1f2937",
    fontSize: 13,
  },
  legendDuration: {
    marginLeft: 20,
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
  },
  totalUsageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
  },
  totalUsageLabel: {
    marginLeft: 8,
    color: "#111827",
    fontSize: 16,
  },
  totalUsageValue: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: "700",
  },
  setupCard: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    paddingHorizontal: 18,
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4,
  },
  setupTitle: {
    color: "#222",
    fontSize: 17,
    fontWeight: "500",
  },
  setupAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  setupShow: {
    color: PURPLE,
    fontSize: 17,
    fontWeight: "600",
  },
  appListCard: {
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 3,
  },
  appListRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  appIconShell: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  appMeta: {
    flex: 1,
  },
  appMetaTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 12,
  },
  appListName: {
    flex: 1,
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },
  appListDuration: {
    color: "#232323",
    fontSize: 16,
    fontWeight: "500",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    overflow: "hidden",
    marginRight: 64,
  },
  progressActive: {
    height: "100%",
    borderRadius: 999,
  },
  appListPercent: {
    marginTop: 6,
    alignSelf: "flex-end",
    color: "#7b7b7b",
    fontSize: 14,
  },
  signOutChip: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#fff7ed",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signOutText: {
    color: "#c2410c",
    fontSize: 15,
    fontWeight: "700",
  },
  signOutTime: {
    color: "#9a3412",
    fontSize: 13,
    fontWeight: "500",
  },
});
