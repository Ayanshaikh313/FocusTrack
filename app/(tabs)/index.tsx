import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import auth from "@react-native-firebase/auth";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";
import { useRealUsage } from "../../src/hooks/useRealUsage";
import { AppUsage, useUsageStore } from "../../src/store/usageStore";

// ── Constants ─────────────────────────────────────────
const PAGE_BG = "#f5f3f1";
const CARD_BG = "#ffffff";
const SHADOW = "#1f2937";
const PURPLE = "#8b5cf6";
const GREEN = "#16c443";
const ORANGE = "#f59e0b";
const SOFT_ORANGE = "#fff0e6";

const APP_VISUALS: Record<
  string,
  {
    bg: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
    bar: string;
  }
> = {
  Instagram: {
    bg: "#fff0fb",
    icon: "instagram",
    iconColor: "#d946ef",
    bar: PURPLE,
  },
  YouTube: {
    bg: "#fff0f0",
    icon: "youtube",
    iconColor: "#ef4444",
    bar: "#ef4444",
  },
  WhatsApp: {
    bg: "#ecfff3",
    icon: "whatsapp",
    iconColor: "#16a34a",
    bar: GREEN,
  },
  Spotify: { bg: "#f0fff4", icon: "spotify", iconColor: "#1db954", bar: GREEN },
  Chrome: {
    bg: "#fff8e1",
    icon: "google-chrome",
    iconColor: "#f59e0b",
    bar: ORANGE,
  },
  Twitter: {
    bg: "#e8f4fd",
    icon: "twitter",
    iconColor: "#1da1f2",
    bar: "#1da1f2",
  },
  Facebook: {
    bg: "#e8f0fe",
    icon: "facebook",
    iconColor: "#1877f2",
    bar: "#1877f2",
  },
  Snapchat: {
    bg: "#fffde7",
    icon: "snapchat",
    iconColor: "#ffca28",
    bar: ORANGE,
  },
  Telegram: {
    bg: "#e3f2fd",
    icon: "telegram",
    iconColor: "#0088cc",
    bar: "#0088cc",
  },
  Gmail: { bg: "#fce8e6", icon: "gmail", iconColor: "#d93025", bar: "#d93025" },
  Maps: {
    bg: "#e8f5e9",
    icon: "google-maps",
    iconColor: "#34a853",
    bar: GREEN,
  },
  Netflix: {
    bg: "#fff0f0",
    icon: "netflix",
    iconColor: "#e50914",
    bar: "#e50914",
  },
  Brave: {
    bg: "#fff2eb",
    icon: "shield-search",
    iconColor: "#fb5d00",
    bar: ORANGE,
  },
  "VS Code": {
    bg: "#eef7ff",
    icon: "microsoft-visual-studio-code",
    iconColor: "#0ea5e9",
    bar: GREEN,
  },
  Phone: { bg: "#e8f5e9", icon: "phone", iconColor: "#16a34a", bar: GREEN },
  Camera: { bg: "#f3e8ff", icon: "camera", iconColor: "#8b5cf6", bar: PURPLE },
  Settings: {
    bg: "#f1f5f9",
    icon: "cog",
    iconColor: "#64748b",
    bar: "#64748b",
  },
  Clock: {
    bg: "#fff7ed",
    icon: "clock-outline",
    iconColor: "#ea580c",
    bar: ORANGE,
  },
  Files: { bg: "#f0fdf4", icon: "folder", iconColor: "#16a34a", bar: GREEN },
  Calculator: {
    bg: "#faf5ff",
    icon: "calculator",
    iconColor: "#7c3aed",
    bar: PURPLE,
  },
};

// ── Helpers ───────────────────────────────────────────
function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatLongDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const s = Math.floor((minutes * 60) % 60);
  if (!h) return `${m}m ${s}s`;
  return `${h}h ${m}m ${s}s`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function buildPolyline(values: number[], w: number, h: number) {
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  return values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
}

function buildArea(values: number[], w: number, h: number) {
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => ({ x: i * step, y: h - (v / max) * h }));
  const top = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  return `${top} L ${w} ${h} L 0 ${h} Z`;
}

