import React from "react";
import { View, Pressable, StyleSheet, ViewStyle } from "react-native";
import { MapPin, Circle, ArrowDownUp, Plus } from "lucide-react-native";
import { IconButton, Text, TextField, colors, radius, spacing } from "@a2b/ui";
import { useMarket } from "@/store/useMarket";

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
  // Examples from the shipper's own market: a customs zone to start, a town to end
  const market = useMarket();
  const startExample = `e.g. ${market.places.find((p) => p.isPort)?.name ?? market.name}`;
  const endExample = `e.g. ${market.places.find((p) => p.kind === "town")?.name ?? market.name}`;
  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentWrapper}>
        {/* Left Column: Timeline Icons */}
        <View style={styles.timelineColumn}>
          <Circle size={16} color={colors.primary} fill={colors.primary} />
          <View style={styles.dottedLine} />
          <MapPin size={16} color={colors.borderStrong} fill={colors.borderStrong} />
        </View>

        {/* Right Column: Inputs */}
        <View style={styles.inputsColumn}>
          {onPressStart ? (
            <Pressable
              onPress={onPressStart}
              accessibilityRole="button"
              accessibilityLabel={`Start location${startLocation ? `, ${startLocation}` : ""}`}
              style={({ pressed }) => [styles.inputSectionPressable, pressed && { opacity: 0.85 }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text variant="label" tone="muted">START LOCATION</Text>
              <Text
                variant={startLocation ? "h3" : "body"}
                color={startLocation ? colors.primary : colors.textPlaceholder}
              >
                {startLocation || startExample}
              </Text>
            </Pressable>
          ) : (
            <TextField
              label="START LOCATION"
              value={startLocation}
              onChangeText={onChangeStart}
              placeholder={startExample}
            />
          )}

          {onPressEnd ? (
            <Pressable
              onPress={onPressEnd}
              accessibilityRole="button"
              accessibilityLabel={`Where${endLocation ? `, ${endLocation}` : ""}`}
              style={({ pressed }) => [styles.inputSectionPressable, pressed && { opacity: 0.85 }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text variant="label" tone="muted">WHERE</Text>
              <Text
                variant={endLocation ? "h3" : "body"}
                color={endLocation ? colors.primary : colors.textPlaceholder}
              >
                {endLocation || endExample}
              </Text>
            </Pressable>
          ) : (
            <TextField
              label="WHERE"
              value={endLocation}
              onChangeText={onChangeEnd}
              placeholder="e.g. San Antonio, TX"
            />
          )}
        </View>

        {/* Floating Swap Button */}
        <IconButton
          icon={ArrowDownUp}
          accessibilityLabel="Swap start and destination"
          onPress={() => onSwap?.()}
          style={styles.swapButton}
        />

        {/* Floating Add Button */}
        <IconButton
          icon={Plus}
          accessibilityLabel="Add stop"
          variant="plain"
          size={32}
          onPress={() => onAddStop?.()}
          style={styles.addButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing["2xl"],
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentWrapper: {
    flexDirection: "row",
    position: "relative",
  },
  timelineColumn: {
    alignItems: "center",
    marginTop: spacing.xs,
    marginRight: spacing.lg,
  },
  dottedLine: {
    width: 2,
    height: 48,
    borderLeftWidth: 2,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    marginVertical: spacing.xs,
  },
  inputsColumn: {
    flex: 1,
    justifyContent: "space-between",
    gap: spacing["2xl"],
  },
  inputSectionPressable: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    marginVertical: -spacing.xs,
  },
  swapButton: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -20 }],
    zIndex: 10,
  },
  addButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
