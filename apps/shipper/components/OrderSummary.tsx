import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";

export interface OrderData {
  id: string;
  title: string;
  status: string;
  quantity: number;
  size: string;
  weight: string;
  type: string;
}

export interface OrderSummaryProps {
  data: OrderData;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ data }) => {
  return (
    <View style={styles.card}>
      {/* Top Header Section */}
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/cargo_box.png")}
            style={styles.image}
            contentFit="contain"
          />
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.orderId}>#{data.id}</Text>
          <Text style={styles.orderTitle}>{data.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{data.status}</Text>
          </View>
        </View>
      </View>

      {/* Details Box Section */}
      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity : </Text>
          <Text style={styles.detailValue}>{data.quantity}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Size : </Text>
          <Text style={styles.detailValue}>{data.size}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Weight : </Text>
          <Text style={styles.detailValue}>{data.weight}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type order : </Text>
          <Text style={styles.detailValue}>{data.type}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    gap: 16,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#F7F6ED", // matches the beige background
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  headerRight: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  orderId: {
    fontSize: 14,
    color: "#57534E", // stone-600
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1917", // stone-900
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: "#7C3AED", // violet-600 approx
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsBox: {
    backgroundColor: "#E2E8F0", // slate-200 / slate-100 hybrid matching grey
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 15,
    color: "#3F3F46", // zinc-700
  },
  detailValue: {
    fontSize: 15,
    color: "#1C1917", // stone-900
  },
});
