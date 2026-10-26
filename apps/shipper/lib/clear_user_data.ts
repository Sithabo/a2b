import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSession } from "@/lib/session";
import { useBillingStore } from "@/store/useBillingStore";
import { useShipmentStore } from "@/store/useShipmentStore";

// The profile photo used to be kept on the phone; it now lives on the API.
AsyncStorage.removeItem("a2b.shipper.profileImage").catch(() => {});

/**
 * Per-user data kept on the phone is wiped whenever the session ends: on
 * sign-out and when the API rejects the token. The next person to sign in
 * on this device must not see the previous account's cards or drafts.
 *
 * Imported once from the root layout.
 */
useSession.subscribe((state, previous) => {
  if (previous.token && !state.token) {
    useBillingStore.getState().reset();
    useShipmentStore.getState().clearAll();
  }
});
