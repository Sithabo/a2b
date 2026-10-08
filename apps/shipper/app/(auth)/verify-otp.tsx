import { useLocalSearchParams, useRouter } from "expo-router";
import { VerifyCodeScreen } from "@a2b/features";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  return (
    <VerifyCodeScreen
      phone={phone}
      onBack={() => router.back()}
      onVerified={(user) => router.replace(user.shipperProfile ? "/(tabs)" : "/(auth)/business-details")}
    />
  );
}
