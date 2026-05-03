import { StyleSheet, Text, View } from "react-native";

export default function BlockingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>In-App Blocking</Text>
      <Text style={styles.subtitle}>Focus sessions and app blocking controls go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f3f1",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});
