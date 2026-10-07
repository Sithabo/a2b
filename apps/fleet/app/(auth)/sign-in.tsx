import { useRouter } from "expo-router";
import { Truck } from "lucide-react-native";
import { PhoneSignInScreen } from "@a2b/features";

export default function SignInScreen() {
  const router = useRouter();
  return (
    <PhoneSignInScreen
      icon={Truck}
      eyebrow="Fleet owners"
      title="Welcome to A2B Fleet"
      subtitle="Sign in with your business mobile number to manage your trucks, drivers and loads."
      onCodeSent={(phone) => router.push({ pathname: "/(auth)/verify", params: { phone } })}
    />
  );
}
