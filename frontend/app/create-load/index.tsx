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
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Anchor,
  ChevronRight,
  ShieldAlert,
} from "lucide-react-native";
import { useShipmentStore, LocationData } from "@/store/useShipmentStore";
import { LocationSearchModal } from "@/components/LocationSearchModal";
import { LocationPicker } from "@/components/LocationPicker";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function RouteSelectionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
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
    <View style={[styles.container, { backgroundColor: theme.whiteAsh }]}>
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
          <ChevronRight size={18} color="#FFFFFF" />
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
              <Anchor size={30} color="#D4A017" />
            </View>
            
            <Text style={styles.modalTitle}>⚓ Port Pickup Verified</Text>
            
            <Text style={styles.modalText}>
              This shipment originates from a customs-controlled zone. A2B will require valid clearing documentation (Form C21/Bill of Lading) on Step 2 to bypass port gates seamlessly.
            </Text>
            
            <View style={styles.warningBox}>
              <ShieldAlert size={18} color="#B45309" />
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
  cancelText: {
    fontSize: 14,
    color: "#EF4444",
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
    color: "#0F3D26",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  locationPickerContainer: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  nextButton: {
    height: 52,
    backgroundColor: "#0F3D26",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  modalHeaderIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    textAlign: "center",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 8,
    padding: 12,
    gap: 10,
    width: "100%",
  },
  warningBoxText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    color: "#B45309",
    lineHeight: 16,
  },
  modalCTAButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#0F3D26",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  modalCTAButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
