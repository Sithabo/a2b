import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle } from "react-native";

export interface ToolCardProps {
  title: string;
  icon: React.ElementType;
  onPress?: () => void;
  backgroundColor?: string;
  iconBackgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  title,
  icon: Icon,
  onPress,
  backgroundColor = "#0F3D26",
  iconBackgroundColor = "rgba(255, 255, 255, 0.15)",
  textColor = "#FFFFFF",
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
        <Icon size={28} color={textColor} strokeWidth={2.5} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    width: "47%", // Fits 2 in a row nicely with gap
    aspectRatio: 1, // Makes it a perfect square
    justifyContent: "space-between", // Icon top, text bottom
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800", // Extrabold to match screenshot
    lineHeight: 24,
  },
});
