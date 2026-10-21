import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Info } from "lucide-react-native";
import { SegmentedControl, TextField, colors, layout, radius, spacing } from "@a2b/ui";

export interface PackageData {
  id: string;
  code: string;
  weight: string;
  length: string;
  width: string;
  height: string;
}

export interface PackageFormProps {
  data: PackageData;
  onChange: (data: PackageData) => void;
}

export const PackageForm: React.FC<PackageFormProps> = ({ data, onChange }) => {
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

  const handleChange = (field: keyof PackageData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <View style={styles.container}>
      {/* Code Row */}
      <TextField
        placeholder="Cargo code"
        value={data.code}
        onChangeText={(v) => handleChange("code", v)}
        trailing={<Info size={20} color={colors.borderStrong} />}
      />

      {/* Weight Row */}
      <View style={styles.weightRow}>
        <View style={styles.flexCell}>
          <TextField
            label={`WEIGHT (${weightUnit.toUpperCase()})`}
            value={data.weight}
            onChangeText={(v) => handleChange("weight", v)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <SegmentedControl
          accessibilityLabel="Weight unit"
          options={[
            { value: "lbs", label: "lbs" },
            { value: "kg", label: "kg" },
          ]}
          value={weightUnit}
          onChange={setWeightUnit}
          style={styles.unitToggle}
        />
      </View>

      {/* Dimensions Grid */}
      <View style={styles.dimensionsRow}>
        <View style={styles.flexCell}>
          <TextField
            label="LENGTH (IN)"
            value={data.length}
            onChangeText={(v) => handleChange("length", v)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.flexCell}>
          <TextField
            label="WIDTH (IN)"
            value={data.width}
            onChangeText={(v) => handleChange("width", v)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.flexCell}>
          <TextField
            label="HEIGHT (IN)"
            value={data.height}
            onChangeText={(v) => handleChange("height", v)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  flexCell: {
    flex: 1,
  },
  unitToggle: {
    width: 132,
    height: layout.touchLg,
  },
  dimensionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
