import { useLocalSearchParams, useRouter } from "expo-router";
import { VerifyCodeScreen } from "@a2b/features";

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  return (
    <VerifyCodeScreen
      phone={phone}
      onBack={() => router.back()}
      // The index route decides between fleet setup and the dashboard.
      onVerified={() => router.replace("/")}
    />
  );
}
