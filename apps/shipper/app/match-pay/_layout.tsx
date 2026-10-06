import { Stack } from 'expo-router';

export default function MatchPayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="driver-found" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="confirmed" />
    </Stack>
  );
}
