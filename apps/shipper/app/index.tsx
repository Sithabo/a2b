import { Redirect } from "expo-router";
import { useSessionGate } from "@a2b/features";
import { useSession } from "@/lib/session";

/** Routes to onboarding, login, business details or the dashboard. */
export default function Index() {
  const gate = useSessionGate();
  const user = useSession((s) => s.user);

  if (gate === "loading") return null;
  if (gate === "onboarding") return <Redirect href="/(auth)/onboarding" />;
  if (gate === "signed-out") return <Redirect href="/(auth)/login" />;
  // Signed in but registration was interrupted before business details.
  if (!user?.shipperProfile) return <Redirect href="/(auth)/business-details" />;
  return <Redirect href="/(tabs)" />;
}
