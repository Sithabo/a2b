import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Upload, CheckCircle } from "lucide-react-native";
import { colors, palette, Text } from "@a2b/ui";

interface FileUploadProps {
  label: string;
  description?: string;
  onPress: () => void;
  status?: "empty" | "uploading" | "completed";
  style?: ViewStyle;
}

export const FileUpload = ({
  label,
  description,
  onPress,
  status = "empty",
  style,
}: FileUploadProps) => {
  const isCompleted = status === "completed";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        isCompleted ? styles.completedContainer : styles.defaultContainer,
        style,
      ]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          isCompleted
            ? styles.completedIconContainer
            : styles.defaultIconContainer,
        ]}
      >
        {isCompleted ? (
          <CheckCircle size={20} color={palette.white} />
        ) : (
          <Upload size={20} color={palette.gray[500]} />
        )}
      </View>

      <View style={styles.textContainer}>
        <Text tone="primary"
          style={[styles.label, isCompleted && styles.completedLabel]}
        >
          {label}
        </Text>
        {description && (
          <Text variant="caption" tone="secondary" style={styles.description}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  defaultContainer: {
    backgroundColor: palette.white,
    borderColor: palette.gray[300],
  },
  completedContainer: {
    backgroundColor: "rgba(15, 61, 38, 0.05)", // Forest with opacity
    borderColor: colors.primary,
    borderStyle: "solid",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultIconContainer: {
    backgroundColor: palette.gray[100],
  },
  completedIconContainer: {
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    color: palette.gray[900],
  },
  completedLabel: {
    color: colors.primary,
  },
  description: {
    color: palette.gray[400],
  },
});
