import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Info } from "lucide-react-native";
import { colors, palette } from "@a2b/ui";

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
      <View style={styles.headerRow}>
        <TextInput
          style={styles.codeTitleInput}
          placeholder="Cargo code"
          placeholderTextColor={palette.gray[400]}
          value={data.code}
          onChangeText={(v) => handleChange("code", v)}
        />
        <Info size={20} color={palette.gray[300]} />
      </View>

      {/* Weight Row */}
      <View style={styles.weightRow}>
        <View style={styles.weightInputContainer}>
          <Text style={styles.label}>WEIGHT ({weightUnit.toUpperCase()})</Text>
          <TextInput
            style={styles.boldInput}
            value={data.weight}
            onChangeText={(v) => handleChange("weight", v)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={palette.gray[400]}
          />
        </View>
        <View style={styles.unitToggles}>
          <TouchableOpacity onPress={() => setWeightUnit("lbs")}>
            <Text style={weightUnit === "lbs" ? styles.unitActive : styles.unitInactive}>lbs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setWeightUnit("kg")}>
            <Text style={weightUnit === "kg" ? styles.unitActive : styles.unitInactive}>kg</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dimensions Grid */}
      <View style={styles.dimensionsRow}>
        <View style={styles.dimensionCell}>
          <Text style={styles.label}>LENGTH (IN)</Text>
          <TextInput
            style={styles.boldInput}
            value={data.length}
            onChangeText={(v) => handleChange("length", v)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={palette.gray[400]}
          />
        </View>
        <View style={[styles.dimensionCell, styles.borderSides]}>
          <Text style={styles.label}>WIDTH (IN)</Text>
          <TextInput
            style={styles.boldInput}
            value={data.width}
            onChangeText={(v) => handleChange("width", v)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={palette.gray[400]}
          />
        </View>
        <View style={styles.dimensionCell}>
          <Text style={styles.label}>HEIGHT (IN)</Text>
          <TextInput
            style={styles.boldInput}
            value={data.height}
            onChangeText={(v) => handleChange("height", v)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={palette.gray[400]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.gray[200], // stone-200
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[200],
  },
  codeTitleInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    padding: 0,
  },
  weightRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[200],
  },
  weightInputContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unitToggles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    borderLeftColor: palette.gray[200],
  },
  unitActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
  unitInactive: {
    color: palette.gray[300],
    fontWeight: "bold",
  },
  dimensionsRow: {
    flexDirection: "row",
  },
  dimensionCell: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  borderSides: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: palette.gray[200],
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: palette.gray[400],
    textTransform: "uppercase",
    marginBottom: 2,
  },
  boldInput: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    padding: 0,
  },
});
