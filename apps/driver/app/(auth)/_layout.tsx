import { Stack } from "expo-router";
import { colors } from "@a2b/ui";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
