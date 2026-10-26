import { useRouter } from "expo-router";
import { getMarket } from "@a2b/core";
import { EMPTY_TRUCK, TruckFormScreen } from "@/components/TruckForm";
import { api } from "@/lib/session";
import { keys, useDrivers, useFleet, useInvalidate } from "@/lib/queries";

export default function RegisterTruckScreen() {
  const router = useRouter();
  const fleet = useFleet();
  const drivers = useDrivers();
  const invalidate = useInvalidate();
  const market = getMarket(fleet.data?.market ?? "UG");

  return (
    <TruckFormScreen
      title="Register truck"
      subtitle={`${market.flag} ${market.name} fleet registry`}
      submitLabel="Register truck"
      market={market}
      drivers={drivers.data}
      initial={EMPTY_TRUCK}
      onClose={() => router.back()}
      onSubmit={async (body) => {
        await api.fleets.addVehicle({ body });
        await invalidate(keys.vehicles);
        router.back();
      }}
    />
  );
}
