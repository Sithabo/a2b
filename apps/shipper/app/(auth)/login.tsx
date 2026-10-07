import { useRouter } from "expo-router";
import { Package } from "lucide-react-native";
import { PhoneSignInScreen } from "@a2b/features";

export default function LoginScreen() {
  const router = useRouter();
  return (
    <PhoneSignInScreen
      icon={Package}
      eyebrow="Shippers"
      title="Ship with A2B"
      subtitle="Sign in with your mobile number to post loads, pay through escrow and track deliveries."
      onCodeSent={(phone) => router.push({ pathname: "/(auth)/verify-otp", params: { phone } })}
    />
  );
}
