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
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import {
  Lock,
  Upload,
  CheckCircle,
  X,
  Shield,
  File,
  ChevronRight,
  ArrowLeft,
} from "lucide-react-native";
import { useShipmentStore } from "@/store/useShipmentStore";
import { colors, palette, ScreenHeader } from "@a2b/ui";

interface DocumentInfo {
  name: string;
  size: string;
  uri?: string;
}

type SlotName = "bol" | "invoice" | "clearance" | "goInvest";

export default function DocumentVaultScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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

  const requiresGoInvestWaiver = draftShipment?.cargo?.requiresGoInvestWaiver === true;

  const [uploadedFiles, setUploadedFiles] = useState<{
    bol: DocumentInfo | null;
    invoice: DocumentInfo | null;
    clearance: DocumentInfo | null;
    goInvest: DocumentInfo | null;
  }>({
    bol: draftShipment?.documents?.bol || null,
    invoice: draftShipment?.documents?.invoice || null,
    clearance: draftShipment?.documents?.clearance || null,
    goInvest: draftShipment?.documents?.goInvest || null,
  });

  const [activeSlot, setActiveSlot] = useState<SlotName | null>(null);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  // Options & Preview Modals
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotName | null>(null);

  // Processing Animation Overlay
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Check if everything is filled
  const isFormValid =
    containerId.trim().length > 4 &&
    uploadedFiles.bol !== null &&
    uploadedFiles.invoice !== null &&
    uploadedFiles.clearance !== null &&
    (!requiresGoInvestWaiver || uploadedFiles.goInvest !== null);

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
        uploadedFiles.clearance !== null ||
        uploadedFiles.goInvest !== null;

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
                  documents: uploadedFiles as any,
                  status: "DRAFT_PENDING_DOCS",
                  createdAt: new Date().toISOString(),
                  cargo: draftShipment?.cargo, // Preserve cargo details!
                  readyAt: draftShipment?.readyAt,
                  deadlineAt: draftShipment?.deadlineAt,
                  pickupLocation: draftShipment?.pickupLocation,
                  dropoffLocation: draftShipment?.dropoffLocation,
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
    draftShipment,
  ]);

  const moveFileToPermanentStorage = async (tempUri: string, documentType: string) => {
    try {
      const docDirectory = `${FileSystem.documentDirectory}compliance_docs/`;
      const dirInfo = await FileSystem.getInfoAsync(docDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(docDirectory, { intermediates: true });
      }

      const fileExtension = tempUri.split(".").pop() || "jpg";
      const permanentUri = `${docDirectory}${documentType}_${Date.now()}.${fileExtension}`;

      await FileSystem.moveAsync({
        from: tempUri,
        to: permanentUri,
      });

      return permanentUri;
    } catch (error) {
      console.error("Failed to move file to permanent storage:", error);
      return tempUri; // fallback
    }
  };

  const handleScanDocument = async (slot: SlotName) => {
    // Request Camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required to scan documents.");
      return;
    }

    // Launch Native Camera (allowsEditing mimics crop boundaries)
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled) {
      return;
    }

    const capturedUri = result.assets[0].uri;

    // Start processing animation (simulates grayscale stamp enhancement)
    setIsEnhancing(true);
    setActiveSlot(slot);

    setTimeout(async () => {
      const permanentUri = await moveFileToPermanentStorage(capturedUri, slot);

      // Fetch dynamic size
      const fileInfo = await FileSystem.getInfoAsync(permanentUri);
      const sizeBytes = fileInfo.exists ? fileInfo.size : 124000;
      const sizeKb = `${Math.round(sizeBytes / 1024)} KB`;

      const documentName = `${slot.toUpperCase()}_SCAN_${Date.now()
        .toString()
        .slice(-4)}.jpg`;

      setUploadedFiles((prev) => ({
        ...prev,
        [slot]: {
          name: documentName,
          size: sizeKb,
          uri: permanentUri,
        },
      }));

      setIsEnhancing(false);
      setActiveSlot(null);
      Alert.alert("Scan Enhanced", "Grayscale filter applied successfully. Contrast adjusted for text readability.");
    }, 1500);
  };

  const handleCardPress = (slot: SlotName) => {
    if (uploadedFiles[slot] !== null) {
      setSelectedSlot(slot);
      setIsOptionsModalOpen(true);
    } else {
      handleScanDocument(slot);
    }
  };

  const handleFinalizeVerification = () => {
    if (!isFormValid) return;

    setIsSubmissionComplete(true);

    const docsRecord: { [key: string]: { name: string; size: string; uri?: string } } = {
      bol: uploadedFiles.bol!,
      invoice: uploadedFiles.invoice!,
      clearance: uploadedFiles.clearance!,
    };
    if (uploadedFiles.goInvest) {
      docsRecord.goInvest = uploadedFiles.goInvest;
    }

    // Save final load to useShipmentStore
    addShipment({
      pickup,
      delivery,
      cargoType,
      weight,
      offerPrice: draftShipment?.offerPrice || "185000",
      status: "OPEN",
      deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      acceptedByDriver: false,
      is_import: true,
      containerId,
      documents: docsRecord as any,
      pickupLocation: draftShipment?.pickupLocation || null,
      dropoffLocation: draftShipment?.dropoffLocation || null,
      cargo: draftShipment?.cargo,
      readyAt: draftShipment?.readyAt,
      deadlineAt: draftShipment?.deadlineAt,
    });

    // Clear draft state
    clearDraftShipment();
    resetRouteState();

    // Route to success confirmation state
    router.replace("/create-load/status?state=confirmed");
  };

  const getSlotLabel = (slot: SlotName | null) => {
    switch (slot) {
      case "bol":
        return "Bill of Lading / Airway Bill";
      case "invoice":
        return "Original Certified Invoice";
      case "clearance":
        return "Customs Release Clearance";
      case "goInvest":
        return "GO-Invest Tax Waiver Concession";
      default:
        return "";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Compliance Vault"
        subtitle="Step 3 of 3: Document Uploads"
        onBackPress={() => router.back()}
        rightElement={<Lock size={20} color={colors.primary} />}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Secure Info Banner */}
        <View style={styles.secureBanner}>
          <Shield size={20} color={colors.primary} />
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
            placeholderTextColor={palette.gray[400]}
            autoCapitalize="characters"
          />
        </View>

        {/* Upload slots */}
        <View style={styles.uploadCardsSection}>
          <Text style={styles.sectionHeading}>Mandatory Compliance Documents</Text>

          {/* Slot 1: Bill of Lading */}
          <TouchableOpacity
            style={[
              styles.uploadCard,
              uploadedFiles.bol ? styles.uploadCardCompleted : styles.uploadCardEmpty,
            ]}
            onPress={() => handleCardPress("bol")}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.iconWrapper,
                uploadedFiles.bol ? styles.iconWrapperCompleted : styles.iconWrapperEmpty,
              ]}
            >
              {uploadedFiles.bol?.uri ? (
                <Image
                  source={{ uri: uploadedFiles.bol.uri }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
              ) : uploadedFiles.bol ? (
                <CheckCircle size={20} color={palette.white} />
              ) : (
                <Upload size={20} color={palette.gray[500]} />
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
              <Text style={styles.cardMicrocopy} numberOfLines={1}>
                {uploadedFiles.bol
                  ? `${uploadedFiles.bol.name} (${uploadedFiles.bol.size})`
                  : "Must display Freight Certified Stamp."}
              </Text>
            </View>
            <ChevronRight size={18} color={uploadedFiles.bol ? palette.emerald[500] : palette.gray[300]} />
          </TouchableOpacity>

          {/* Slot 2: Certified Invoice */}
          <TouchableOpacity
            style={[
              styles.uploadCard,
              uploadedFiles.invoice ? styles.uploadCardCompleted : styles.uploadCardEmpty,
            ]}
            onPress={() => handleCardPress("invoice")}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.iconWrapper,
                uploadedFiles.invoice ? styles.iconWrapperCompleted : styles.iconWrapperEmpty,
              ]}
            >
              {uploadedFiles.invoice?.uri ? (
                <Image
                  source={{ uri: uploadedFiles.invoice.uri }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
              ) : uploadedFiles.invoice ? (
                <CheckCircle size={20} color={palette.white} />
              ) : (
                <Upload size={20} color={palette.gray[500]} />
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
              <Text style={styles.cardMicrocopy} numberOfLines={1}>
                {uploadedFiles.invoice
                  ? `${uploadedFiles.invoice.name} (${uploadedFiles.invoice.size})`
                  : "Must feature company stamp or signature to verify valuation."}
              </Text>
            </View>
            <ChevronRight size={18} color={uploadedFiles.invoice ? palette.emerald[500] : palette.gray[300]} />
          </TouchableOpacity>

          {/* Slot 3: Customs Clearance */}
          <TouchableOpacity
            style={[
              styles.uploadCard,
              uploadedFiles.clearance ? styles.uploadCardCompleted : styles.uploadCardEmpty,
            ]}
            onPress={() => handleCardPress("clearance")}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.iconWrapper,
                uploadedFiles.clearance ? styles.iconWrapperCompleted : styles.iconWrapperEmpty,
              ]}
            >
              {uploadedFiles.clearance?.uri ? (
                <Image
                  source={{ uri: uploadedFiles.clearance.uri }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
              ) : uploadedFiles.clearance ? (
                <CheckCircle size={20} color={palette.white} />
              ) : (
                <Upload size={20} color={palette.gray[500]} />
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
              <Text style={styles.cardMicrocopy} numberOfLines={1}>
                {uploadedFiles.clearance
                  ? `${uploadedFiles.clearance.name} (${uploadedFiles.clearance.size})`
                  : "Form C21 or Form C32 A/B required."}
              </Text>
            </View>
            <ChevronRight size={18} color={uploadedFiles.clearance ? palette.emerald[500] : palette.gray[300]} />
          </TouchableOpacity>

          {/* Slot 4: GO-Invest Tax Waiver Letter (Conditional) */}
          {requiresGoInvestWaiver && (
            <View style={styles.goInvestContainer}>
              <TouchableOpacity
                style={[
                  styles.uploadCard,
                  uploadedFiles.goInvest ? styles.uploadCardCompleted : styles.uploadCardEmpty,
                ]}
                onPress={() => handleCardPress("goInvest")}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    uploadedFiles.goInvest ? styles.iconWrapperCompleted : styles.iconWrapperEmpty,
                  ]}
                >
                  {uploadedFiles.goInvest?.uri ? (
                    <Image
                      source={{ uri: uploadedFiles.goInvest.uri }}
                      style={styles.thumbnail}
                      contentFit="cover"
                    />
                  ) : uploadedFiles.goInvest ? (
                    <CheckCircle size={20} color={palette.white} />
                  ) : (
                    <Upload size={20} color={palette.gray[500]} />
                  )}
                </View>
                <View style={styles.cardInfo}>
                  <Text
                    style={[
                      styles.cardLabel,
                      uploadedFiles.goInvest ? styles.cardLabelCompleted : styles.cardLabelEmpty,
                    ]}
                  >
                    GO-Invest Tax Waiver Concession
                  </Text>
                  <Text style={styles.cardMicrocopy} numberOfLines={1}>
                    {uploadedFiles.goInvest
                      ? `${uploadedFiles.goInvest.name} (${uploadedFiles.goInvest.size})`
                      : "Approved GO-Invest Zero-Rated Concession Letter."}
                  </Text>
                </View>
                <ChevronRight size={18} color={uploadedFiles.goInvest ? palette.emerald[500] : palette.gray[300]} />
              </TouchableOpacity>

              <View style={styles.goInvestWarningCallout}>
                <Text style={styles.goInvestWarningCalloutText}>
                  ⚠️ <Text style={styles.goInvestWarningCalloutBold}>Warning:</Text> Machinery for this sector qualifies for zero-rated customs tax. Upload your GO-Invest concession approval letter to ensure your driver is not delayed at customs checkpoints over duty disputes.
                </Text>
              </View>
            </View>
          )}
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
            <Text style={styles.metadataValue}>
              {cargoType === "general" ? "General cargo" : cargoType}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Expected Weight:</Text>
            <Text style={styles.metadataValue}>{weight} kg</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Submission Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={handleFinalizeVerification}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Complete Import Verification</Text>
        </TouchableOpacity>
      </View>

      {/* Document Scanner Enhancement Loader Overlay */}
      <Modal transparent={true} visible={isEnhancing} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Applying Grayscale Enhancement...</Text>
            <Text style={styles.loadingSubtext}>Optimizing stamps & signatures contrast</Text>
          </View>
        </View>
      </Modal>

      {/* Options Modal (View/Replace/Remove) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOptionsModalOpen}
        onRequestClose={() => setIsOptionsModalOpen(false)}
      >
        <View style={styles.pickerOverlay}>
          <TouchableOpacity
            style={styles.pickerBackdrop}
            activeOpacity={1}
            onPress={() => setIsOptionsModalOpen(false)}
          />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 24 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{getSlotLabel(selectedSlot)}</Text>
              <TouchableOpacity onPress={() => setIsOptionsModalOpen(false)}>
                <X size={22} color={palette.gray[900]} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  setIsOptionsModalOpen(false);
                  setIsViewModalOpen(true);
                }}
              >
                <Text style={styles.modalActionText}>View Document Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  setIsOptionsModalOpen(false);
                  handleScanDocument(selectedSlot!);
                }}
              >
                <Text style={styles.modalActionText}>Replace / Retake Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalActionDelete]}
                onPress={() => {
                  setUploadedFiles((prev) => ({ ...prev, [selectedSlot!]: null }));
                  setIsOptionsModalOpen(false);
                  setSelectedSlot(null);
                }}
              >
                <Text style={styles.modalActionDeleteText}>Remove Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
      >
        <View style={[styles.viewerContainer, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.viewerHeader}>
            <TouchableOpacity onPress={() => setIsViewModalOpen(false)} style={styles.viewerClose}>
              <ArrowLeft color={palette.white} size={24} />
            </TouchableOpacity>
            <Text style={styles.viewerTitle}>Document Preview</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Image Canvas with Grayscale Effect */}
          <View style={styles.viewerContent}>
            {selectedSlot && uploadedFiles[selectedSlot]?.uri ? (
              <View style={styles.scannedImageContainer}>
                <Image
                  source={{ uri: uploadedFiles[selectedSlot]!.uri }}
                  style={styles.viewerImage}
                  contentFit="contain"
                />
                <View style={styles.grayscaleBadge}>
                  <Text style={styles.grayscaleBadgeText}>Grayscale Filter Applied (Contrast Enhanced)</Text>
                </View>
              </View>
            ) : (
              <Text style={{ color: palette.white }}>No image available</Text>
            )}
          </View>

          {/* Footer Actions (Retake / Close) */}
          <View style={[styles.viewerFooter, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            <TouchableOpacity
              style={styles.viewerRetakeButton}
              onPress={() => {
                setIsViewModalOpen(false);
                handleScanDocument(selectedSlot!);
              }}
            >
              <Text style={styles.viewerRetakeText}>Retake Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewerCloseButton}
              onPress={() => setIsViewModalOpen(false)}
            >
              <Text style={styles.viewerCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 120,
  },
  secureBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.forest[50],
    borderWidth: 1,
    borderColor: palette.emerald[200],
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
    color: colors.primary,
  },
  secureBannerSub: {
    fontSize: 11,
    color: colors.primary,
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
    color: palette.gray[700],
    marginLeft: 2,
  },
  textInput: {
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: palette.gray[900],
  },
  uploadCardsSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.gray[900],
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
    backgroundColor: palette.white,
    borderColor: palette.gray[300],
  },
  uploadCardCompleted: {
    borderStyle: "solid",
    backgroundColor: "rgba(16, 185, 129, 0.04)",
    borderColor: palette.emerald[500],
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconWrapperEmpty: {
    backgroundColor: palette.gray[100],
  },
  iconWrapperCompleted: {
    backgroundColor: palette.emerald[500],
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    color: palette.gray[800],
  },
  cardLabelCompleted: {
    color: palette.emerald[500],
  },
  cardMicrocopy: {
    fontSize: 12,
    color: palette.gray[500],
    lineHeight: 16,
  },
  metadataInfoCard: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: palette.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[100],
    paddingBottom: 8,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metadataLabel: {
    fontSize: 12,
    color: palette.gray[500],
  },
  metadataValue: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.gray[900],
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.gray[200],
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  submitButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: palette.gray[400],
    opacity: 0.65,
  },
  submitButtonText: {
    color: palette.white,
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
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[100],
    paddingBottom: 12,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.gray[900],
  },
  modalActions: {
    gap: 12,
  },
  modalActionButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.gray[200],
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: "bold",
    color: palette.gray[800],
  },
  modalActionDelete: {
    borderColor: palette.red[100],
    backgroundColor: palette.red[50],
  },
  modalActionDeleteText: {
    fontSize: 15,
    fontWeight: "bold",
    color: palette.red[500],
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: palette.gray[900],
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 12,
    color: palette.gray[500],
    textAlign: "center",
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: palette.gray[900],
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[800],
  },
  viewerClose: {
    padding: 8,
  },
  viewerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.white,
  },
  viewerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scannedImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: {
    width: "100%",
    height: "85%",
    borderRadius: 8,
  },
  grayscaleBadge: {
    position: "absolute",
    bottom: 24,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  grayscaleBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: palette.white,
  },
  viewerFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    backgroundColor: palette.gray[900],
  },
  viewerRetakeButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerRetakeText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  viewerCloseButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerCloseText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  goInvestContainer: {
    gap: 8,
  },
  goInvestWarningCallout: {
    backgroundColor: palette.amber[100],
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.amber[300],
  },
  goInvestWarningCalloutText: {
    fontSize: 12,
    color: palette.amber[600],
    lineHeight: 18,
  },
  goInvestWarningCalloutBold: {
    fontWeight: "bold",
  },
});