// ── Drawer Menu ───────────────────────────────────────
function DrawerMenu({
  visible,
  onClose,
  userName,
}: {
  visible: boolean;
  onClose: () => void;
  userName: string;
}) {
  const menuItems = [
    { icon: "view-dashboard", label: "Dashboard" },
    { icon: "chart-bar", label: "Detailed Stats" },
    { icon: "target", label: "Goals & Limits" },
    { icon: "timer-outline", label: "Focus Mode" },
    { icon: "account-group", label: "Accountability" },
    { icon: "bell-outline", label: "Notifications" },
    { icon: "cog-outline", label: "Settings" },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={drawer.overlay}>
        <Pressable style={drawer.backdrop} onPress={onClose} />
        <View style={drawer.panel}>
          {/* Profile */}
          <View style={drawer.profile}>
            <View style={drawer.avatar}>
              <Text style={drawer.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={drawer.profileName}>{userName}</Text>
              <Text style={drawer.profileSub}>Free Plan</Text>
            </View>
          </View>

          {/* Menu items */}
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={drawer.menuItem}
              onPress={onClose}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={22}
                color={PURPLE}
                style={{ marginRight: 14 }}
              />
              <Text style={drawer.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          {/* Sign out */}
          <TouchableOpacity
            style={drawer.signOut}
            onPress={() => {
              onClose();
              auth().signOut();
            }}
          >
            <MaterialCommunityIcons
              name="logout"
              size={22}
              color="#ef4444"
              style={{ marginRight: 14 }}
            />
            <Text style={drawer.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Header ────────────────────────────────────────────
function SearchHeader({
  userName,
  onMenuPress,
}: {
  userName: string;
  onMenuPress: () => void;
}) {
  return (
    <View style={styles.searchShell}>
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="menu" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.searchText}>
          {getGreeting()}, {userName}
        </Text>
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

// ── Chart — single line, real hourly data ─────────────
function UsageChartCard({ totalMinutes }: { totalMinutes: number }) {
  const { hourlyUsage } = useUsageStore();
  const chartW = 292;
  const chartH = 132;

  // Use real hourly data or fallback to zeros
  const values =
    hourlyUsage.length > 0
      ? hourlyUsage.map((h) => h.minutes)
      : new Array(24).fill(0);

  // Only show up to current hour
  const currentHour = new Date().getHours();
  const displayValues = values.slice(0, currentHour + 1);

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartTopRow}>
        <Text style={styles.chartTitle}>Today's Usage</Text>
        <View style={styles.totalPill}>
          <Text style={styles.totalPillText}>
            {formatMinutes(totalMinutes)}
          </Text>
        </View>
      </View>

      <View style={styles.chartFrame}>
        <Svg width={chartW} height={chartH}>
          {/* Grid lines */}
          {Array.from({ length: 8 }).map((_, i) => {
            const x = (chartW / 7) * i;
            return (
              <Line
                key={i}
                x1={x}
                y1={0}
                x2={x}
                y2={chartH}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Area fill */}
          <Path
            d={buildArea(displayValues, chartW, chartH)}
            fill={PURPLE}
            opacity={0.12}
          />

          {/* Line */}
          <Polyline
            points={buildPolyline(displayValues, chartW, chartH)}
            fill="none"
            stroke={PURPLE}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Dots — only last point */}
          {displayValues.length > 0 &&
            (() => {
              const max = Math.max(...displayValues, 1);
              const lastIdx = displayValues.length - 1;
              const x = (chartW / (displayValues.length - 1 || 1)) * lastIdx;
              const y = chartH - (displayValues[lastIdx] / max) * chartH;
              return <Circle cx={x} cy={y} r={5} fill={PURPLE} />;
            })()}
        </Svg>
      </View>

      <View style={styles.chartAxisRow}>
        <Text style={styles.axisText}>12am</Text>
        <Text style={styles.axisText}>6am</Text>
        <Text style={styles.axisText}>Noon</Text>
        <Text style={styles.axisText}>6pm</Text>
        <Text style={styles.axisText}>Now</Text>
      </View>

      {/* Single legend */}
      <View style={styles.singleLegend}>
        <View style={[styles.legendDot, { backgroundColor: PURPLE }]} />
        <Text style={styles.legendName}>Mobile App Usage</Text>
        <Text style={styles.legendDuration}>{formatMinutes(totalMinutes)}</Text>
      </View>
    </View>
  );
}

// ── Filter Row ────────────────────────────────────────
function FilterRow() {
  return (
    <View style={styles.filtersRow}>
      <View style={styles.dayPicker}>
        <Pressable style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={22} color="#1f2937" />
        </Pressable>
        <View style={styles.dayPill}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={20}
            color={PURPLE}
          />
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

// ── App List ──────────────────────────────────────────
function AppListCard({
  apps,
  totalMinutes,
}: {
  apps: AppUsage[];
  totalMinutes: number;
}) {
  return (
    <View style={styles.appListCard}>
      <Text style={styles.cardTitle}>Top Apps</Text>
      {apps.slice(0, 8).map((app) => {
        const visual = APP_VISUALS[app.appName] ?? {
          bg: "#f3f4f6",
          icon: "apps" as any,
          iconColor: "#6b7280",
          bar: GREEN,
        };
        const pct = ((app.duration / totalMinutes) * 100).toFixed(1);

        return (
          <View key={app.packageName} style={styles.appListRow}>
            <View style={[styles.appIconShell, { backgroundColor: visual.bg }]}>
              <MaterialCommunityIcons
                name={visual.icon}
                size={30}
                color={visual.iconColor}
              />
            </View>
            <View style={styles.appMeta}>
              <View style={styles.appMetaTop}>
                <Text style={styles.appListName}>{app.appName}</Text>
                <Text style={styles.appListDuration}>
                  {formatLongDuration(app.duration)}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressActive,
                    {
                      width: `${Math.max((app.duration / totalMinutes) * 100, 4)}%`,
                      backgroundColor: visual.bar,
                    },
                  ]}
                />
              </View>
              <Text style={styles.appListPercent}>{pct}%</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────
export default function DashboardScreen() {
  const { hasPermission } = useRealUsage();
  const insets = useSafeAreaInsets();
  const { todayUsage } = useUsageStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = auth().currentUser;
  const userName =
    user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  if (!todayUsage) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading your stats...</Text>
      </View>
    );
  }

  return (
    <>
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userName={userName}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        <SearchHeader
          userName={userName}
          onMenuPress={() => setDrawerOpen(true)}
        />

        <FilterRow />

        <UsageChartCard totalMinutes={todayUsage.totalMinutes} />

        <AppListCard
          apps={todayUsage.apps}
          totalMinutes={todayUsage.totalMinutes}
        />
      </ScrollView>
    </>
  );
}

// ── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAGE_BG,
  },
  loadingText: { fontSize: 16, color: "#6b7280" },

  searchShell: { paddingHorizontal: 16, marginBottom: 14 },
  searchBar: {
    backgroundColor: CARD_BG,
    minHeight: 80,
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
    marginLeft: 16,
    fontSize: 17,
    color: "#2f2f2f",
    fontWeight: "500",
  },
  medalWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#f5c542",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -10,
    right: -12,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffa928",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  dayPicker: {
    flex: 1.1,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  arrowButton: { width: 40, alignItems: "center", justifyContent: "center" },
  dayPill: {
    flex: 1,
    minHeight: 56,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  dayPillText: { color: PURPLE, fontSize: 16, fontWeight: "500" },
  dropdownPill: {
    flex: 0.95,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: { color: "#111827", fontSize: 15, fontWeight: "500" },

  chartCard: {
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 14,
  },
  chartTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  totalPill: {
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  totalPillText: { color: PURPLE, fontWeight: "700", fontSize: 14 },
  chartFrame: { alignItems: "center", marginBottom: 8 },
  chartAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  axisText: { color: "#9ca3af", fontSize: 12 },
  singleLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendName: { flex: 1, color: "#374151", fontSize: 14 },
  legendDuration: { color: PURPLE, fontWeight: "700", fontSize: 14 },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  appListCard: {
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    paddingVertical: 12,
  },
  appIconShell: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  appMeta: { flex: 1 },
  appMetaTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  appListName: { flex: 1, color: "#111827", fontSize: 15, fontWeight: "700" },
  appListDuration: { color: "#374151", fontSize: 14, fontWeight: "500" },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
    marginRight: 50,
  },
  progressActive: { height: "100%", borderRadius: 999 },
  appListPercent: {
    marginTop: 5,
    alignSelf: "flex-end",
    color: "#9ca3af",
    fontSize: 13,
  },
});

// ── Drawer Styles ─────────────────────────────────────
const drawer = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  panel: {
    width: "72%",
    backgroundColor: CARD_BG,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "700", color: PURPLE },
  profileName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  profileSub: { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuLabel: { fontSize: 16, color: "#111827", fontWeight: "500" },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  signOutText: { fontSize: 16, color: "#ef4444", fontWeight: "600" },
});
