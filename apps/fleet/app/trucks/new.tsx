import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import {
  bodyTypes,
  getMarket,
  normalizePlate,
  vehicleClasses,
  type BodyType,
  type VehicleClass,
} from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import {
  Button,
  Card,
  ChipGroup,
  colors,
  IconButton,
  layout,
  PlateBadge,
  spacing,
  Stepper,
  Text,
  TextField,
} from "@a2b/ui";
import { api } from "@/lib/session";
import { keys, useDrivers, useFleet, useInvalidate } from "@/lib/queries";

const CLASS_OPTIONS = (Object.keys(vehicleClasses) as VehicleClass[]).map((value) => ({
  value,
  label: `${vehicleClasses[value].label} (${vehicleClasses[value].capacityTons.join("–")} t)`,
}));
const BODY_OPTIONS = (Object.keys(bodyTypes) as BodyType[]).map((value) => ({ value, label: bodyTypes[value].label }));

export default function RegisterTruckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fleet = useFleet();
  const drivers = useDrivers();
  const invalidate = useInvalidate();
  const market = getMarket(fleet.data?.market ?? "UG");

  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>("LORRY");
  const [bodyType, setBodyType] = useState<BodyType>("DRY_BOX");
  const [capacity, setCapacity] = useState(10);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const normalized = normalizePlate(plate);
  const canSave = normalized.length >= 4 && make.trim() && model.trim() && capacity > 0;

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      await api.fleets.addVehicle({
        body: {
          plate: normalized,
          make: make.trim(),
          model: model.trim(),
          vehicleClass,
          bodyType,
          capacityTons: capacity,
          assignedDriverId: driverId ? Number(driverId) : null,
        },
      });
      await invalidate(keys.vehicles);
      router.back();
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
            Register truck
          </Text>
          <Text variant="caption" tone="muted">
            {market.flag} {market.name} fleet registry
          </Text>
        </View>
        <IconButton icon={X} onPress={() => router.back()} accessibilityLabel="Close" />
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
          {drivers.data?.length ? (
            <ChipGroup
              value={driverId}
              onChange={(id) => setDriverId(id === driverId ? null : id)}
              options={drivers.data.map((d) => ({ value: String(d.id), label: d.fullName ?? d.phone }))}
            />
          ) : (
            <Text tone="muted">Add drivers from the Drivers tab, then assign them here or later.</Text>
          )}
        </Card>

        {error ? <Text tone="danger">{error}</Text> : null}
        <Button title="Register truck" onPress={handleSave} loading={isSaving} disabled={!canSave} />
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
