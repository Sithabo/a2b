import { useLocalSearchParams, useRouter } from "expo-router";
import { VerifyCodeScreen } from "@a2b/features";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone, devCode } = useLocalSearchParams<{ phone: string; devCode?: string }>();
  return (
    <VerifyCodeScreen
      phone={phone}
      devCode={devCode}
      onBack={() => router.back()}
      onVerified={(user) => router.replace(user.shipperProfile ? "/(tabs)" : "/(auth)/business-details")}
    />
  );
}
