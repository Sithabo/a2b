import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { colors, palette } from "@a2b/ui";

export interface LoadTypeOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface LoadTypeSelectorProps {
  options: LoadTypeOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const LoadTypeSelector: React.FC<LoadTypeSelectorProps> = ({
  options,
  selectedId,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Types of Loads</Text>
      <View style={styles.gridContainer}>
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const Icon = option.icon;

          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              onPress={() => onSelect(option.id)}
              style={[
                styles.optionCard,
                isSelected ? styles.cardSelected : styles.cardUnselected,
              ]}
            >
              <Icon
                size={24}
                color={isSelected ? colors.primary : palette.stone[400]}
                strokeWidth={isSelected ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.optionText,
                  isSelected ? styles.textSelected : styles.textUnselected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  optionCard: {
    width: "48%", // 2 columns with spacing
    height: 90,
    backgroundColor: palette.white,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardUnselected: {
    borderColor: palette.gray[200], // stone-200 / gray-200 approx
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary, // brand-forest
  },
  optionText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  textUnselected: {
    color: palette.stone[600], // stone-600
  },
  textSelected: {
    color: colors.primary,
  },
});
