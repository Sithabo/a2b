import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Anchor,
  ChevronRight,
  ShieldAlert,
} from "lucide-react-native";
import type { LocationData } from "@a2b/core";
import { useShipmentStore } from "@/store/useShipmentStore";
import { LocationSearchModal } from "@/components/LocationSearchModal";
import { LocationPicker } from "@/components/LocationPicker";
import {
  Button,
  ScreenHeader,
  Text,
  colors,
  elevation,
  layout,
  radius,
  spacing,
} from "@a2b/ui";

export default function RouteSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pickupLocation = useShipmentStore((state) => state.pickupLocation);
  const dropoffLocation = useShipmentStore((state) => state.dropoffLocation);
  const isImportFlow = useShipmentStore((state) => state.isImportFlow);
  const setPickupLocation = useShipmentStore((state) => state.setPickupLocation);
  const setDropoffLocation = useShipmentStore((state) => state.setDropoffLocation);
  const setCurrentStep = useShipmentStore((state) => state.setCurrentStep);
  const resetRouteState = useShipmentStore((state) => state.resetRouteState);

  const [activeModalType, setActiveModalType] = useState<"pickup" | "dropoff" | null>(null);
  const [showPortVerification, setShowPortVerification] = useState(false);

  // Sync wizard steps on load
  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleSelectLocation = (location: LocationData) => {
    if (activeModalType === "pickup") {
      setPickupLocation(location);
      setActiveModalType(null);

      // Trigger geofence interstitial overlay if it's a port node
      if (location.isPort) {
        setShowPortVerification(true);
      }
    } else if (activeModalType === "dropoff") {
      setDropoffLocation(location);
      setActiveModalType(null);
    }
  };

  const handleCancelAndBack = () => {
    resetRouteState();
    router.back();
  };

  const handleProceedToCargo = () => {
    setCurrentStep(2);
    router.push("/create-load/cargo-details");
  };

  const isFormComplete = pickupLocation !== null && dropoffLocation !== null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Post a Load"
        subtitle={isImportFlow ? "Step 1 of 3: Route Selection" : "Step 1 of 2: Route Selection"}
        onBackPress={handleCancelAndBack}
        onCancelPress={handleCancelAndBack}
      />

      {/* Main Content Area */}
      <View style={styles.content}>
        <Text variant="h1" tone="primary">Specify Route Details</Text>
        <Text variant="bodySm" tone="muted">
          Select your cargo source and final delivery point. Importing wharves trigger customs validations automatically.
        </Text>

        {/* Locations Routing Component */}
        <LocationPicker
          style={styles.locationPickerContainer}
          startLocation={pickupLocation?.name || ""}
          endLocation={dropoffLocation?.name || ""}
          onPressStart={() => setActiveModalType("pickup")}
          onPressEnd={() => setActiveModalType("dropoff")}
          onSwap={() => {
            const temp = pickupLocation;
            setPickupLocation(dropoffLocation);
            setDropoffLocation(temp);
          }}
        />
      </View>

      {/* Sticky Bottom Actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.lg }]}>
        <Button
          title="NEXT: CARGO DETAILS"
          onPress={handleProceedToCargo}
          disabled={!isFormComplete}
          icon={ChevronRight}
          iconPosition="right"
        />
      </View>

      {/* Full Screen Autocomplete Modals */}
      <LocationSearchModal
        isVisible={activeModalType !== null}
        onClose={() => setActiveModalType(null)}
        onSelectLocation={handleSelectLocation}
        title={activeModalType === "pickup" ? "Select Start Location" : "Select Delivery Location"}
        placeholder={
          activeModalType === "pickup"
            ? "Search ports, terminals or addresses..."
            : "Search delivery addresses..."
        }
      />

      {/* Focused Interstitial Port Pickup Verification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPortVerification}
        onRequestClose={() => setShowPortVerification(false)}
      >
        <View style={styles.verificationOverlay}>
          <View style={styles.verificationBackdrop} />
          
          <View style={styles.verificationContainer}>
            <View style={styles.modalHeaderIconBg}>
              <Anchor size={30} color={colors.accent} />
            </View>
            
            <Text variant="h2" align="center">⚓ Port Pickup Verified</Text>
            
            <Text variant="bodySm" tone="secondary" align="center">
              This shipment originates from a customs-controlled zone. A2B will require valid clearing documentation (Form C21/Bill of Lading) on Step 2 to bypass port gates seamlessly.
            </Text>
            
            <View style={styles.warningBox}>
              <ShieldAlert size={18} color={colors.warning} />
              <Text variant="caption" color={colors.warning} style={styles.warningBoxText}>
                Failure to provide valid paperwork halts driver clearance at port checkpoints.
              </Text>
            </View>

            <Button
              title="Proceed to Cargo Details"
              onPress={() => {
                setShowPortVerification(false);
                // Prompt user to complete flow
              }}
              fullWidth
              style={styles.modalCTAButton}
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
  content: {
    flex: 1,
    padding: layout.gutter,
    gap: spacing.lg,
  },
  locationPickerContainer: {
    marginTop: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  verificationOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  verificationBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  verificationContainer: {
    width: Dimensions.get("window").width * 0.88,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing["2xl"],
    alignItems: "center",
    gap: spacing.lg,
    ...elevation.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeaderIconBg: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.sm,
    width: "100%",
  },
  warningBoxText: {
    flex: 1,
  },
  modalCTAButton: {
    marginTop: spacing.sm,
  },
});
