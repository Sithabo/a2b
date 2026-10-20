import { useLocalSearchParams, useRouter } from "expo-router";
import { VerifyCodeScreen } from "@a2b/features";

export default function VerifyScreen() {
  const router = useRouter();
  const { phone, devCode } = useLocalSearchParams<{ phone: string; devCode?: string }>();
  return (
    <VerifyCodeScreen
      phone={phone}
      devCode={devCode}
      onBack={() => router.back()}
      // The index route decides between licence setup and jobs.
      onVerified={() => router.replace("/")}
    />
  );
}
