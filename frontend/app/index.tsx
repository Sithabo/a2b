import { Redirect } from "expo-router";

export default function Index() {
  // TODO: Add logic to check if already onboarded/logged in
  const isFirstLaunch = true;

  if (isFirstLaunch) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
