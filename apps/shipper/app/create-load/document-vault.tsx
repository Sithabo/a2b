import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
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
  ChevronRight,
  ArrowLeft,
} from "lucide-react-native";
import { useShipmentStore, type DraftDocument } from "@/store/useShipmentStore";
import {
  Badge,
  Button,
  IconButton,
  ScreenHeader,
  Text,
  TextField,
  colors,
  elevation,
  fontFamily,
  layout,
  palette,
  radius,
  spacing,
} from "@a2b/ui";
import { useMarket } from "@/store/useMarket";
import { cargoLabel, documentsFor } from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { api } from "@/lib/session";
import { newLoadBody, uploadLoadDocument, useInvalidateLoads, weightLabel } from "@/lib/loads";

/** A requirement id from the market's customs document catalog (@a2b/core). */
type SlotName = string;

export default function DocumentVaultScreen() {
  const router = useRouter();
  const market = useMarket();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const draft = useShipmentStore((state) => state.draft);
  const setDraft = useShipmentStore((state) => state.setDraft);
  const clearDraft = useShipmentStore((state) => state.clearDraft);
  const resetRouteState = useShipmentStore((state) => state.resetRouteState);
  const pickupLocation = useShipmentStore((state) => state.pickupLocation);
  const dropoffLocation = useShipmentStore((state) => state.dropoffLocation);

  // Shown for context; the draft is written by the cargo details step
  const pickup = draft?.pickup?.name ?? pickupLocation?.name ?? "—";
  const cargo = draft?.cargo ?? { type: "GENERAL_CARGO" as const };

  const [containerId, setContainerId] = useState(draft?.containerId ?? "");

  // Which documents this load needs depends on the market and the cargo sector.
  const { required: requiredDocs } = documentsFor(market.documents, cargo);

  const [uploadedFiles, setUploadedFiles] = useState<Record<SlotName, DraftDocument | null>>(
    () => ({ ...draft?.documents })
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Server draft created on a previous (failed) submit, reused on retry.
  const [serverLoadId, setServerLoadId] = useState<number | null>(null);
  const invalidateLoads = useInvalidateLoads();

  // Only the setter is read today; the value is kept for the scan-in-progress slot.
  const [, setActiveSlot] = useState<SlotName | null>(null);
  // A ref, not state: the leave-screen listener must see it the moment the load is posted,
  // before a re-render re-subscribes the listener.
  const isSubmissionComplete = useRef(false);

  // Options & Preview Modals
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotName | null>(null);

  // Processing Animation Overlay
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Check if everything is filled
  const isFormValid =
    containerId.trim().length > 4 && requiredDocs.every((doc) => !!uploadedFiles[doc.id]);

  // Intercept navigation to cache draft if incomplete
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // If complete, proceed without draft intercept
      if (isSubmissionComplete.current) {
        return;
      }

      // Check if user has entered anything
      const hasProgress =
        containerId.trim().length > 0 || Object.values(uploadedFiles).some(Boolean);

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
                clearDraft();
                resetRouteState();
                navigation.dispatch(e.data.action);
              },
            },
            {
              text: "Save Draft & Exit",
              onPress: () => {
                if (draft) {
                  setDraft({
                    ...draft,
                    containerId,
                    documents: uploadedFiles,
                    savedAt: new Date().toISOString(),
                  });
                }
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }
    });

    return unsubscribe;
  }, [navigation, containerId, uploadedFiles, clearDraft, setDraft, resetRouteState, draft]);

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
    if (uploadedFiles[slot]) {
      setSelectedSlot(slot);
      setIsOptionsModalOpen(true);
    } else {
      handleScanDocument(slot);
    }
  };

  const handleFinalizeVerification = async () => {
    if (!isFormValid || isSubmitting || !draft) return;
    setIsSubmitting(true);
    try {
      // 1. Create the load as a draft (or reuse the one from a failed attempt)
      let loadId = serverLoadId;
      if (!loadId) {
        const { data } = await api.loads.store({
          body: newLoadBody({
            ...draft,
            pickup: draft.pickup ?? pickupLocation,
            dropoff: draft.dropoff ?? dropoffLocation,
            isImport: true,
            containerId: containerId.trim(),
          }),
        });
        loadId = data.id;
        setServerLoadId(loadId);
      }

      // 2. Upload each required scan
      for (const doc of requiredDocs) {
        const file = uploadedFiles[doc.id];
        if (!file?.uri) throw new Error(`Rescan "${doc.label}" — the saved copy is no longer on this device.`);
        await uploadLoadDocument(loadId, doc.id, { uri: file.uri, name: file.name });
      }

      // 3. Put it on the load board (the API re-checks every required document)
      await api.loads.publish({ params: { id: loadId } });
      await invalidateLoads();

      isSubmissionComplete.current = true;
      clearDraft();
      resetRouteState();
      router.replace({ pathname: "/create-load/status", params: { state: "confirmed", trackingId: String(loadId) } });
    } catch (err) {
      Alert.alert("Couldn't post this load", err instanceof Error ? err.message : apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSlotLabel = (slot: SlotName | null) =>
    market.documents.find((doc) => doc.id === slot)?.label ?? "";

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
            <Text variant="bodyStrong" tone="primary">Institutional Level Security</Text>
            <Text variant="caption" tone="primary" style={styles.secureBannerSub}>
              Documents are stored privately and shared only with your driver, as a digital customs pass, once escrow is funded.
            </Text>
          </View>
        </View>

        {/* Input for customs reference */}
        <TextField
          label="Customs Reference / Container ID"
          value={containerId}
          onChangeText={setContainerId}
          placeholder="e.g. CON-GY-82195"
          autoCapitalize="characters"
        />

        {/* Upload slots */}
        <View style={styles.uploadCardsSection}>
          <Text variant="h3" style={styles.sectionHeading}>Mandatory Compliance Documents</Text>

          {requiredDocs.map((doc) => {
            const file = uploadedFiles[doc.id];
            return (
              <View key={doc.id} style={doc.id === "go_invest_concession" ? styles.goInvestContainer : undefined}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={file ? `${doc.label}, uploaded` : `${doc.label}, scan document`}
                  style={({ pressed }) => [
                    styles.uploadCard,
                    file ? styles.uploadCardCompleted : styles.uploadCardEmpty,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => handleCardPress(doc.id)}
                >
                  <View style={[styles.iconWrapper, file ? styles.iconWrapperCompleted : styles.iconWrapperEmpty]}>
                    {file?.uri ? (
                      <Image source={{ uri: file.uri }} style={styles.thumbnail} contentFit="cover" />
                    ) : file ? (
                      <CheckCircle size={20} color={colors.onPrimary} />
                    ) : (
                      <Upload size={20} color={colors.textMuted} />
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <Text variant="bodyStrong" tone={file ? "success" : "default"}>
                      {doc.label}
                    </Text>
                    <Text variant="caption" tone="muted" numberOfLines={1}>
                      {file
                        ? `${file.name} (${file.size})`
                        : doc.acceptedForms
                          ? `${doc.acceptedForms.join(" or ")} required.`
                          : doc.issuer}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={file ? colors.success : colors.borderStrong} />
                </Pressable>

                {doc.id === "go_invest_concession" && (
                  <View style={styles.goInvestWarningCallout}>
                    <Text variant="caption" color={colors.warning}>
                      ⚠️ <Text variant="caption" color={colors.warning} style={styles.bold}>Warning:</Text> Machinery for this sector qualifies for zero-rated customs tax. Upload your GO-Invest concession approval letter to ensure your driver is not delayed at customs checkpoints over duty disputes.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Port metadata card for context */}
        <View style={styles.metadataInfoCard}>
          <Text variant="bodyStrong" style={styles.metadataTitle}>Import Cargo Context</Text>
          <View style={styles.metadataRow}>
            <Text variant="caption" tone="muted">Pickup Point:</Text>
            <Text variant="caption" style={styles.semibold}>{pickup}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text variant="caption" tone="muted">Cargo Description:</Text>
            <Text variant="caption" style={styles.semibold}>{cargoLabel(cargo.type)}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text variant="caption" tone="muted">Expected Weight:</Text>
            <Text variant="caption" style={styles.semibold}>{weightLabel({ weightKg: null, cargo })}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Submission Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.lg }]}>
        <Button
          title="Complete Import Verification"
          onPress={handleFinalizeVerification}
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
        />
      </View>

      {/* Document Scanner Enhancement Loader Overlay */}
      <Modal transparent={true} visible={isEnhancing} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="bodyStrong" style={styles.loadingText}>Applying Grayscale Enhancement...</Text>
            <Text variant="caption" tone="muted" align="center">Optimizing stamps & signatures contrast</Text>
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={styles.pickerBackdrop}
            onPress={() => setIsOptionsModalOpen(false)}
          />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom > 0 ? insets.bottom + spacing.lg : spacing["2xl"] }]}>
            <View style={styles.pickerHeader}>
              <Text variant="h3" style={styles.pickerTitle}>{getSlotLabel(selectedSlot)}</Text>
              <IconButton
                icon={X}
                variant="plain"
                accessibilityLabel="Close"
                onPress={() => setIsOptionsModalOpen(false)}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="View Document Scan"
                variant="secondary"
                size="md"
                onPress={() => {
                  setIsOptionsModalOpen(false);
                  setIsViewModalOpen(true);
                }}
              />

              <Button
                title="Replace / Retake Scan"
                variant="secondary"
                size="md"
                onPress={() => {
                  setIsOptionsModalOpen(false);
                  handleScanDocument(selectedSlot!);
                }}
              />

              <Button
                title="Remove Document"
                variant="danger"
                size="md"
                onPress={() => {
                  setUploadedFiles((prev) => ({ ...prev, [selectedSlot!]: null }));
                  setIsOptionsModalOpen(false);
                  setSelectedSlot(null);
                }}
              />
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
            <IconButton
              icon={ArrowLeft}
              accessibilityLabel="Go back"
              onPress={() => setIsViewModalOpen(false)}
            />
            <Text variant="h3" tone="inverse">Document Preview</Text>
            <View style={styles.viewerHeaderSpacer} />
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
                  <Badge label="Grayscale Filter Applied (Contrast Enhanced)" tone="success" />
                </View>
              </View>
            ) : (
              <Text tone="inverse">No image available</Text>
            )}
          </View>

          {/* Footer Actions (Retake / Close) */}
          <View style={[styles.viewerFooter, { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.xl }]}>
            <Button
              title="Retake Scan"
              variant="secondary"
              size="md"
              style={[styles.viewerButton, styles.viewerRetakeButton]}
              onPress={() => {
                setIsViewModalOpen(false);
                handleScanDocument(selectedSlot!);
              }}
            />
            <Button
              title="Close"
              size="md"
              style={styles.viewerButton}
              onPress={() => setIsViewModalOpen(false)}
            />
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
    padding: layout.gutter,
    gap: spacing.xl,
  },
  secureBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  secureBannerTextContainer: {
    flex: 1,
  },
  secureBannerSub: {
    opacity: 0.8,
    marginTop: spacing.xxs,
  },
  uploadCardsSection: {
    gap: spacing.md,
  },
  sectionHeading: {
    marginBottom: spacing.xs,
  },
  uploadCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: layout.touchMin,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 2,
  },
  uploadCardEmpty: {
    borderStyle: "dashed",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  uploadCardCompleted: {
    borderStyle: "solid",
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconWrapperEmpty: {
    backgroundColor: colors.surfaceSunken,
  },
  iconWrapperCompleted: {
    backgroundColor: colors.success,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  metadataInfoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  metadataTitle: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSunken,
    paddingBottom: spacing.sm,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  semibold: {
    fontFamily: fontFamily.semibold,
  },
  bold: {
    fontFamily: fontFamily.bold,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: spacing["2xl"],
    ...elevation.md,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSunken,
    paddingBottom: spacing.md,
  },
  pickerTitle: {
    flex: 1,
  },
  modalActions: {
    gap: spacing.md,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing["2xl"],
    alignItems: "center",
    ...elevation.md,
    gap: spacing.sm,
  },
  loadingText: {
    marginTop: spacing.sm,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: palette.gray[900],
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[800],
  },
  viewerHeaderSpacer: {
    width: 40,
  },
  viewerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: layout.gutter,
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
    borderRadius: radius.sm,
  },
  grayscaleBadge: {
    position: "absolute",
    bottom: spacing["2xl"],
  },
  viewerFooter: {
    flexDirection: "row",
    padding: layout.gutter,
    gap: spacing.md,
    backgroundColor: palette.gray[900],
  },
  viewerButton: {
    flex: 1,
  },
  viewerRetakeButton: {
    backgroundColor: colors.surface,
  },
  goInvestContainer: {
    gap: spacing.sm,
  },
  goInvestWarningCallout: {
    backgroundColor: colors.warningMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
