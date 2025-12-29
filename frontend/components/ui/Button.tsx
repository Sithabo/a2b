import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from "react-native";
import { Colors } from "@/constants/theme";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "lg" | "sm";
  style?: ViewStyle;
  textStyle?: TextStyle;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: boolean;
}

export const Button = ({
  onPress,
  title,
  variant = "primary",
  size = "default",
  isLoading = false,
  disabled = false,
  icon,
  iconRight = false,
  style,
  textStyle,
}: ButtonProps) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return styles.primaryButton;
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      case "ghost":
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "lg":
        return styles.lgButton;
      case "sm":
        return styles.smButton;
      default:
        return styles.defaultButton;
    }
  };

  const getTextVariantStyle = (): TextStyle => {
    switch (variant) {
      case "primary":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      case "ghost":
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost"
              ? Colors.light.primary
              : "#FFFFFF"
          }
        />
      ) : (
        <>
          {icon && !iconRight && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.textBase, getTextVariantStyle(), textStyle]}>
            {title}
          </Text>
          {icon && iconRight && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  // Variants
  primaryButton: {
    backgroundColor: Colors.light.lime, // #C4E84A
    borderWidth: 1,
    borderColor: Colors.light.lime,
  },
  secondaryButton: {
    backgroundColor: Colors.light.amber,
    borderWidth: 1,
    borderColor: Colors.light.amber,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D1D5DB", // gray-300
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  // Sizes
  defaultButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  lgButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  smButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  // Text Styles
  textBase: {
    fontWeight: "bold",
    textAlign: "center",
  },
  primaryText: {
    color: Colors.light.gray[900], // Black text for Lime button
  },
  secondaryText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: Colors.light.gray[900],
  },
  ghostText: {
    color: Colors.light.gray[600],
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
