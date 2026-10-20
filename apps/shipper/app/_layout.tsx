import React, { useEffect } from "react";
import { Platform } from "react-native";
import { router, Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { AppSessionProvider } from "@a2b/features";
import { useA2BFonts } from "@a2b/ui";
import { session } from "@/lib/session";
import "@/lib/clear_user_data";

// Keep the splash screen up until Inter has loaded
SplashScreen.preventAutoHideAsync();

/** A session ended (signed out, or the token was rejected): drop the screen stack, back to sign-in. */
function goToSignIn() {
  if (router.canDismiss()) router.dismissAll();
  router.replace("/(auth)/login");
}

/**
 * Root layout: same navigator Expo Router generates when there is no _layout
 * (a Slot, inside a SafeAreaView except on Android edge-to-edge). The session
 * provider reads the stored token at startup and refreshes the profile.
 */
export default function RootLayout() {
  const fontsReady = useA2BFonts();
  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);
  if (!fontsReady) return null;

  const slot = <Slot />;
  return (
    <AppSessionProvider session={session} onSignedOut={goToSignIn}>
      {Platform.OS === "android" ? slot : <SafeAreaView style={{ flex: 1 }}>{slot}</SafeAreaView>}
    </AppSessionProvider>
  );
}
