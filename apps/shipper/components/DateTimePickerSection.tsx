import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CalendarDays, Clock, Lock, Info } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

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
      <Text style={styles.sectionTitle}>Book a load</Text>

      {/* 1. Pickup Section (Ready for Pickup) */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <CalendarDays size={18} color="#0F3D26" />
          <Text style={styles.cardSectionTitle}>Ready for Pickup</Text>
        </View>

        {/* Date Selector */}
        <TouchableOpacity
          style={styles.inputRow}
          activeOpacity={0.7}
          onPress={() => setShowPicker("pickup")}
        >
          <View style={styles.inputContent}>
            <Text style={styles.inputLabel}>PICKUP DATE</Text>
            <Text style={[styles.inputValue, !pickupDate && styles.placeholder]}>
              {formatDate(pickupDate)}
            </Text>
          </View>
          <CalendarDays size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Time Window Selector */}
        <View style={styles.timeWindowContainer}>
          <Text style={styles.inputLabel}>PICKUP TIME WINDOW</Text>
          
          {isImportFlow ? (
            <View style={styles.disabledWindowBox}>
              <Lock size={16} color="#4B5563" />
              <Text style={styles.disabledWindowText}>
                Port Standard Hours: 08:00 - 17:00
              </Text>
            </View>
          ) : (
            <View style={styles.windowGrid}>
              {timeWindows.map((win) => {
                const isActive = pickupWindow === win.id;
                return (
                  <TouchableOpacity
                    key={win.id}
                    style={[
                      styles.windowButton,
                      isActive ? styles.windowActive : styles.windowInactive,
                    ]}
                    onPress={() => setPickupWindow(win.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.windowButtonText,
                        isActive ? styles.windowTextActive : styles.windowTextInactive,
                      ]}
                    >
                      {win.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Micro-copy */}
        <Text style={styles.microCopy}>
          Specify the time window when the facility is ready to load.
        </Text>

        {/* Import Warning Banner */}
        {isImportFlow && (
          <View style={styles.warningBanner}>
            <Info size={16} color="#B45309" />
            <Text style={styles.warningText}>
              Note: Port terminal operating hours may differ. Ensure your pickup window aligns with official port gate hours to avoid detention fees.
            </Text>
          </View>
        )}
      </View>

      {/* 2. Delivery Section (Delivery Deadline) */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Clock size={18} color="#0F3D26" />
          <Text style={styles.cardSectionTitle}>Delivery Deadline</Text>
        </View>

        {/* Latest Delivery Date Selector */}
        <TouchableOpacity
          style={styles.inputRow}
          activeOpacity={0.7}
          onPress={() => setShowPicker("delivery")}
        >
          <View style={styles.inputContent}>
            <Text style={styles.inputLabel}>LATEST DELIVERY DATE</Text>
            <Text style={[styles.inputValue, !deliveryDate && styles.placeholder]}>
              {formatDate(deliveryDate)}
            </Text>
          </View>
          <CalendarDays size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Time Not Later Than Selector */}
        <TouchableOpacity
          style={[styles.inputRow, { borderBottomWidth: 0 }]}
          activeOpacity={0.7}
          onPress={() => setShowPicker("time")}
        >
          <View style={styles.inputContent}>
            <Text style={styles.inputLabel}>TIME (NOT LATER THAN)</Text>
            <Text style={[styles.inputValue, !time && styles.placeholder]}>
              {formatTime(time)}
            </Text>
          </View>
          <Clock size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Micro-copy */}
        <Text style={styles.microCopy}>
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
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
    marginBottom: -8,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 10,
  },
  inputContent: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  placeholder: {
    color: "#9CA3AF",
  },
  timeWindowContainer: {
    gap: 10,
    marginTop: 4,
  },
  disabledWindowBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  disabledWindowText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  windowGrid: {
    flexDirection: "column",
    gap: 8,
  },
  windowButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  windowInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  windowActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#0F3D26",
  },
  windowButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  windowTextActive: {
    color: "#0F3D26",
  },
  windowTextInactive: {
    color: "#4B5563",
  },
  microCopy: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    fontStyle: "italic",
  },
  warningBanner: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    alignItems: "flex-start",
  },
  warningText: {
    fontSize: 11,
    color: "#B45309",
    flex: 1,
    lineHeight: 16,
    fontWeight: "500",
  },
});
