import { Tabs } from "expo-router";
import { CircleUser, Package, Truck, Users } from "lucide-react-native";
import { colors, palette } from "@a2b/ui";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: palette.gray[500],
        tabBarStyle: { backgroundColor: palette.ivory[100], borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Fleet", tabBarIcon: ({ color }) => <Truck color={color} size={22} /> }} />
      <Tabs.Screen name="loads" options={{ title: "Loads", tabBarIcon: ({ color }) => <Package color={color} size={22} /> }} />
      <Tabs.Screen name="drivers" options={{ title: "Drivers", tabBarIcon: ({ color }) => <Users color={color} size={22} /> }} />
      <Tabs.Screen
        name="account"
        options={{ title: "Account", tabBarIcon: ({ color }) => <CircleUser color={color} size={22} /> }}
      />
    </Tabs>
  );
}
