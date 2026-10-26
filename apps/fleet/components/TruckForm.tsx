import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { bodyTypes, normalizePlate, vehicleClasses, type BodyType, type Market, type VehicleClass } from "@a2b/core";
import { apiErrorMessage, type Data } from "@a2b/api-client";
import { Button, Card, ChipGroup, colors, IconButton, layout, PlateBadge, spacing, Stepper, Text, TextField } from "@a2b/ui";

const CLASS_OPTIONS = (Object.keys(vehicleClasses) as VehicleClass[]).map((value) => ({
  value,
  label: `${vehicleClasses[value].label} (${vehicleClasses[value].capacityTons.join("–")} t)`,
}));
const BODY_OPTIONS = (Object.keys(bodyTypes) as BodyType[]).map((value) => ({ value, label: bodyTypes[value].label }));

export interface TruckDetails {
  plate: string;
  make: string;
  model: string;
  vehicleClass: VehicleClass;
  bodyType: BodyType;
  capacityTons: number;
  assignedDriverId: number | null;
}

export const EMPTY_TRUCK: TruckDetails = {
  plate: "",
  make: "",
  model: "",
  vehicleClass: "LORRY",
  bodyType: "DRY_BOX",
  capacityTons: 10,
  assignedDriverId: null,
};

export function truckDetailsOf(vehicle: Data.Vehicle): TruckDetails {
  return {
    plate: vehicle.plate,
    make: vehicle.make,
    model: vehicle.model,
    vehicleClass: vehicle.vehicleClass,
    bodyType: vehicle.bodyType,
    capacityTons: vehicle.capacityTons,
    assignedDriverId: vehicle.assignedDriverId,
  };
}

interface TruckFormScreenProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  market: Market;
  drivers: Data.FleetDriver[] | undefined;
  initial: TruckDetails;
  /** Saves the cleaned-up details; throw to show the API error. */
  onSubmit: (details: TruckDetails) => Promise<void>;
  onClose: () => void;
}

/** The register-truck / edit-truck modal: plate, make and model, size, body, capacity and driver. */
export function TruckFormScreen({
  title,
  subtitle,
  submitLabel,
  market,
  drivers,
  initial,
  onSubmit,
  onClose,
}: TruckFormScreenProps) {
  const insets = useSafeAreaInsets();
  const [plate, setPlate] = useState(initial.plate);
  const [make, setMake] = useState(initial.make);
  const [model, setModel] = useState(initial.model);
  const [vehicleClass, setVehicleClass] = useState(initial.vehicleClass);
  const [bodyType, setBodyType] = useState(initial.bodyType);
  const [capacity, setCapacity] = useState(initial.capacityTons);
  const [driverId, setDriverId] = useState(initial.assignedDriverId ? String(initial.assignedDriverId) : null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const normalized = normalizePlate(plate);
  const canSave = normalized.length >= 4 && make.trim() && model.trim() && capacity > 0;

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      await onSubmit({
        plate: normalized,
        make: make.trim(),
        model: model.trim(),
        vehicleClass,
        bodyType,
        capacityTons: capacity,
        assignedDriverId: driverId ? Number(driverId) : null,
      });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={{ flex: 1 }}>
          <Text variant="h2" tone="primary">
            {title}
          </Text>
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        </View>
        <IconButton icon={X} onPress={onClose} accessibilityLabel="Close" />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.section}>
          <TextField
            label="Number plate"
            value={plate}
            onChangeText={setPlate}
            placeholder={market.plate.example}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {normalized.length >= 3 && <PlateBadge plate={normalized} size="lg" />}
        </Card>

        <Card style={styles.section}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField label="Make" value={make} onChangeText={setMake} placeholder="e.g. Isuzu" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Model" value={model} onChangeText={setModel} placeholder="e.g. FRR" />
            </View>
          </View>
          <View style={styles.field}>
            <Text variant="label" tone="secondary">
              Truck size
            </Text>
            <ChipGroup options={CLASS_OPTIONS} value={vehicleClass} onChange={setVehicleClass} />
          </View>
          <View style={styles.field}>
            <Text variant="label" tone="secondary">
              Body
            </Text>
            <ChipGroup options={BODY_OPTIONS} value={bodyType} onChange={setBodyType} />
          </View>
          <View style={styles.field}>
            <Text variant="label" tone="secondary">
              Payload capacity
            </Text>
            <Stepper value={capacity} onChange={setCapacity} step={0.5} min={0.5} max={60} unit="tons" />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text variant="label" tone="secondary">
            Driver (optional)
          </Text>
          {drivers?.length ? (
            <ChipGroup
              value={driverId}
              onChange={(id) => setDriverId(id === driverId ? null : id)}
              options={drivers.map((d) => ({ value: String(d.id), label: d.fullName ?? d.phone }))}
            />
          ) : (
            <Text tone="muted">Add drivers from the Drivers tab, then assign them here or later.</Text>
          )}
        </Card>

        {error ? <Text tone="danger">{error}</Text> : null}
        <Button title={submitLabel} onPress={handleSave} loading={isSaving} disabled={!canSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: layout.gutter,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  content: { padding: layout.gutter, gap: spacing.lg, paddingBottom: spacing["4xl"] },
  section: { gap: spacing.lg },
  row: { flexDirection: "row", gap: spacing.md },
  field: { gap: spacing.sm },
});
