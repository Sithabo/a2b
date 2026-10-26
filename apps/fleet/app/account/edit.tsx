import { useRouter } from "expo-router";
import { EditAccountScreen } from "@a2b/features";

/** The owner's name and email. No photo: the fleet app has no image picker. */
export default function EditAccount() {
  const router = useRouter();
  return <EditAccountScreen onDone={() => router.back()} />;
}
