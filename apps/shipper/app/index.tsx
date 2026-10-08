import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export default function Index() {
  const { isHydrated, isLoggedIn, hasCompletedOnboarding, user } = useAuthStore();

  // Wait until the stored session has been read.
  if (!isHydrated) return null;

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  // Signed in but registration was interrupted before business details.
  if (!user?.shipperProfile) {
    return <Redirect href="/(auth)/business-details" />;
  }

  return <Redirect href="/(tabs)" />;
}
