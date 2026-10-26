import type { Data } from "@a2b/api-client";
import type { Market } from "@a2b/core";

/** Lines added to a support email so support can find the shipper's account. */
export function supportContext(user: Data.User | null | undefined, market: Market) {
  return [
    `Account: ${user ? [user.fullName, user.phone].filter(Boolean).join(", ") : "not signed in"}`,
    `Market: ${market.name}`,
    "App: A2B Shipper",
  ];
}
