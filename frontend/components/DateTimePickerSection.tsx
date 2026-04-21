import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CalendarDays, Clock } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export const DateTimePickerSection = () => {
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

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
      if (showPicker === "time") {
        setTime(selectedDate);
      }
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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Book a load</Text>

      <View style={styles.card}>
        {/* Pickup Date */}
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => setShowPicker("pickup")}
        >
          <View style={styles.content}>
            <Text style={styles.label}>PICKUP DATE</Text>
            <Text style={[styles.value, !pickupDate && styles.placeholder]}>
              {formatDate(pickupDate)}
            </Text>
          </View>
          <CalendarDays size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Delivery Date */}
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => setShowPicker("delivery")}
        >
          <View style={styles.content}>
            <Text style={styles.label}>DELIVERY DATE</Text>
            <Text style={[styles.value, !deliveryDate && styles.placeholder]}>
              {formatDate(deliveryDate)}
            </Text>
          </View>
          <CalendarDays size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Time */}
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => setShowPicker("time")}
        >
          <View style={styles.content}>
            <Text style={styles.label}>TIME</Text>
            <Text style={[styles.value, !time && styles.placeholder]}>
              {formatTime(time)}
            </Text>
          </View>

        </TouchableOpacity>
      </View>

      {/* Native Renderers */}
      {showPicker === "pickup" && (
        <DateTimePicker
          value={pickupDate || new Date()}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
      {showPicker === "delivery" && (
        <DateTimePicker
          value={deliveryDate || new Date()}
          mode="date"
          display="default"
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB", // stone-200
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  placeholder: {
    color: "#9CA3AF",
  },
});
