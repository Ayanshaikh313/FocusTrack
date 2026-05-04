// app/(tabs)/focus.tsx
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusStore } from "../../src/store/focusStore";
import { useUsageStore } from "../../src/store/usageStore";

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
  Telegram: { bg: "#e3f2fd", icon: "telegram", iconColor: "#0088cc" },
  Netflix: { bg: "#fff0f0", icon: "netflix", iconColor: "#e50914" },
  Snapchat: { bg: "#fffde7", icon: "snapchat", iconColor: "#ffca28" },
};

const PRESETS = [
  { label: "25m", minutes: 25, desc: "Pomodoro" },
  { label: "45m", minutes: 45, desc: "Deep work" },
  { label: "1h", minutes: 60, desc: "Power hour" },
  { label: "2h", minutes: 120, desc: "Flow state" },
];

// ── Helpers ───────────────────────────────────────────
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

// ── Custom Duration Modal ─────────────────────────────
function CustomDurationModal({
  visible,
  onSave,
  onClose,
}: {
  visible: boolean;
  onSave: (minutes: number) => void;
  onClose: () => void;
}) {
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");

  const handleSave = () => {
    const total = parseInt(hours) * 60 + parseInt(minutes);
    if (total < 5) {
      Alert.alert("Too short", "Minimum focus session is 5 minutes.");
      return;
    }
    if (total > 480) {
      Alert.alert("Too long", "Maximum focus session is 8 hours.");
      return;
    }
    onSave(total);
    onClose();
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
          <Text style={modal.title}>Custom Duration</Text>
          <View style={modal.timePicker}>
            <View style={modal.timeUnit}>
              <TextInput
                style={modal.timeInput}
                value={hours}
                onChangeText={setHours}
                keyboardType="numeric"
                maxLength={1}
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
          <View style={modal.actions}>
            <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
              <Text style={modal.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal.saveBtn} onPress={handleSave}>
              <Text style={modal.saveText}>Set Duration</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Timer Ring ────────────────────────────────────────
function TimerRing({
  progress,
  remainingSeconds,
  isActive,
}: {
  progress: number;
  remainingSeconds: number;
  isActive: boolean;
}) {
  const size = 220;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * (1 - progress);

  return (
    <View style={[ring.container, { width: size, height: size }]}>
      {/* Background SVG ring */}
      <View style={ring.svgWrap}>
        <View
          style={[
            ring.track,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: stroke,
              borderColor: "#f3f4f6",
            },
          ]}
        />
        <View
          style={[
            ring.fill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: stroke,
              borderColor: isActive ? PURPLE : "#d1d5db",
              // Simulate progress with opacity — real SVG needs react-native-svg
              opacity: 0.3 + progress * 0.7,
            },
          ]}
        />
      </View>

      {/* Center content */}
      <View style={ring.center}>
        <Text style={[ring.timeText, !isActive && { color: "#9ca3af" }]}>
          {formatTime(remainingSeconds)}
        </Text>
        <Text style={ring.subText}>{isActive ? "Focus time" : "Ready"}</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────
export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const {
    isActive,
    durationMinutes,
    remainingSeconds,
    blockedPackages,
    sessions,
    streak,
    setDuration,
    startSession,
    stopSession,
    tickSecond,
    toggleBlockedApp,
    loadSessions,
    saveSession,
  } = useFocusStore();

  const { todayUsage } = useUsageStore();
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  // Timer tick
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        tickSecond();
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Session complete
  useEffect(() => {
    if (isActive && remainingSeconds === 0) {
      handleSessionComplete();
    }
  }, [remainingSeconds]);

  const handleSessionComplete = () => {
    Vibration.vibrate([0, 500, 200, 500]);
    stopSession();
    saveSession({
      id: Date.now().toString(),
      durationMinutes,
      completedAt: new Date().toISOString(),
      blockedApps: blockedPackages,
    });
    Alert.alert(
      "🎉 Session Complete!",
      `Great work! You focused for ${formatMinutes(durationMinutes)}.`,
      [{ text: "Awesome!", style: "default" }],
    );
  };

  const handleStart = () => {
    if (blockedPackages.length === 0) {
      Alert.alert(
        "No apps blocked",
        "Select at least one app to block during your focus session.",
        [{ text: "OK" }],
      );
      return;
    }
    startSession();
  };

  const handleStop = () => {
    Alert.alert(
      "End Session?",
      "Are you sure you want to end your focus session early?",
      [
        { text: "Keep Going", style: "cancel" },
        { text: "End Session", style: "destructive", onPress: stopSession },
      ],
    );
  };

  const progress = isActive ? 1 - remainingSeconds / (durationMinutes * 60) : 0;

  const apps = todayUsage?.apps ?? [];

  return (
    <>
      <CustomDurationModal
        visible={customModalVisible}
        onSave={setDuration}
        onClose={() => setCustomModalVisible(false)}
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
          <Text style={styles.headerTitle}>Focus Mode</Text>
          <View style={styles.streakChip}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{streak} day streak</Text>
          </View>
        </View>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <View style={styles.timerCenter}>
            <TimerRing
              progress={progress}
              remainingSeconds={remainingSeconds}
              isActive={isActive}
            />
          </View>

          {/* Session presets */}
          {!isActive && (
            <View style={styles.presetRow}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[
                    styles.presetChip,
                    durationMinutes === p.minutes && styles.presetChipActive,
                  ]}
                  onPress={() => setDuration(p.minutes)}
                >
                  <Text
                    style={[
                      styles.presetLabel,
                      durationMinutes === p.minutes && styles.presetLabelActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                  <Text
                    style={[
                      styles.presetDesc,
                      durationMinutes === p.minutes && styles.presetDescActive,
                    ]}
                  >
                    {p.desc}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.presetChip,
                  !PRESETS.find((p) => p.minutes === durationMinutes) &&
                    styles.presetChipActive,
                ]}
                onPress={() => setCustomModalVisible(true)}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color={
                    !PRESETS.find((p) => p.minutes === durationMinutes)
                      ? "#fff"
                      : PURPLE
                  }
                />
                <Text
                  style={[
                    styles.presetDesc,
                    !PRESETS.find((p) => p.minutes === durationMinutes) &&
                      styles.presetDescActive,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Start / Stop button */}
          <TouchableOpacity
            style={[styles.mainBtn, isActive && styles.mainBtnStop]}
            onPress={isActive ? handleStop : handleStart}
          >
            <MaterialCommunityIcons
              name={isActive ? "stop" : "play"}
              size={24}
              color="#fff"
            />
            <Text style={styles.mainBtnText}>
              {isActive ? "End Session" : "Start Focus Session"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatMinutes(
                sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
              )}
            </Text>
            <Text style={styles.statLabel}>Total Focused</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak}🔥</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Block apps section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Block During Session</Text>
          <Text style={styles.sectionSub}>
            These apps will be flagged while you focus
          </Text>

          <View style={styles.appsCard}>
            {apps.length === 0 ? (
              <Text style={styles.noAppsText}>
                No app usage data yet. Use your phone and come back!
              </Text>
            ) : (
              apps.slice(0, 8).map((app) => {
                const visual = APP_VISUALS[app.appName] ?? {
                  bg: "#f3f4f6",
                  icon: "apps" as any,
                  iconColor: "#6b7280",
                };
                const isBlocked = blockedPackages.includes(app.packageName);

                return (
                  <View key={app.packageName} style={styles.appRow}>
                    <View
                      style={[styles.appIcon, { backgroundColor: visual.bg }]}
                    >
                      <MaterialCommunityIcons
                        name={visual.icon}
                        size={26}
                        color={visual.iconColor}
                      />
                    </View>
                    <View style={styles.appInfo}>
                      <Text style={styles.appName}>{app.appName}</Text>
                      <Text style={styles.appUsed}>
                        {formatMinutes(app.duration)} today
                      </Text>
                    </View>
                    <Switch
                      value={isBlocked}
                      onValueChange={() => toggleBlockedApp(app.packageName)}
                      trackColor={{ false: "#e5e7eb", true: "#ddd6fe" }}
                      thumbColor={isBlocked ? PURPLE : "#9ca3af"}
                    />
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <View style={styles.appsCard}>
              {sessions.slice(0, 5).map((session) => (
                <View key={session.id} style={styles.sessionRow}>
                  <View style={styles.sessionIcon}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={GREEN}
                    />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionDuration}>
                      {formatMinutes(session.durationMinutes)} session
                    </Text>
                    <Text style={styles.sessionDate}>
                      {new Date(session.completedAt).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </Text>
                  </View>
                  <Text style={styles.sessionApps}>
                    {session.blockedApps.length} apps blocked
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

// ── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#111827" },
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  streakEmoji: { fontSize: 16 },
  streakText: { fontSize: 14, fontWeight: "700", color: ORANGE },

  timerCard: {
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  timerCenter: { alignItems: "center", marginBottom: 24 },

  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
    justifyContent: "center",
  },
  presetChip: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    minWidth: 64,
  },
  presetChipActive: { backgroundColor: PURPLE },
  presetLabel: { fontSize: 16, fontWeight: "700", color: "#374151" },
  presetLabelActive: { color: "#fff" },
  presetDesc: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  presetDescActive: { color: "rgba(255,255,255,0.8)" },

  mainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: PURPLE,
    borderRadius: 18,
    paddingVertical: 18,
  },
  mainBtnStop: { backgroundColor: RED },
  mainBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "#111827" },
  statLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
  },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSub: { fontSize: 13, color: "#9ca3af", marginBottom: 12 },

  appsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  noAppsText: {
    padding: 20,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },

  appRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  appInfo: { flex: 1 },
  appName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  appUsed: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  sessionIcon: { marginRight: 12 },
  sessionInfo: { flex: 1 },
  sessionDuration: { fontSize: 15, fontWeight: "600", color: "#111827" },
  sessionDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  sessionApps: { fontSize: 12, color: PURPLE, fontWeight: "600" },
});

const ring = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  svgWrap: { position: "absolute" },
  track: { position: "absolute" },
  fill: { position: "absolute" },
  center: { alignItems: "center" },
  timeText: {
    fontSize: 52,
    fontWeight: "800",
    color: PURPLE,
    letterSpacing: -2,
  },
  subText: { fontSize: 14, color: "#9ca3af", marginTop: 4 },
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
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
