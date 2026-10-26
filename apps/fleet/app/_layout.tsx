import { useEffect } from "react";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { AppSessionProvider } from "@a2b/features";
import { colors, useA2BFonts } from "@a2b/ui";
import { session } from "@/lib/session";

// Keep the splash screen up until Inter has loaded
SplashScreen.preventAutoHideAsync();

/** A session ended (signed out, or the token was rejected): drop the screen stack, back to sign-in. */
function goToSignIn() {
  if (router.canDismiss()) router.dismissAll();
  router.replace("/(auth)/sign-in");
}

export default function RootLayout() {
  const fontsReady = useA2BFonts();
  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);
  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppSessionProvider session={session} onSignedOut={goToSignIn}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="trucks/new" options={{ presentation: "modal" }} />
          <Stack.Screen name="trucks/[id]/edit" options={{ presentation: "modal" }} />
          <Stack.Screen name="drivers/new" options={{ presentation: "modal" }} />
        </Stack>
      </AppSessionProvider>
    </GestureHandlerRootView>
  );
}
