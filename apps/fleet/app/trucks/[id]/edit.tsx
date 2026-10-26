import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getMarket } from "@a2b/core";
import { QueryFallback } from "@a2b/features";
import { colors, ScreenHeader } from "@a2b/ui";
import { truckDetailsOf, TruckFormScreen, type TruckDetails } from "@/components/TruckForm";
import { api } from "@/lib/session";
import { keys, useDrivers, useFleet, useInvalidate, useVehicles } from "@/lib/queries";

export default function EditTruckScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fleet = useFleet();
  const vehicles = useVehicles();
  const drivers = useDrivers();
  const invalidate = useInvalidate();
  const market = getMarket(fleet.data?.market ?? "UG");
  const vehicle = vehicles.data?.find((v) => v.id === Number(id));

  if (!vehicle) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Edit truck" onCancelPress={() => router.back()} />
        <QueryFallback
          error={vehicles.error ?? (vehicles.data ? new Error("Truck not found") : null)}
          onRetry={() => vehicles.refetch()}
          errorMessage="We couldn't find this truck."
        />
      </SafeAreaView>
    );
  }

  const initial = truckDetailsOf(vehicle);

  return (
    <TruckFormScreen
      title="Edit truck"
      subtitle={`${vehicle.plate} · ${vehicle.make} ${vehicle.model}`}
      submitLabel="Save changes"
      market={market}
      drivers={drivers.data}
      initial={initial}
      onClose={() => router.back()}
      onSubmit={async (details) => {
        // Only send what changed, so an untouched driver pick doesn't reshuffle assignments
        const body = Object.fromEntries(
          (Object.keys(details) as (keyof TruckDetails)[])
            .filter((key) => details[key] !== initial[key])
            .map((key) => [key, details[key]])
        ) as Partial<TruckDetails>;
        if (Object.keys(body).length) {
          await api.fleets.updateVehicle({ params: { id: vehicle.id }, body });
          await invalidate(keys.vehicles);
        }
        router.back();
      }}
    />
  );
}
