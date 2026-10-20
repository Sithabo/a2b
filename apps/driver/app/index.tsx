import { Redirect } from "expo-router";
import { useSessionGate } from "@a2b/features";
import { useSession } from "@/lib/session";

/** Routes to onboarding, sign-in, licence setup or jobs. */
export default function Index() {
  const gate = useSessionGate();
  const user = useSession((s) => s.user);

  if (gate === "loading") return null;
  if (gate === "onboarding") return <Redirect href="/(auth)/onboarding" />;
  if (gate === "signed-out") return <Redirect href="/(auth)/sign-in" />;
  // Fleet-added drivers have a profile but no licence yet; self-signups have neither.
  if (!user?.driverProfile?.licenseNumber) return <Redirect href="/profile-setup" />;
  return <Redirect href="/(tabs)" />;
}
