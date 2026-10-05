import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Upload, CheckCircle } from "lucide-react-native";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

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
          <CheckCircle size={20} color="#FFFFFF" />
        ) : (
          <Upload size={20} color={Colors.light.gray[500]} />
        )}
      </View>

      <View style={styles.textContainer}>
        <ThemedText
          style={[styles.label, isCompleted && styles.completedLabel]}
        >
          {label}
        </ThemedText>
        {description && (
          <ThemedText type="caption" style={styles.description}>
            {description}
          </ThemedText>
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
    backgroundColor: "#FFFFFF",
    borderColor: Colors.light.gray[300],
  },
  completedContainer: {
    backgroundColor: "rgba(15, 61, 38, 0.05)", // Forest with opacity
    borderColor: Colors.light.primary,
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
    backgroundColor: Colors.light.gray[100],
  },
  completedIconContainer: {
    backgroundColor: Colors.light.primary,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    color: Colors.light.gray[900],
  },
  completedLabel: {
    color: Colors.light.primary,
  },
  description: {
    color: Colors.light.gray[400],
  },
});
