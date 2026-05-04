// app/(tabs)/limits.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppLimit, AppUsage, useUsageStore } from "../../src/store/usageStore";

// ── Constants ─────────────────────────────────────────
const PAGE_BG = "#f5f3f1";
const CARD_BG = "#ffffff";
const PURPLE = "#8b5cf6";
const GREEN = "#16c443";
const ORANGE = "#f59e0b";
const RED = "#ef4444";
const SHADOW = "#1f2937";

const APP_VISUALS: Record<
  string,
  {
    bg: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
  }
> = {
  Instagram: { bg: "#fff0fb", icon: "instagram", iconColor: "#d946ef" },
  YouTube: { bg: "#fff0f0", icon: "youtube", iconColor: "#ef4444" },
  WhatsApp: { bg: "#ecfff3", icon: "whatsapp", iconColor: "#16a34a" },
  Spotify: { bg: "#f0fff4", icon: "spotify", iconColor: "#1db954" },
  Chrome: { bg: "#fff8e1", icon: "google-chrome", iconColor: "#f59e0b" },
  Twitter: { bg: "#e8f4fd", icon: "twitter", iconColor: "#1da1f2" },
  Facebook: { bg: "#e8f0fe", icon: "facebook", iconColor: "#1877f2" },
  Snapchat: { bg: "#fffde7", icon: "snapchat", iconColor: "#ffca28" },
  Telegram: { bg: "#e3f2fd", icon: "telegram", iconColor: "#0088cc" },
  Gmail: { bg: "#fce8e6", icon: "gmail", iconColor: "#d93025" },
  Netflix: { bg: "#fff0f0", icon: "netflix", iconColor: "#e50914" },
};

// ── Helpers ───────────────────────────────────────────
function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

function getProgressColor(pct: number) {
  if (pct >= 100) return RED;
  if (pct >= 80) return ORANGE;
  return PURPLE;
}

