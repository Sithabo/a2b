import { Redirect, Tabs, useRouter } from "expo-router";
import { useSessionGate } from "@a2b/features";
import React, { useEffect } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Bell, Home, Plus, User } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, elevation, radius, spacing } from "@a2b/ui";

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TAB_ROUTES = [
  { name: "index", label: "Home", Icon: Home },
  { name: "post-load-placeholder", label: "Post Load", Icon: Plus, href: "/create-load" as const },
  { name: "notifications", label: "Notifications", Icon: Bell },
  { name: "account", label: "Account", Icon: User },
];

// ─── Custom Floating Tab Bar ───────────────────────────────────────────────────

const PILL_WIDTH = 56;
const PILL_GAP = spacing.xs;
/** Snappy but settles without bouncing past the target pill. */
const SLIDE = { damping: 22, stiffness: 260, mass: 0.8 };

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : spacing.lg;

  // The highlight slides to whichever bar button matches the focused tab
  const activeName = state.routes[state.index]?.name;
  const activeSlot = Math.max(0, TAB_ROUTES.findIndex((tab) => tab.name === activeName));
  const offset = useSharedValue(activeSlot * (PILL_WIDTH + PILL_GAP));
  useEffect(() => {
    offset.value = withSpring(activeSlot * (PILL_WIDTH + PILL_GAP), SLIDE);
  }, [activeSlot, offset]);
  const highlightStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <View style={[styles.floatingBarWrapper, { bottom: bottomInset }]} pointerEvents="box-none">
      <View style={styles.floatingBar} accessibilityRole="tablist">
        {/* Grey wells sit under the sliding highlight, so it stays visible as it moves */}
        <View pointerEvents="none" style={styles.wells}>
          {TAB_ROUTES.map((tab) => (
            <View key={tab.name} style={styles.well} />
          ))}
        </View>
        <Animated.View pointerEvents="none" style={[styles.highlight, highlightStyle]} />
        {TAB_ROUTES.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isActive = routeIndex !== -1 && state.index === routeIndex;
          const { Icon } = tab;

          const handlePress = () => {
            if ("href" in tab && tab.href) {
              router.push(tab.href);
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

          return (
            <Pressable
              key={tab.name}
              onPress={handlePress}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              hitSlop={spacing.xs}
              style={({ pressed }) => [
                styles.tabPill,
                pressed && styles.pressed,
              ]}
            >
              <Icon
                size={22}
                color={isActive ? colors.onPrimary : colors.text}
                strokeWidth={isActive ? 2.4 : 2}
              />
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
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: PILL_GAP,
    ...elevation.md,
  },
  highlight: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    width: PILL_WIDTH,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  tabPill: {
    width: PILL_WIDTH,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  wells: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    padding: spacing.xs,
    gap: PILL_GAP,
  },
  well: {
    width: PILL_WIDTH,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
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
        // Cross-fade between tabs instead of an instant swap
        animation: "fade",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen
        name="post-load-placeholder"
        options={{ title: "Post Load" }}
      />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
