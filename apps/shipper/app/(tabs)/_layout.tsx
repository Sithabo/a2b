import { Redirect, Tabs, useRouter } from "expo-router";
import { useSessionGate } from "@a2b/features";
import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Home, Plus, User } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, colors, elevation, palette, radius, spacing } from "@a2b/ui";

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TAB_ROUTES = [
  { name: "index", label: "Home", Icon: Home },
  { name: "post-load-placeholder", label: "Post", Icon: Plus, isAction: true },
  { name: "account", label: "Account", Icon: User },
];

// ─── Custom Floating Tab Bar ───────────────────────────────────────────────────

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : spacing.lg;

  return (
    <View style={[styles.floatingBarWrapper, { bottom: bottomInset }]} pointerEvents="box-none">
      <View style={styles.floatingBar} accessibilityRole="tablist">
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
              <Pressable
                key={tab.name}
                onPress={handlePress}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: true }}
                hitSlop={spacing.xs}
                style={({ pressed }) => [styles.activePill, pressed && styles.pressed]}
              >
                <Icon size={20} color={colors.text} strokeWidth={2.2} />
                <Text variant="tab">{tab.label}</Text>
              </Pressable>
            );
          }

          // ── Inactive Tab: Dark Square Icon ───────────────────────────────
          return (
            <Pressable
              key={tab.name}
              onPress={handlePress}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: false }}
              style={({ pressed }) => [styles.inactivePill, pressed && styles.pressed]}
            >
              <Icon size={22} color={colors.textInverse} strokeWidth={2} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  floatingBarWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  floatingBar: {
    flexDirection: "row",
    alignItems: "center",
    // Dark floating bar: no semantic "inverse surface" token exists yet.
    backgroundColor: palette.gray[900],
    borderRadius: radius.pill,
    padding: spacing.sm,
    gap: spacing.sm,
    ...elevation.md,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  inactivePill: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: palette.zinc[800],
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85 },
});

// ─── Tab Layout ────────────────────────────────────────────────────────────────

export default function TabLayout() {
  // Deep links and expired sessions must not show signed-in screens.
  const gate = useSessionGate();
  if (gate === "loading") return null;
  if (gate !== "signed-in") return <Redirect href="/(auth)/login" />;

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
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
