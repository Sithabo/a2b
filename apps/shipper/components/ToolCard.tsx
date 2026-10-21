import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Card, Text, colors, fontFamily, radius, spacing } from "@a2b/ui";

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
  backgroundColor = colors.primary,
  iconBackgroundColor = colors.onPrimaryTrack,
  textColor = colors.onPrimary,
  style,
}) => {
  return (
    <Card
      variant="brand"
      padding="md"
      onPress={onPress}
      accessibilityLabel={title.replace(/\n/g, " ")}
      style={[styles.card, { backgroundColor, borderColor: backgroundColor }, style]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
        <Icon size={28} color={textColor} strokeWidth={2.5} />
      </View>
      <Text variant="caption" color={textColor} style={styles.title}>
        {title}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "31%",
    // Square-ish, but grows if the title needs more room (larger text sizes)
    minHeight: 112,
    justifyContent: "space-between", // Icon top, text bottom
    gap: spacing.xs,
  },
  title: { fontFamily: fontFamily.semibold },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
