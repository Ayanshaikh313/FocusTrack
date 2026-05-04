// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const PURPLE = "#8b5cf6";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PURPLE,
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          height: 64,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Usage Stats',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="limits"
        options={{
          title: 'Usage Limits',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="timer-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'In-App Blocking',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}