// ── Set Limit Modal ───────────────────────────────────
function SetLimitModal({
  visible,
  app,
  existingLimit,
  onSave,
  onClose,
}: {
  visible: boolean;
  app: AppUsage | null;
  existingLimit?: AppLimit;
  onSave: (limit: AppLimit) => void;
  onClose: () => void;
}) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  useEffect(() => {
    if (existingLimit) {
      setHours(String(Math.floor(existingLimit.limitMinutes / 60)));
      setMinutes(String(existingLimit.limitMinutes % 60));
    } else {
      setHours("1");
      setMinutes("0");
    }
  }, [existingLimit, visible]);

  const handleSave = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const total = h * 60 + m;

    if (total < 5) {
      Alert.alert("Too low", "Please set a limit of at least 5 minutes.");
      return;
    }
    if (!app) return;

    onSave({
      packageName: app.packageName,
      appName: app.appName,
      limitMinutes: total,
      enabled: true,
    });
    onClose();
  };

  if (!app) return null;

  const visual = APP_VISUALS[app.appName] ?? {
    bg: "#f3f4f6",
    icon: "apps" as any,
    iconColor: "#6b7280",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          {/* App Header */}
          <View style={modal.appHeader}>
            <View style={[modal.appIcon, { backgroundColor: visual.bg }]}>
              <MaterialCommunityIcons
                name={visual.icon}
                size={32}
                color={visual.iconColor}
              />
            </View>
            <View>
              <Text style={modal.appName}>{app.appName}</Text>
              <Text style={modal.appUsed}>
                Used today: {formatMinutes(app.duration)}
              </Text>
            </View>
          </View>

          <Text style={modal.label}>Set Daily Limit</Text>

          {/* Time Picker */}
          <View style={modal.timePicker}>
            <View style={modal.timeUnit}>
              <TextInput
                style={modal.timeInput}
                value={hours}
                onChangeText={setHours}
                keyboardType="numeric"
                maxLength={2}
                selectTextOnFocus
              />
              <Text style={modal.timeLabel}>hours</Text>
            </View>
            <Text style={modal.timeSep}>:</Text>
            <View style={modal.timeUnit}>
              <TextInput
                style={modal.timeInput}
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="numeric"
                maxLength={2}
                selectTextOnFocus
              />
              <Text style={modal.timeLabel}>minutes</Text>
            </View>
          </View>

          {/* Quick presets */}
          <Text style={modal.presetsLabel}>Quick presets</Text>
          <View style={modal.presets}>
            {[15, 30, 45, 60, 90, 120].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={modal.preset}
                onPress={() => {
                  setHours(String(Math.floor(mins / 60)));
                  setMinutes(String(mins % 60));
                }}
              >
                <Text style={modal.presetText}>{formatMinutes(mins)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={modal.actions}>
            <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
              <Text style={modal.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal.saveBtn} onPress={handleSave}>
              <Text style={modal.saveText}>Save Limit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Limit Card ────────────────────────────────────────
function LimitCard({
  app,
  limit,
  onEdit,
  onRemove,
  onToggle,
}: {
  app: AppUsage;
  limit: AppLimit;
  onEdit: () => void;
  onRemove: () => void;
  onToggle: () => void;
}) {
  const pct = Math.min((app.duration / limit.limitMinutes) * 100, 100);
  const progressColor = getProgressColor(pct);
  const isOver = app.duration > limit.limitMinutes;
  const visual = APP_VISUALS[app.appName] ?? {
    bg: "#f3f4f6",
    icon: "apps" as any,
    iconColor: "#6b7280",
  };

  return (
    <View
      style={[styles.limitCard, !limit.enabled && styles.limitCardDisabled]}
    >
      {/* Top row */}
      <View style={styles.limitTop}>
        <View style={[styles.appIcon, { backgroundColor: visual.bg }]}>
          <MaterialCommunityIcons
            name={visual.icon}
            size={28}
            color={visual.iconColor}
          />
        </View>
        <View style={styles.limitInfo}>
          <Text style={styles.limitAppName}>{app.appName}</Text>
          <Text style={styles.limitSub}>
            {formatMinutes(app.duration)} used of{" "}
            {formatMinutes(limit.limitMinutes)} limit
          </Text>
        </View>
        <Switch
          value={limit.enabled}
          onValueChange={onToggle}
          trackColor={{ false: "#e5e7eb", true: "#ddd6fe" }}
          thumbColor={limit.enabled ? PURPLE : "#9ca3af"}
        />
      </View>

      {/* Progress bar */}
      {limit.enabled && (
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.pctText, { color: progressColor }]}>
              {isOver ? "⚠️ Over limit!" : `${Math.round(pct)}%`}
            </Text>
            <Text style={styles.remainText}>
              {isOver
                ? `${formatMinutes(app.duration - limit.limitMinutes)} over`
                : `${formatMinutes(limit.limitMinutes - app.duration)} left`}
            </Text>
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.limitActions}>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil" size={16} color={PURPLE} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={16}
            color={RED}
          />
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── App Picker Row ────────────────────────────────────
function AppPickerRow({ app, onAdd }: { app: AppUsage; onAdd: () => void }) {
  const visual = APP_VISUALS[app.appName] ?? {
    bg: "#f3f4f6",
    icon: "apps" as any,
    iconColor: "#6b7280",
  };

  return (
    <TouchableOpacity style={styles.pickerRow} onPress={onAdd}>
      <View style={[styles.pickerIcon, { backgroundColor: visual.bg }]}>
        <MaterialCommunityIcons
          name={visual.icon}
          size={26}
          color={visual.iconColor}
        />
      </View>
      <View style={styles.pickerInfo}>
        <Text style={styles.pickerName}>{app.appName}</Text>
        <Text style={styles.pickerUsed}>
          {formatMinutes(app.duration)} today
        </Text>
      </View>
      <View style={styles.addChip}>
        <Ionicons name="add" size={18} color={PURPLE} />
        <Text style={styles.addChipText}>Set Limit</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────
export default function LimitsScreen() {
  const insets = useSafeAreaInsets();
  const {
    todayUsage,
    appLimits,
    setAppLimit,
    removeAppLimit,
    toggleAppLimit,
    loadLimits,
  } = useUsageStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppUsage | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadLimits();
  }, []);

  if (!todayUsage) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading usage data...</Text>
      </View>
    );
  }

  // Apps that already have a limit
  const limitedApps = appLimits
    .map((limit) => ({
      limit,
      app: todayUsage.apps.find((a) => a.packageName === limit.packageName),
    }))
    .filter(({ app }) => app !== undefined) as {
    limit: AppLimit;
    app: AppUsage;
  }[];

  // Apps without a limit yet
  const unlimitedApps = todayUsage.apps.filter(
    (app) => !appLimits.find((l) => l.packageName === app.packageName),
  );

  const handleEdit = (app: AppUsage) => {
    setSelectedApp(app);
    setModalVisible(true);
  };

  const handleRemove = (packageName: string, appName: string) => {
    Alert.alert("Remove Limit", `Remove the daily limit for ${appName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeAppLimit(packageName),
      },
    ]);
  };

  return (
    <>
      <SetLimitModal
        visible={modalVisible}
        app={selectedApp}
        existingLimit={appLimits.find(
          (l) => l.packageName === selectedApp?.packageName,
        )}
        onSave={setAppLimit}
        onClose={() => {
          setModalVisible(false);
          setSelectedApp(null);
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Usage Limits</Text>
          <Text style={styles.headerSub}>Set daily limits for your apps</Text>
        </View>

        {/* Summary pill */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={18}
              color={PURPLE}
            />
            <Text style={styles.summaryText}>
              {appLimits.length} limit{appLimits.length !== 1 ? "s" : ""} set
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: "#fef3c7" }]}>
            <MaterialCommunityIcons
              name="alert-outline"
              size={18}
              color={ORANGE}
            />
            <Text style={[styles.summaryText, { color: ORANGE }]}>
              {
                limitedApps.filter(
                  ({ app, limit }) => app.duration > limit.limitMinutes,
                ).length
              }{" "}
              over limit
            </Text>
          </View>
        </View>

        {/* Active limits */}
        {limitedApps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Limits</Text>
            {limitedApps.map(({ app, limit }) => (
              <LimitCard
                key={app.packageName}
                app={app}
                limit={limit}
                onEdit={() => handleEdit(app)}
                onRemove={() => handleRemove(app.packageName, app.appName)}
                onToggle={() => toggleAppLimit(app.packageName)}
              />
            ))}
          </View>
        )}

        {/* Add limit section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowPicker(!showPicker)}
          >
            <Text style={styles.sectionTitle}>Add a Limit</Text>
            <Ionicons
              name={showPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={PURPLE}
            />
          </TouchableOpacity>

          {showPicker && (
            <View style={styles.pickerCard}>
              {unlimitedApps.length === 0 ? (
                <Text style={styles.allLimitedText}>
                  ✅ All your top apps have limits set!
                </Text>
              ) : (
                unlimitedApps.map((app) => (
                  <AppPickerRow
                    key={app.packageName}
                    app={app}
                    onAdd={() => {
                      setSelectedApp(app);
                      setModalVisible(true);
                    }}
                  />
                ))
              )}
            </View>
          )}
        </View>

        {/* Empty state */}
        {appLimits.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="timer-sand"
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>No limits set yet</Text>
            <Text style={styles.emptySub}>
              Tap "Add a Limit" above to set your first daily app limit
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

// ── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { fontSize: 16, color: "#6b7280" },

  header: { paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 14, color: "#6b7280", marginTop: 4 },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summaryText: { fontSize: 13, fontWeight: "600", color: PURPLE },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },

  limitCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  limitCardDisabled: { opacity: 0.6 },
  limitTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  limitInfo: { flex: 1 },
  limitAppName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  limitSub: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  progressSection: { marginBottom: 12 },
  progressTrack: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  pctText: { fontSize: 13, fontWeight: "700" },
  remainText: { fontSize: 13, color: "#9ca3af" },

  limitActions: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ede9fe",
    borderRadius: 10,
    paddingVertical: 8,
  },
  editBtnText: { color: PURPLE, fontWeight: "600", fontSize: 14 },
  removeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    paddingVertical: 8,
  },
  removeBtnText: { color: RED, fontWeight: "600", fontSize: 14 },

  pickerCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  pickerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pickerInfo: { flex: 1 },
  pickerName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  pickerUsed: { fontSize: 13, color: "#6b7280" },
  addChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ede9fe",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addChipText: { color: PURPLE, fontSize: 13, fontWeight: "600" },

  allLimitedText: {
    textAlign: "center",
    padding: 20,
    color: "#6b7280",
    fontSize: 15,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 20, fontWeight: "700", color: "#111827" },
  appUsed: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  timeUnit: { alignItems: "center" },
  timeInput: {
    width: 80,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ede9fe",
    backgroundColor: "#faf5ff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: PURPLE,
  },
  timeLabel: { fontSize: 13, color: "#9ca3af", marginTop: 6 },
  timeSep: {
    fontSize: 32,
    fontWeight: "700",
    color: "#d1d5db",
    marginBottom: 20,
  },
  presetsLabel: { fontSize: 14, color: "#6b7280", marginBottom: 10 },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  preset: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  presetText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#374151" },
  saveBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: PURPLE,
    alignItems: "center",
  },
  saveText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
