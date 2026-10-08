import { useRouter } from "expo-router";
import { Truck } from "lucide-react-native";
import { PhoneSignInScreen } from "@a2b/features";

export default function SignInScreen() {
  const router = useRouter();
  return (
    <PhoneSignInScreen
      icon={Truck}
      eyebrow="Drivers"
      title="A2B Driver"
      subtitle="Sign in with your mobile number. If your fleet added you, use the number they registered."
      onCodeSent={(phone) => router.push({ pathname: "/(auth)/verify", params: { phone } })}
    />
  );
}
