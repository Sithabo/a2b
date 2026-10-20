import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useSessionGate } from "@a2b/features";
import { colors } from "@a2b/ui";
import { useFleet } from "@/lib/queries";

/** Routes to onboarding, sign-in, fleet setup or the dashboard. */
export default function Index() {
  const gate = useSessionGate();
  const fleet = useFleet(gate === "signed-in");

  if (gate === "loading") return null;
  if (gate === "onboarding") return <Redirect href="/(auth)/onboarding" />;
  if (gate === "signed-out") return <Redirect href="/(auth)/sign-in" />;

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
