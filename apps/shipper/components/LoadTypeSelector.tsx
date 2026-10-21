import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { Text, colors, radius, spacing } from "@a2b/ui";

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
      <Text variant="h3" tone="primary" style={styles.sectionTitle}>
        Types of Loads
      </Text>
      <View style={styles.gridContainer}>
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const Icon = option.icon;

          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [
                styles.optionCard,
                isSelected ? styles.cardSelected : styles.cardUnselected,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Icon
                size={24}
                color={isSelected ? colors.primary : colors.textPlaceholder}
                strokeWidth={isSelected ? 2.5 : 2}
              />
              <Text
                variant="label"
                tone={isSelected ? "primary" : "secondary"}
                align="center"
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
  optionCard: {
    width: "48%", // 2 columns with spacing
    height: 90,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
  },
  cardUnselected: {
    borderColor: colors.border,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
