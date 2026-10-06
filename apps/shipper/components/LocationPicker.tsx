import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { MapPin, Circle, ArrowDownUp, Plus } from "lucide-react-native";
import { colors, palette } from "@a2b/ui";

export interface LocationPickerProps {
  startLocation: string;
  endLocation: string;
  onChangeStart?: (text: string) => void;
  onChangeEnd?: (text: string) => void;
  onSwap?: () => void;
  onAddStop?: () => void;
  style?: ViewStyle;
  onPressStart?: () => void;
  onPressEnd?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  startLocation,
  endLocation,
  onChangeStart,
  onChangeEnd,
  onSwap,
  onAddStop,
  style,
  onPressStart,
  onPressEnd,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentWrapper}>
        {/* Left Column: Timeline Icons */}
        <View style={styles.timelineColumn}>
          <Circle size={16} color={colors.primary} fill={colors.primary} />
          <View style={styles.dottedLine} />
          <MapPin size={16} color={palette.gray[300]} fill={palette.gray[300]} />
        </View>

        {/* Right Column: Inputs */}
        <View style={styles.inputsColumn}>
          {onPressStart ? (
            <TouchableOpacity
              onPress={onPressStart}
              activeOpacity={0.7}
              style={styles.inputSectionPressable}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.label}>START LOCATION</Text>
              <Text style={[styles.input, !startLocation && styles.placeholderText]}>
                {startLocation || "e.g. Paramaribo, Suriname"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.inputSection}>
              <Text style={styles.label}>START LOCATION</Text>
              <TextInput
                style={styles.input}
                value={startLocation}
                onChangeText={onChangeStart}
                placeholder="e.g. GeorgeTown, Guyana"
                placeholderTextColor={palette.gray[400]}
              />
            </View>
          )}
          
          {onPressEnd ? (
            <TouchableOpacity
              onPress={onPressEnd}
              activeOpacity={0.7}
              style={styles.inputSectionPressable}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.label}>WHERE</Text>
              <Text style={[styles.input, !endLocation && styles.placeholderText]}>
                {endLocation || "e.g. GeorgeTown Guyana"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.inputSection}>
              <Text style={styles.label}>WHERE</Text>
              <TextInput
                style={styles.input}
                value={endLocation}
                onChangeText={onChangeEnd}
                placeholder="e.g. San Antonio, TX"
                placeholderTextColor={palette.gray[400]}
              />
            </View>
          )}
        </View>

        {/* Floating Swap Button */}
        <TouchableOpacity style={styles.swapButton} activeOpacity={0.8} onPress={onSwap}>
          <ArrowDownUp size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={onAddStop}>
          <Plus size={20} color={palette.gray[400]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: palette.stone[100], // stone-100
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
    borderColor: palette.gray[300], // stone-300
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
  inputSectionPressable: {
    gap: 4,
    paddingVertical: 4,
    marginVertical: -4,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: palette.stone[400], // stone-400
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    padding: 0, // Remove default Android padding
  },
  placeholderText: {
    color: palette.gray[400],
    fontWeight: "normal",
  },
  swapButton: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.stone[50], // stone-50
    borderWidth: 1,
    borderColor: palette.stone[100], // stone-100
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
