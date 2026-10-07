import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { colors } from "@a2b/ui";
import { useSession } from "@/lib/session";
import { useFleet } from "@/lib/queries";

/** Routes to onboarding, sign-in, fleet setup or the dashboard. */
export default function Index() {
  const { isHydrated, isSignedIn, hasCompletedOnboarding } = useSession();
  const fleet = useFleet();

  if (!isHydrated) return null;
  if (!hasCompletedOnboarding) return <Redirect href="/(auth)/onboarding" />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  if (fleet.isPending) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  if (fleet.data === null) return <Redirect href="/setup" />;
  return <Redirect href="/(tabs)" />;
}
