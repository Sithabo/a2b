import { Stack } from "expo-router";
import { colors } from "@a2b/ui";

export default function CreateLoadLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="cargo-details" />
      <Stack.Screen name="document-vault" />
      <Stack.Screen name="review" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
