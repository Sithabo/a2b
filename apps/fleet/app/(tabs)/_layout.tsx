import { Redirect, Tabs } from "expo-router";
import { useSessionGate } from "@a2b/features";
import { CircleUser, Package, Truck, Users } from "lucide-react-native";
import { colors, palette, typography } from "@a2b/ui";

export default function TabsLayout() {
  // Deep links and expired sessions must not show signed-in screens.
  const gate = useSessionGate();
  if (gate === "loading") return null;
  if (gate !== "signed-in") return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: palette.gray[500],
        tabBarStyle: { backgroundColor: palette.ivory[100], borderTopColor: colors.border },
        tabBarLabelStyle: typography.tab,
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
