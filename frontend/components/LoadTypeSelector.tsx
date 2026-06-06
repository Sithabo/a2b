import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";

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
                color={isSelected ? "#0F3D26" : "#A8A29E"}
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
    color: "#0F3D26",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardUnselected: {
    borderColor: "#E5E7EB", // stone-200 / gray-200 approx
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#0F3D26", // brand-forest
  },
  optionText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  textUnselected: {
    color: "#57534E", // stone-600
  },
  textSelected: {
    color: "#0F3D26",
  },
});
