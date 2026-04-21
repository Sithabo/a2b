import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { MapPin, Circle, ArrowDownUp, Plus } from "lucide-react-native";
import { Card } from "./Card"; // Assuming Card is in the same directory, if not fix path later

export interface LocationPickerProps {
  startLocation: string;
  endLocation: string;
  onChangeStart: (text: string) => void;
  onChangeEnd: (text: string) => void;
  onSwap?: () => void;
  onAddStop?: () => void;
  style?: ViewStyle;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  startLocation,
  endLocation,
  onChangeStart,
  onChangeEnd,
  onSwap,
  onAddStop,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentWrapper}>
        {/* Left Column: Timeline Icons */}
        <View style={styles.timelineColumn}>
          <Circle size={16} color="#0F3D26" fill="#0F3D26" />
          <View style={styles.dottedLine} />
          <MapPin size={16} color="#D1D5DB" fill="#D1D5DB" />
        </View>

        {/* Right Column: Inputs */}
        <View style={styles.inputsColumn}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>START LOCATION</Text>
            <TextInput
              style={styles.input}
              value={startLocation}
              onChangeText={onChangeStart}
              placeholder="e.g. Houston, TX"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View style={styles.inputSection}>
            <Text style={styles.label}>WHERE</Text>
            <TextInput
              style={styles.input}
              value={endLocation}
              onChangeText={onChangeEnd}
              placeholder="e.g. San Antonio, TX"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Floating Swap Button */}
        <TouchableOpacity style={styles.swapButton} activeOpacity={0.8} onPress={onSwap}>
          <ArrowDownUp size={18} color="#0F3D26" />
        </TouchableOpacity>

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={onAddStop}>
          <Plus size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F4", // stone-100
  },
  contentWrapper: {
    flexDirection: "row",
    position: "relative",
  },
  timelineColumn: {
    alignItems: "center",
    marginTop: 4,
    marginRight: 16,
  },
  dottedLine: {
    width: 2,
    height: 48,
    borderLeftWidth: 2,
    borderColor: "#D1D5DB", // stone-300
    borderStyle: "dashed",
    marginVertical: 4,
  },
  inputsColumn: {
    flex: 1,
    justifyContent: "space-between",
    gap: 24,
  },
  inputSection: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#A8A29E", // stone-400
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
    padding: 0, // Remove default Android padding
  },
  swapButton: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FAFAF9", // stone-50
    borderWidth: 1,
    borderColor: "#F5F5F4", // stone-100
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  addButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
