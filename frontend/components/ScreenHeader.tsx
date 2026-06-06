import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  onCancelPress?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  onCancelPress,
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

        {onCancelPress ? (
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
    backgroundColor: "#0F3D26",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  safeArea: {
    backgroundColor: "#0F3D26",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Platform.OS === "android" ? 10 : 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 2,
    textAlign: "center",
  },
  cancelText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
});
