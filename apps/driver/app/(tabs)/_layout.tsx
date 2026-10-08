import { Tabs } from "expo-router";
import { CircleUser, History, Package } from "lucide-react-native";
import { colors, palette } from "@a2b/ui";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: palette.gray[500],
        tabBarStyle: { backgroundColor: palette.ivory[100], borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 13, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Jobs", tabBarIcon: ({ color }) => <Package color={color} size={24} /> }} />
      <Tabs.Screen name="trips" options={{ title: "Trips", tabBarIcon: ({ color }) => <History color={color} size={24} /> }} />
      <Tabs.Screen
        name="account"
        options={{ title: "Account", tabBarIcon: ({ color }) => <CircleUser color={color} size={24} /> }}
      />
    </Tabs>
  );
}
