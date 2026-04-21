import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
      </ScrollView>
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
  scrollContent: {
    gap: 12, // Spaces between buttons
    paddingRight: 20, // To allow scrolling completely
  },
  optionCard: {
    width: 112, // w-28
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12, // Space between icon and text
  },
  cardUnselected: {
    borderWidth: 1,
    borderColor: "#F5F5F4", // stone-100
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#0F3D26", // brand-forest
  },
  optionText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  textUnselected: {
    color: "#57534E", // stone-600
  },
  textSelected: {
    color: "#0F3D26",
  },
});
