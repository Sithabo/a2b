import { useSession } from "@/lib/session";
import { useBillingStore } from "@/store/useBillingStore";
import { useShipmentStore } from "@/store/useShipmentStore";
import { useProfileImage } from "@/store/useShipperProfile";

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
    useProfileImage.getState().set(undefined);
  }
});
