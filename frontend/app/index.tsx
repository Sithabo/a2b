import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

export default function Index() {
  const { isLoggedIn, hasCompletedOnboarding } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Ensure Zustand is hydrated before redirecting
  useEffect(() => {
    // Temporarily reset onboarding so you can see it again
    useAuthStore.setState({ hasCompletedOnboarding: false });
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
