import { StyleSheet, View } from "react-native";
import { Building2, Truck } from "lucide-react-native";
import { isValidTaxId, type FleetSizeTier, type Market } from "@a2b/core";
import type { Data } from "@a2b/api-client";
import { Card, ChipGroup, colors, spacing, Text, TextField } from "@a2b/ui";

export const SIZE_TIERS: { value: FleetSizeTier; label: string }[] = [
  { value: "1-5", label: "1–5 trucks" },
  { value: "6-20", label: "6–20 trucks" },
  { value: "20+", label: "20+ trucks" },
];

export const SIZE_LABELS = Object.fromEntries(SIZE_TIERS.map((t) => [t.value, t.label])) as Record<FleetSizeTier, string>;

export interface FleetDetails {
  name: string;
  address: string;
  sizeTier: FleetSizeTier;
  taxId: string;
  corridor: string;
}

export const EMPTY_FLEET_DETAILS: FleetDetails = { name: "", address: "", sizeTier: "1-5", taxId: "", corridor: "" };

export function fleetDetailsOf(fleet: Data.Fleet): FleetDetails {
  return {
    name: fleet.name,
    address: fleet.address ?? "",
    sizeTier: fleet.sizeTier,
    taxId: fleet.taxId ?? "",
    corridor: fleet.primaryCorridor ?? "",
  };
}

/** What the API takes for these details; blanks clear the optional fields. */
export function fleetDetailsBody(details: FleetDetails) {
  return {
    name: details.name.trim(),
    address: details.address.trim() || null,
    sizeTier: details.sizeTier,
    taxId: details.taxId.trim() || null,
    primaryCorridor: details.corridor.trim() || null,
  };
}

export function taxIdError(taxId: string, market: Market) {
  return taxId && !isValidTaxId(taxId, market) ? `${market.taxId.issuer} TINs are ${market.taxId.hint}` : "";
}

/** True when the details can be saved. */
export function isFleetDetailsValid(details: FleetDetails, market: Market) {
  return details.name.trim().length >= 2 && !taxIdError(details.taxId, market);
}

interface FleetDetailsFormProps {
  value: FleetDetails;
  onChange: (value: FleetDetails) => void;
  market: Market;
}

/** Company name, address, size, TIN and corridor: used by fleet setup and editing. */
export function FleetDetailsForm({ value, onChange, market }: FleetDetailsFormProps) {
  const set = <K extends keyof FleetDetails>(key: K) => (v: FleetDetails[K]) => onChange({ ...value, [key]: v });
  const tinError = taxIdError(value.taxId, market);

  return (
    <Card style={styles.form}>
      <TextField
        label="Company name"
        value={value.name}
        onChangeText={set("name")}
        placeholder="e.g. Apex Logistics Ltd"
        leading={<Building2 size={20} color={colors.textMuted} />}
      />
      <TextField
        label="Business address"
        value={value.address}
        onChangeText={set("address")}
        placeholder="Office or yard address"
      />

      <View style={styles.field}>
        <Text variant="label" tone="secondary">
          Fleet size
        </Text>
        <ChipGroup options={SIZE_TIERS} value={value.sizeTier} onChange={set("sizeTier")} />
      </View>

      <TextField
        label={`${market.taxId.issuer} tax ID (TIN)`}
        value={value.taxId}
        onChangeText={(v) => set("taxId")(v.replace(/\D/g, ""))}
        placeholder={market.taxId.hint}
        keyboardType="number-pad"
        error={tinError || undefined}
        hint="Optional now; needed before your first payout."
      />
      <TextField
        label="Main corridor"
        value={value.corridor}
        onChangeText={set("corridor")}
        placeholder={market.code === "UG" ? "e.g. Kampala → Malaba" : "e.g. Georgetown → Linden"}
        leading={<Truck size={20} color={colors.textMuted} />}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  field: { gap: spacing.sm },
});
