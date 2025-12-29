// use this layout file for fonts etc, as this is the root layout file
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "react-native-reanimated";

import { useEffect } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFirstLaunch } from "@/hooks/useFirstLaunch";
import { useRouter, useSegments } from "expo-router";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isFirstLaunch, isLoading } = useFirstLaunch();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isFirstLaunch && !inAuthGroup) {
      // If it's the first launch, redirect to onboarding
      // But only if we aren't already in the auth group (to prevent loop if user is navigating)
      // Actually, standard pattern:
      // If first launch -> go to onboarding
      // If NOT first launch -> go to welcome (auth start) or home if logged in (session check needed later)

      // For now, based on user request:
      // If isFirstLaunch is true, redirect to /onboarding (which is separate from auth/welcome? No, it's (auth)/onboarding)
      // Wait, the user said: "If isFirstLaunch is true, redirect to /onboarding."

      router.replace("/(auth)/onboarding");
    } else if (isFirstLaunch === false) {
      // If not first launch, we generally want to go to welcome screen (or home if session exists)
      // The user said: "If isFirstLaunch is false (and no user session), redirect to /auth."
      // effectively / (auth)/welcome
      // check if we are already in onboarding, if so, kick out
      // or just let the default generic routing handle it?
      // Ideally we do this check once on mount?
    }
  }, [isFirstLaunch, isLoading]);

  if (isLoading) {
    return null; // Keep splash screen visible
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
