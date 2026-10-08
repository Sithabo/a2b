import { Redirect } from "expo-router";
import { useSession } from "@/lib/session";

/** Routes to onboarding, sign-in, licence setup or jobs. */
export default function Index() {
  const { isHydrated, isSignedIn, hasCompletedOnboarding, user } = useSession();

  if (!isHydrated) return null;
  if (!hasCompletedOnboarding) return <Redirect href="/(auth)/onboarding" />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  // Fleet-added drivers have a profile but no licence yet; self-signups have neither.
  if (!user?.driverProfile?.licenseNumber) return <Redirect href="/profile-setup" />;
  return <Redirect href="/(tabs)" />;
}
