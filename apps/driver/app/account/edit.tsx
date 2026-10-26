import { useRouter } from "expo-router";
import { EditAccountScreen } from "@a2b/features";
import { pickProfilePhoto } from "@/lib/pick_photo";

/** Name, email and the photo shippers see once a job is paid for. */
export default function EditAccount() {
  const router = useRouter();
  return <EditAccountScreen onDone={() => router.back()} pickPhoto={pickProfilePhoto} />;
}
