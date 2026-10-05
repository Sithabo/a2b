import { Stack } from "expo-router";

export default function PaymentMethodsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="status" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
