import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, FileText, Share2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OfficialReceiptScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} />
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Official Receipt</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successCircle}>
            <Check color="#FFFFFF" size={48} strokeWidth={3} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Job Completed!</Text>

        {/* Receipt Wrapper */}
        <View style={styles.receiptWrapper}>
          <View style={styles.receiptCard}>
            
            {/* Metadata Rows */}
            <View style={styles.metadataSection}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Transaction ID:</Text>
                <Text style={styles.metaValue}>#A2B-TXN-882</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Driver:</Text>
                <Text style={styles.metaValue}>John Mukasa</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Pickup:</Text>
                <Text style={styles.metaValue}>Kampala, Central</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Delivery:</Text>
                <Text style={styles.metaValue}>Jinja, Industrial Area</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Vehicle:</Text>
                <Text style={styles.metaValue}>Fuso Fighter (UAM 456K)</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Load Type:</Text>
                <Text style={styles.metaValue}>General Cargo (Sacks)</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payment Method:</Text>
                <Text style={styles.metaValue}>MTN Mobile Money</Text>
              </View>
            </View>

            {/* Cutout Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.cutoutLeft} />
              <View style={styles.dashedLineHorizontal} />
              <View style={styles.cutoutRight} />
            </View>

            {/* Price Footer */}
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Amount Paid:</Text>
              <Text style={styles.priceValue}>150,000 UGX</Text>
            </View>

          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.7}>
            <FileText color="#0F3D26" size={18} />
            <Text style={styles.outlineButtonText}>Download PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.7}>
            <Share2 color="#0F3D26" size={18} />
            <Text style={styles.outlineButtonText}>Share via WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.push("/")}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5E9",
  },
  header: {
    backgroundColor: "#F5F5E9",
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: "center",
  },
  successIconContainer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0F3D26",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F3D26",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F3D26",
    marginBottom: 32,
  },
  receiptWrapper: {
    width: "100%",
    paddingHorizontal: 24,
    position: "relative",
    marginBottom: 32,
  },
  receiptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 32,
    position: "relative",
  },
  metadataSection: {
    paddingHorizontal: 24,
    gap: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  metaLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
    flex: 1,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    textAlign: "right",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    height: 30, // height of the cutout
    marginTop: 24,
    marginBottom: 16,
  },
  dashedLineHorizontal: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginHorizontal: 15,
  },
  cutoutLeft: {
    position: "absolute",
    left: -15, // Pull outside the card
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F5F5E9",
    zIndex: 2,
  },
  cutoutRight: {
    position: "absolute",
    right: -15,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F5F5E9",
    zIndex: 2,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  priceLabel: {
    fontSize: 18,
    color: "#0F3D26",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F3D26",
  },
  actionsContainer: {
    width: "100%",
    paddingHorizontal: 24,
    gap: 12,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0F3D26",
    paddingVertical: 16,
    gap: 8,
  },
  outlineButtonText: {
    color: "#0F3D26",
    fontSize: 15,
    fontWeight: "bold",
  },
  primaryButton: {
    backgroundColor: "#0F3D26",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
