import type { Data } from "@a2b/api-client";
import type { StatusTone } from "@a2b/core";

export const verificationMeta: Record<Data.FleetDriver["verificationStatus"], { label: string; tone: StatusTone }> = {
  VERIFIED: { label: "Verified", tone: "success" },
  PENDING: { label: "Pending verification", tone: "warning" },
  REJECTED: { label: "Rejected", tone: "danger" },
};
