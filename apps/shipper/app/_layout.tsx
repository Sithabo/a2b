import React from "react";
import { Platform } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppSessionProvider } from "@a2b/features";
import { session } from "@/lib/session";

/**
 * Root layout: same navigator Expo Router generates when there is no _layout
 * (a Slot, inside a SafeAreaView except on Android edge-to-edge). The session
 * provider reads the stored token at startup and refreshes the profile.
 */
export default function RootLayout() {
  const slot = <Slot />;
  return (
    <AppSessionProvider session={session}>
      {Platform.OS === "android" ? slot : <SafeAreaView style={{ flex: 1 }}>{slot}</SafeAreaView>}
    </AppSessionProvider>
  );
}
