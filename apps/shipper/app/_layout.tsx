import React, { useEffect } from "react";
import { Platform } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Root layout: same navigator Expo Router generates when there is no _layout
 * (a Slot, inside a SafeAreaView except on Android edge-to-edge), plus app-wide providers.
 */
export default function RootLayout() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  // Refresh the cached profile whenever a session becomes available.
  useEffect(() => {
    if (!token) return;
    api.me
      .show({})
      .then(({ data }) => useAuthStore.getState().setUser(data))
      .catch(() => {}); // offline: keep the cached profile; a 401 signs out via the client
  }, [token]);

  const slot = <Slot />;
  return (
    <QueryClientProvider client={queryClient}>
      {Platform.OS === "android" ? slot : <SafeAreaView style={{ flex: 1 }}>{slot}</SafeAreaView>}
    </QueryClientProvider>
  );
}
