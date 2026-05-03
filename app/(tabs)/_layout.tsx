import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";

function TabIcon({
  name,
  color,
}: {
  name: ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
}) {
  return <MaterialCommunityIcons name={name} size={26} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1f1635",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#fffdfb",
          borderTopWidth: 0,
          height: 84,
          paddingTop: 10,
          paddingBottom: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Usage Stats",
          tabBarIcon: ({ color }) => <TabIcon name="chart-box" color={color} />,
        }}
      />
      <Tabs.Screen
        name="limits"
        options={{
          title: "Usage Limits",
          tabBarIcon: ({ color }) => <TabIcon name="gauge" color={color} />,
        }}
      />
      <Tabs.Screen
        name="blocking"
        options={{
          title: "In-App Blocking",
          tabBarIcon: ({ color }) => <TabIcon name="apps-box" color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox Cleaning",
          tabBarIcon: ({ color }) => <FontAwesome5 name="envelope" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
