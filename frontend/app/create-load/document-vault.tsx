import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  ArrowLeft,
  Lock,
  Upload,
  CheckCircle,
  X,
  Shield,
  File,
  ChevronRight,
} from "lucide-react-native";
import { useShipmentStore } from "@/store/useShipmentStore";

interface DocumentInfo {
  name: string;
  size: string;
}

export default function DocumentVaultScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  
  const addShipment = useShipmentStore((state) => state.addShipment);
  const draftShipment = useShipmentStore((state) => state.draftShipment);
  const setDraftShipment = useShipmentStore((state) => state.setDraftShipment);
  const clearDraftShipment = useShipmentStore((state) => state.clearDraftShipment);
  const resetRouteState = useShipmentStore((state) => state.resetRouteState);
  const pickupLocation = useShipmentStore((state) => state.pickupLocation);
  const dropoffLocation = useShipmentStore((state) => state.dropoffLocation);

  // Get search params if routing from create-load screen
  const params = useLocalSearchParams<{
    pickup?: string;
    delivery?: string;
    cargoType?: string;
    weight?: string;
  }>();

  // Restore from draft or params
  const pickup = draftShipment?.pickup || pickupLocation?.name || params.pickup || "Georgetown Port";
  const delivery = draftShipment?.delivery || dropoffLocation?.name || params.delivery || "";
  const cargoType = draftShipment?.cargoType || params.cargoType || "general";
  const weight = draftShipment?.weight || params.weight || "250";

  const [containerId, setContainerId] = useState(draftShipment?.containerId || "");
  const [uploadedFiles, setUploadedFiles] = useState<{
    bol: DocumentInfo | null;
    invoice: DocumentInfo | null;
    clearance: DocumentInfo | null;
  }>({
    bol: draftShipment?.documents?.bol || null,
    invoice: draftShipment?.documents?.invoice || null,
    clearance: draftShipment?.documents?.clearance || null,
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<"bol" | "invoice" | "clearance" | null>(null);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  // Check if everything is filled
  const isFormValid =
    containerId.trim().length > 4 &&
    uploadedFiles.bol !== null &&
    uploadedFiles.invoice !== null &&
    uploadedFiles.clearance !== null;

  // Intercept navigation to cache draft if incomplete
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // If complete, proceed without draft intercept
      if (isSubmissionComplete) {
        return;
      }

      // Check if user has entered anything
      const hasProgress =
        containerId.trim().length > 0 ||
        uploadedFiles.bol !== null ||
        uploadedFiles.invoice !== null ||
        uploadedFiles.clearance !== null;

      if (hasProgress) {
        // Prevent default action
        e.preventDefault();

        Alert.alert(
          "Unfinished Import Shipment",
          "Your progress will be saved as a draft. You can complete your document uploads from the dashboard.",
          [
            {
              text: "Discard Draft",
              style: "destructive",
              onPress: () => {
                clearDraftShipment();
                resetRouteState();
                navigation.dispatch(e.data.action);
              },
            },
            {
              text: "Save Draft & Exit",
              onPress: () => {
                setDraftShipment({
                  pickup,
                  delivery,
                  cargoType,
                  weight,
                  containerId,
                  documents: uploadedFiles,
                  status: "DRAFT_PENDING_DOCS",
                  createdAt: new Date().toISOString(),
                });
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }
    });

    return unsubscribe;
  }, [
    navigation,
    containerId,
    uploadedFiles,
    isSubmissionComplete,
    pickup,
    delivery,
    cargoType,
    weight,
    clearDraftShipment,
    setDraftShipment,
    resetRouteState,
  ]);

  const openMockPicker = (slot: "bol" | "invoice" | "clearance") => {
    setActiveSlot(slot);
    setIsPickerOpen(true);
  };

  const handleSelectMockFile = (fileName: string, fileSize: string) => {
    if (!activeSlot) return;

    setUploadedFiles((prev) => ({
      ...prev,
      [activeSlot]: { name: fileName, size: fileSize },
    }));
    
    setIsPickerOpen(false);
    setActiveSlot(null);
  };

  const handleFinalizeVerification = () => {
    if (!isFormValid) return;

    setIsSubmissionComplete(true);

    // Save final load to useShipmentStore
    addShipment({
      pickup,
      delivery,
      cargoType,
      weight,
      offerPrice: "185000", // Guyanese ports premium offer
      status: "OPEN",
      deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      acceptedByDriver: false,
      is_import: true,
      containerId,
      documents: {
        bol: uploadedFiles.bol!,
        invoice: uploadedFiles.invoice!,
        clearance: uploadedFiles.clearance!,
      },
    });

    // Clear draft state
    clearDraftShipment();
    resetRouteState();

    // Route to success confirmation state
    router.replace("/create-load/status?state=confirmed");
  };

  // Mock file options matching each card requirements
  const getMockOptions = () => {
    switch (activeSlot) {
      case "bol":
        return [
          { name: "Bill_of_Lading_GRA_092.pdf", size: "124 KB" },
          { name: "Airway_Bill_GY_7821.pdf", size: "85 KB" },
        ];
      case "invoice":
        return [
          { name: "GRA_Certified_Invoice_signed.pdf", size: "450 KB" },
          { name: "Commercial_Invoice_Demerara.pdf", size: "310 KB" },
        ];
      case "clearance":
        return [
          { name: "C21_Customs_Clearance_Form.pdf", size: "89 KB" },
          { name: "C32_Entry_Clearance_Stamped.pdf", size: "155 KB" },
        ];
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Custom Page Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#0F3D26" size={20} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Compliance Vault</Text>
          <Text style={styles.headerSubtitle}>Step 3 of 3: Document Uploads</Text>
        </View>
        <Lock size={20} color="#0F3D26" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Secure Info Banner */}
        <View style={styles.secureBanner}>
          <Shield size={20} color="#0F3D26" />
          <View style={styles.secureBannerTextContainer}>
            <Text style={styles.secureBannerTitle}>Institutional Level Security</Text>
            <Text style={styles.secureBannerSub}>
              All documents are encrypted and directly routed to the Guyana Revenue Authority port log validator systems.
            </Text>
          </View>
        </View>

        {/* Input for customs reference */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Customs Reference / Container ID</Text>
          <TextInput
            style={styles.textInput}
            value={containerId}
            onChangeText={setContainerId}
            placeholder="e.g. CON-GY-82195"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
          />
        </View>

        {/* 3 Upload slots */}
        <View style={styles.uploadCardsSection}>
          <Text style={styles.sectionHeading}>Mandatory Compliance Documents</Text>

          {/* Slot 1: Bill of Lading */}
          <TouchableOpacity
            style={[
              styles.uploadCard,
              uploadedFiles.bol ? styles.uploadCardCompleted : styles.uploadCardEmpty,
            ]}
            onPress={() => openMockPicker("bol")}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.iconWrapper,
                uploadedFiles.bol ? styles.iconWrapperCompleted : styles.iconWrapperEmpty,
              ]}
            >
              {uploadedFiles.bol ? (
                <CheckCircle size={20} color="#FFFFFF" />
              ) : (
                <Upload size={20} color="#6B7280" />
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text
                style={[
                  styles.cardLabel,
                  uploadedFiles.bol ? styles.cardLabelCompleted : styles.cardLabelEmpty,
                ]}
              >
                Bill of Lading / Airway Bill
              </Text>
              <Text style={styles.cardMicrocopy}>
                {uploadedFiles.bol
                  ? `${uploadedFiles.bol.name} (${uploadedFiles.bol.size})`
                  : "Must display Freight Certified Stamp."}
              </Text>
            </View>
            <ChevronRight size={18} color={uploadedFiles.bol ? "#10B981" : "#D1D5DB"} />
          </TouchableOpacity>

          {/* Slot 2: Certified Invoice */}
          <TouchableOpacity
            style={[
              styles.uploadCard,
              uploadedFiles.invoice ? styles.uploadCardCompleted : styles.uploadCardEmpty,
            ]}
            onPress={() => openMockPicker("invoice")}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.iconWrapper,
                uploadedFiles.invoice ? styles.iconWrapperCompleted : styles.iconWrapperEmpty,
              ]}
            >
              {uploadedFiles.invoice ? (
                <CheckCircle size={20} color="#FFFFFF" />
              ) : (
                <Upload size={20} color="#6B7280" />
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text
                style={[
                  styles.cardLabel,
                  uploadedFiles.invoice ? styles.cardLabelCompleted : styles.cardLabelEmpty,
                ]}
              >
                Original Certified Invoice
              </Text>
              <Text style={styles.cardMicrocopy}>
                {uploadedFiles.invoice
                  ? `${uploadedFiles.invoice.name} (${uploadedFiles.invoice.size})`
                  : "Must feature company stamp or signature to verify valuation."}
              </Text>
            </View>
            <ChevronRight size={18} color={uploadedFiles.invoice ? "#10B981" : "#D1D5DB"} />
          </TouchableOpacity>

          {/* Slot 3: Customs Clearance */}
          <TouchableOpacity
            style={[
              styles.uploadCard,
              uploadedFiles.clearance ? styles.uploadCardCompleted : styles.uploadCardEmpty,
            ]}
            onPress={() => openMockPicker("clearance")}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.iconWrapper,
                uploadedFiles.clearance ? styles.iconWrapperCompleted : styles.iconWrapperEmpty,
              ]}
            >
              {uploadedFiles.clearance ? (
                <CheckCircle size={20} color="#FFFFFF" />
              ) : (
                <Upload size={20} color="#6B7280" />
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text
                style={[
                  styles.cardLabel,
                  uploadedFiles.clearance ? styles.cardLabelCompleted : styles.cardLabelEmpty,
                ]}
              >
                Customs Release Clearance
              </Text>
              <Text style={styles.cardMicrocopy}>
                {uploadedFiles.clearance
                  ? `${uploadedFiles.clearance.name} (${uploadedFiles.clearance.size})`
                  : "Form C21 or Form C32 A/B required."}
              </Text>
            </View>
            <ChevronRight size={18} color={uploadedFiles.clearance ? "#10B981" : "#D1D5DB"} />
          </TouchableOpacity>
        </View>

        {/* Port metadata card for context */}
        <View style={styles.metadataInfoCard}>
          <Text style={styles.metadataTitle}>Import Cargo Context</Text>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Pickup Point:</Text>
            <Text style={styles.metadataValue}>{pickup}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Cargo Description:</Text>
            <Text style={styles.metadataValue}>{cargoType === "general" ? "General cargo" : cargoType}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Expected Weight:</Text>
            <Text style={styles.metadataValue}>{weight} kg</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Submission Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={handleFinalizeVerification}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Complete Import Verification</Text>
        </TouchableOpacity>
      </View>

      {/* Simulated Document Picker Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPickerOpen}
        onRequestClose={() => setIsPickerOpen(false)}
      >
        <View style={styles.pickerOverlay}>
          <TouchableOpacity
            style={styles.pickerBackdrop}
            activeOpacity={1}
            onPress={() => setIsPickerOpen(false)}
          />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Simulated Document Vault Picker</Text>
              <TouchableOpacity onPress={() => setIsPickerOpen(false)}>
                <X size={22} color="#111827" />
              </TouchableOpacity>
            </View>
            <Text style={styles.pickerSubtitle}>
              Select a mock file to simulate a document upload (Form C21, Bill of Lading, etc.):
            </Text>

            <View style={styles.pickerOptionsList}>
              {getMockOptions().map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.pickerOptionCard}
                  onPress={() => handleSelectMockFile(opt.name, opt.size)}
                  activeOpacity={0.75}
                >
                  <File size={22} color="#0F3D26" />
                  <View style={styles.pickerOptionInfo}>
                    <Text style={styles.pickerOptionName}>{opt.name}</Text>
                    <Text style={styles.pickerOptionSize}>{opt.size}</Text>
                  </View>
                  <CheckCircle size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.pickerNotice}>
              In production, this target integrates with react-native-document-picker for file system attachment.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 120,
  },
  secureBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  secureBannerTextContainer: {
    flex: 1,
  },
  secureBannerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  secureBannerSub: {
    fontSize: 11,
    color: "#0F3D26",
    opacity: 0.8,
    lineHeight: 16,
    marginTop: 2,
  },
  inputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 2,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: "#111827",
  },
  uploadCardsSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  uploadCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 16,
    gap: 16,
    borderWidth: 2,
  },
  uploadCardEmpty: {
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
  },
  uploadCardCompleted: {
    borderStyle: "solid",
    backgroundColor: "rgba(16, 185, 129, 0.04)",
    borderColor: "#10B981",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperEmpty: {
    backgroundColor: "#F3F4F6",
  },
  iconWrapperCompleted: {
    backgroundColor: "#10B981",
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: "bold",
  },
  cardLabelEmpty: {
    color: "#1F2937",
  },
  cardLabelCompleted: {
    color: "#10B981",
  },
  cardMicrocopy: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  metadataInfoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metadataLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  metadataValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  submitButton: {
    height: 52,
    backgroundColor: "#0F3D26",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.65,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  pickerSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  pickerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 18,
  },
  pickerOptionsList: {
    gap: 12,
    marginBottom: 20,
  },
  pickerOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  pickerOptionInfo: {
    flex: 1,
    gap: 2,
  },
  pickerOptionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  pickerOptionSize: {
    fontSize: 11,
    color: "#6B7280",
  },
  pickerNotice: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    fontStyle: "italic",
  },
});
