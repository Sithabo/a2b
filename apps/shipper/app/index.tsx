import { Redirect } from "expo-router";
import { useSession } from "@/lib/session";

export default function Index() {
  const { isHydrated, isSignedIn, hasCompletedOnboarding, user } = useSession();

  // Wait until the stored session has been read.
  if (!isHydrated) return null;

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  // Signed in but registration was interrupted before business details.
  if (!user?.shipperProfile) {
    return <Redirect href="/(auth)/business-details" />;
  }

  return <Redirect href="/(tabs)" />;
}
