import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  onCancelPress?: () => void;
  rightElement?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  onCancelPress,
  rightElement,
}) => {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea} />
      <View style={styles.contentRow}>
        {onBackPress ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#0F3D26" size={20} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>

        {rightElement ? (
          rightElement
        ) : onCancelPress ? (
          <TouchableOpacity onPress={onCancelPress} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Platform.OS === "android" ? 10 : 5,
    height: 52,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F3D26",
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },
  cancelText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
});
