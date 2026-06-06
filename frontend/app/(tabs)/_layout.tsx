import { Tabs, useRouter } from "expo-router";
import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Platform,
  StyleSheet,
} from "react-native";
import { Home, Plus, User } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TAB_ROUTES = [
  { name: "index", label: "Home", Icon: Home },
  { name: "post-load-placeholder", label: "Post", Icon: Plus, isAction: true },
  { name: "account", label: "Account", Icon: User },
];

// ─── Custom Floating Tab Bar ───────────────────────────────────────────────────

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();

  return (
    <View style={styles.floatingBarWrapper} pointerEvents="box-none">
      <View style={styles.floatingBar}>
        {TAB_ROUTES.map((tab, index) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isActive = state.index === routeIndex;
          const { Icon } = tab;

          const handlePress = () => {
            if (tab.isAction) {
              router.push("/create-load");
              return;
            }
            const event = navigation.emit({
              type: "tabPress",
              target: state.routes[routeIndex]?.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          if (isActive) {
            // ── Active Tab: White Pill Card ──────────────────────────────────
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={handlePress}
                activeOpacity={0.85}
                style={styles.activePill}
              >
                <Icon size={20} color="#111111" strokeWidth={2.2} />
                <Text style={styles.activeLabel}>{tab.label}</Text>
              </TouchableOpacity>
            );
          }

          // ── Inactive Tab: Dark Square Icon ───────────────────────────────
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={handlePress}
              activeOpacity={0.75}
              style={styles.inactivePill}
            >
              <Icon size={22} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const BOTTOM_PADDING = Platform.OS === "ios" ? 36 : 20;

const styles = StyleSheet.create({
  floatingBarWrapper: {
    position: "absolute",
    bottom: BOTTOM_PADDING,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  floatingBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 18,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 8,
  },
  activeLabel: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  inactivePill: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "#27272A",
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Tab Layout ────────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen
        name="post-load-placeholder"
        options={{ title: "Post Load" }}
      />
      {/* Commented out for consolidation */}
      {/* <Tabs.Screen name="receipts" options={{ title: "Orders" }} /> */}
      {/* <Tabs.Screen name="inbox" options={{ title: "Inbox" }} /> */}
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
