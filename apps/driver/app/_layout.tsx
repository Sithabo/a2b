import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppSessionProvider } from "@a2b/features";
import { colors } from "@a2b/ui";
import { session } from "@/lib/session";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppSessionProvider session={session}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="customs-pass/[id]" options={{ presentation: "fullScreenModal" }} />
        </Stack>
      </AppSessionProvider>
    </GestureHandlerRootView>
  );
}
