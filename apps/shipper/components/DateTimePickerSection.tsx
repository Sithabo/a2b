import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { CalendarDays, Clock, Lock, Info } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Text, colors, layout, radius, spacing } from "@a2b/ui";

interface DateTimePickerSectionProps {
  pickupDate: Date | null;
  setPickupDate: (date: Date | null) => void;
  pickupWindow: "EARLY_MORNING" | "MID_DAY" | "AFTERNOON" | null;
  setPickupWindow: (window: "EARLY_MORNING" | "MID_DAY" | "AFTERNOON" | null) => void;
  deliveryDate: Date | null;
  setDeliveryDate: (date: Date | null) => void;
  time: Date | null;
  setTime: (time: Date | null) => void;
  isImportFlow: boolean;
}

export const DateTimePickerSection: React.FC<DateTimePickerSectionProps> = ({
  pickupDate,
  setPickupDate,
  pickupWindow,
  setPickupWindow,
  deliveryDate,
  setDeliveryDate,
  time,
  setTime,
  isImportFlow,
}) => {
  // Picker visibility state
  const [showPicker, setShowPicker] = useState<"pickup" | "delivery" | "time" | null>(null);

  const onChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowPicker(null);
      return;
    }

    if (selectedDate) {
      if (showPicker === "pickup") setPickupDate(selectedDate);
      if (showPicker === "delivery") setDeliveryDate(selectedDate);
      if (showPicker === "time") setTime(selectedDate);
    }
    setShowPicker(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select Date";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "Set Time";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const timeWindows = [
    { id: "EARLY_MORNING", label: "Early Morning (06:00 - 10:00)" },
    { id: "MID_DAY", label: "Mid-Day (10:00 - 14:00)" },
    { id: "AFTERNOON", label: "Afternoon (14:00 - 18:00)" },
  ] as const;

  return (
    <View style={styles.container}>
      <Text variant="h3" tone="primary" style={styles.sectionTitle}>Book a load</Text>

      {/* 1. Pickup Section (Ready for Pickup) */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <CalendarDays size={18} color={colors.primary} />
          <Text variant="bodyStrong" tone="primary">Ready for Pickup</Text>
        </View>

        {/* Date Selector */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Pickup date, ${formatDate(pickupDate)}`}
          style={({ pressed }) => [styles.inputRow, pressed && { opacity: 0.85 }]}
          onPress={() => setShowPicker("pickup")}
        >
          <View style={styles.inputContent}>
            <Text variant="label" tone="muted">PICKUP DATE</Text>
            <Text variant="bodyStrong" color={pickupDate ? colors.primary : colors.textPlaceholder}>
              {formatDate(pickupDate)}
            </Text>
          </View>
          <CalendarDays size={18} color={colors.textPlaceholder} />
        </Pressable>

        {/* Time Window Selector */}
        <View style={styles.timeWindowContainer}>
          <Text variant="label" tone="muted">PICKUP TIME WINDOW</Text>
          
          {isImportFlow ? (
            <View style={styles.disabledWindowBox}>
              <Lock size={16} color={colors.textSecondary} />
              <Text variant="bodySm" tone="secondary">
                Port Standard Hours: 08:00 - 17:00
              </Text>
            </View>
          ) : (
            <View style={styles.windowGrid}>
              {timeWindows.map((win) => {
                const isActive = pickupWindow === win.id;
                return (
                  <Pressable
                    key={win.id}
                    accessibilityRole="button"
                    accessibilityLabel={win.label}
                    accessibilityState={{ selected: isActive }}
                    style={({ pressed }) => [
                      styles.windowButton,
                      isActive ? styles.windowActive : styles.windowInactive,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => setPickupWindow(win.id)}
                  >
                    <Text variant="bodyStrong" tone={isActive ? "primary" : "secondary"}>
                      {win.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Micro-copy */}
        <Text variant="caption" tone="muted">
          Specify the time window when the facility is ready to load.
        </Text>

        {/* Import Warning Banner */}
        {isImportFlow && (
          <View style={styles.warningBanner}>
            <Info size={16} color={colors.warning} />
            <Text variant="caption" color={colors.warning} style={styles.warningText}>
              Note: Port terminal operating hours may differ. Ensure your pickup window aligns with official port gate hours to avoid detention fees.
            </Text>
          </View>
        )}
      </View>

      {/* 2. Delivery Section (Delivery Deadline) */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Clock size={18} color={colors.primary} />
          <Text variant="bodyStrong" tone="primary">Delivery Deadline</Text>
        </View>

        {/* Latest Delivery Date Selector */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Latest delivery date, ${formatDate(deliveryDate)}`}
          style={({ pressed }) => [styles.inputRow, pressed && { opacity: 0.85 }]}
          onPress={() => setShowPicker("delivery")}
        >
          <View style={styles.inputContent}>
            <Text variant="label" tone="muted">LATEST DELIVERY DATE</Text>
            <Text variant="bodyStrong" color={deliveryDate ? colors.primary : colors.textPlaceholder}>
              {formatDate(deliveryDate)}
            </Text>
          </View>
          <CalendarDays size={18} color={colors.textPlaceholder} />
        </Pressable>

        {/* Time Not Later Than Selector */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Time, not later than, ${formatTime(time)}`}
          style={({ pressed }) => [styles.inputRow, styles.inputRowLast, pressed && { opacity: 0.85 }]}
          onPress={() => setShowPicker("time")}
        >
          <View style={styles.inputContent}>
            <Text variant="label" tone="muted">TIME (NOT LATER THAN)</Text>
            <Text variant="bodyStrong" color={time ? colors.primary : colors.textPlaceholder}>
              {formatTime(time)}
            </Text>
          </View>
          <Clock size={18} color={colors.textPlaceholder} />
        </Pressable>

        {/* Micro-copy */}
        <Text variant="caption" tone="muted">
          The latest time the goods must arrive at the destination.
        </Text>
      </View>

      {/* Native Datetime Picker Renderers */}
      {showPicker === "pickup" && (
        <DateTimePicker
          value={pickupDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onChange}
        />
      )}
      {showPicker === "delivery" && (
        <DateTimePicker
          value={deliveryDate || new Date()}
          mode="date"
          display="default"
          minimumDate={pickupDate || new Date()}
          onChange={onChange}
        />
      )}
      {showPicker === "time" && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  sectionTitle: {
    marginBottom: -spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSunken,
    paddingBottom: spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: layout.touchMin,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSunken,
    paddingVertical: spacing.sm,
  },
  inputRowLast: {
    borderBottomWidth: 0,
  },
  inputContent: {
    flex: 1,
    gap: spacing.xs,
  },
  timeWindowContainer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  disabledWindowBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: layout.touchLg,
  },
  windowGrid: {
    flexDirection: "column",
    gap: spacing.sm,
  },
  windowButton: {
    minHeight: layout.touchMin,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  windowInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  windowActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  warningBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.warningMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-start",
  },
  warningText: {
    flex: 1,
  },
});
