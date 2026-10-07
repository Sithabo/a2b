import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight, MapPin, UserRound } from "lucide-react-native";
import { statusMeta, vehicleClasses, type StatusTone } from "@a2b/core";
import { Badge, Button, colors, palette, PlateBadge, radius, spacing, Text } from "@a2b/ui";
import type { RosterTruck, TruckState } from "@/lib/queries";

export const truckStateMeta: Record<TruckState, { label: string; tone: StatusTone }> = {
  ON_LOAD: { label: "On a load", tone: "brand" },
  IDLE: { label: "Idle", tone: "success" },
  MAINTENANCE: { label: "Maintenance", tone: "warning" },
};

interface TruckCardProps {
  truck: RosterTruck;
  onPress: () => void;
  onAssignDriver: () => void;
  onFindLoad: () => void;
}

/** Roster card: identity, state, driver, and one primary fact or action. Details live on the truck screen. */
export function TruckCard({ truck, onPress, onAssignDriver, onFindLoad }: TruckCardProps) {
  const { vehicle, driver, activeLoad, state } = truck;
  const meta = truckStateMeta[state];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.top}>
        <View style={styles.identity}>
          <PlateBadge plate={vehicle.plate} size="sm" />
          <Text variant="bodyStrong" numberOfLines={1}>
            {vehicle.make} {vehicle.model}
          </Text>
          <Text variant="caption" tone="muted">
            {vehicleClasses[vehicle.vehicleClass].label} · {vehicle.capacityTons} t
          </Text>
        </View>
        <Badge label={meta.label} tone={meta.tone} dot />
      </View>

      <View style={styles.driverRow}>
        <UserRound size={16} color={driver ? colors.text : colors.textMuted} />
        <Text tone={driver ? "default" : "muted"} style={{ flex: 1 }} numberOfLines={1}>
          {driver ? driver.fullName ?? driver.phone : "No driver assigned"}
        </Text>
      </View>

      {activeLoad ? (
        <View style={styles.fact}>
          <MapPin size={16} color={colors.primary} />
          <Text variant="bodySm" style={{ flex: 1 }} numberOfLines={1}>
            {activeLoad.pickupSummary} → {activeLoad.dropoffSummary}
          </Text>
          <Text variant="caption" tone="primary">
            {statusMeta[activeLoad.status].label}
          </Text>
          <ChevronRight size={16} color={palette.gray[400]} />
        </View>
      ) : state === "IDLE" ? (
        driver ? (
          <Button title="Find a load" variant="secondary" size="sm" onPress={onFindLoad} />
        ) : (
          <Button title="Assign driver" variant="secondary" size="sm" onPress={onAssignDriver} />
        )
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md },
  identity: { flex: 1, gap: spacing.xs },
  driverRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  fact: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryMuted,
  },
});
