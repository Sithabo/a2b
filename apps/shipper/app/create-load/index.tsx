import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Anchor,
  ChevronRight,
  ShieldAlert,
} from "lucide-react-native";
import { useShipmentStore, LocationData } from "@/store/useShipmentStore";
import { LocationSearchModal } from "@/components/LocationSearchModal";
import { LocationPicker } from "@/components/LocationPicker";
import { colors, palette, ScreenHeader } from "@a2b/ui";

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
      if (location.is_port) {
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
        <Text style={styles.sectionTitle}>Specify Route Details</Text>
        <Text style={styles.sectionSubtitle}>
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
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
        <TouchableOpacity
          style={[styles.nextButton, !isFormComplete && styles.nextButtonDisabled]}
          onPress={handleProceedToCargo}
          disabled={!isFormComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>NEXT: CARGO DETAILS</Text>
          <ChevronRight size={18} color={palette.white} />
        </TouchableOpacity>
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
              <Anchor size={30} color={palette.gold[600]} />
            </View>
            
            <Text style={styles.modalTitle}>⚓ Port Pickup Verified</Text>
            
            <Text style={styles.modalText}>
              This shipment originates from a customs-controlled zone. A2B will require valid clearing documentation (Form C21/Bill of Lading) on Step 2 to bypass port gates seamlessly.
            </Text>
            
            <View style={styles.warningBox}>
              <ShieldAlert size={18} color={palette.amber[700]} />
              <Text style={styles.warningBoxText}>
                Failure to provide valid paperwork halts driver clearance at port checkpoints.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCTAButton}
              activeOpacity={0.8}
              onPress={() => {
                setShowPortVerification(false);
                // Prompt user to complete flow
              }}
            >
              <Text style={styles.modalCTAButtonText}>Proceed to Cargo Details</Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[200],
    backgroundColor: palette.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.gray[100],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.gray[200],
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: palette.gray[500],
    marginTop: 2,
  },
  cancelText: {
    fontSize: 14,
    color: palette.red[500],
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: palette.gray[500],
    lineHeight: 18,
  },
  locationPickerContainer: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.gray[200],
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  nextButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: palette.gray[400],
    opacity: 0.5,
  },
  nextButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  verificationOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  verificationBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  verificationContainer: {
    width: Dimensions.get("window").width * 0.88,
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 16,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: palette.gray[100],
  },
  modalHeaderIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.amber[50],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.amber[100],
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: palette.gray[900],
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    color: palette.gray[600],
    lineHeight: 20,
    textAlign: "center",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.amber[100],
    borderWidth: 1,
    borderColor: palette.amber[200],
    borderRadius: 8,
    padding: 12,
    gap: 10,
    width: "100%",
  },
  warningBoxText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    color: palette.amber[700],
    lineHeight: 16,
  },
  modalCTAButton: {
    width: "100%",
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  modalCTAButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
