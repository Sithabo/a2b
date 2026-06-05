import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  MapPin,
  Package,
  Lock,
  Image as ImageIcon,
  Plus,
  Anchor,
  Map as MapIcon,
  ShieldAlert,
} from "lucide-react-native";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LocationPicker } from "@/components/LocationPicker";
import { LoadTypeSelector } from "@/components/LoadTypeSelector";
import { PackageForm, PackageData } from "@/components/PackageForm";
import { DateTimePickerSection } from "@/components/DateTimePickerSection";
import { OfferSlider } from "@/components/OfferSlider";
import { BottomSheet } from "@/components/BottomSheet";
import { OrderSummary } from "@/components/OrderSummary";
import { useShipmentStore } from "@/store/useShipmentStore";

export default function CreateLoadScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const addShipment = useShipmentStore((state) => state.addShipment);
  const [selectedType, setSelectedType] = useState("general");
  const [startLocation, setStartLocation] = useState("Houston, TX");
  const [endLocation, setEndLocation] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [packages, setPackages] = useState<PackageData[]>([
    { id: "1", code: "", weight: "250", length: "12", width: "8", height: "10" }
  ]);
  
  const [geoModalVisible, setGeoModalVisible] = useState(false);
  const [isMapFrozen, setIsMapFrozen] = useState(false);
  const [isImportShipment, setIsImportShipment] = useState(false);

  const handleStartLocationChange = (text: string) => {
    setStartLocation(text);
    const lower = text.toLowerCase();
    if (lower.includes("port") || lower.includes("wharves") || lower.includes("demerara")) {
      setIsMapFrozen(true);
      setGeoModalVisible(true);
    }
  };

  const loadTypes = [
    { id: "general", label: "General cargo", icon: Package },
    { id: "bulk", label: "Bulk cargo", icon: Lock },
    { id: "fragile", label: "Fragile cargo", icon: ImageIcon },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <PageHeader
        title="Post a Load"
        subtitle="Tell us what you need to ship"
        showBackButton
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Visual Map Mockup */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <MapIcon size={16} color="#0F3D26" />
            <Text style={styles.mapHeaderText}>Guyana Port Logistics Geofence Map</Text>
          </View>
          
          <View style={[styles.mapCanvas, isMapFrozen && styles.mapCanvasFrozen]}>
            {/* Water body / River */}
            <View style={styles.waterBody} />
            {/* Coastline */}
            <View style={styles.coastline} />
            {/* Roads */}
            <View style={styles.highwayRoute1} />
            <View style={styles.highwayRoute2} />

            {/* Georgetown Port Pin */}
            <TouchableOpacity 
              style={[styles.mapPin, { top: 35, left: 95 }]}
              disabled={isMapFrozen}
              onPress={() => {
                setStartLocation("Georgetown Wharves (Port Zone)");
                setIsMapFrozen(true);
                setGeoModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.pinDot, { backgroundColor: "#D4A017" }]}>
                <Anchor size={12} color="#FFFFFF" />
              </View>
              <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText}>⚓ Georgetown Wharves</Text>
              </View>
            </TouchableOpacity>

            {/* Demerara Terminals Pin */}
            <TouchableOpacity 
              style={[styles.mapPin, { top: 110, left: 45 }]}
              disabled={isMapFrozen}
              onPress={() => {
                setStartLocation("Demerara Terminals (Port Zone)");
                setIsMapFrozen(true);
                setGeoModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.pinDot, { backgroundColor: "#D4A017" }]}>
                <Anchor size={12} color="#FFFFFF" />
              </View>
              <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText}>⚓ Demerara Terminals</Text>
              </View>
            </TouchableOpacity>

            {/* Linden Highway Domestic Pin */}
            <TouchableOpacity 
              style={[styles.mapPin, { top: 175, right: 30 }]}
              disabled={isMapFrozen}
              onPress={() => {
                setStartLocation("Linden Highway (Domestic)");
                setIsImportShipment(false);
                setIsMapFrozen(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.pinDot, { backgroundColor: "#0F3D26" }]}>
                <MapPin size={12} color="#FFFFFF" />
              </View>
              <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText}>📍 Linden Highway</Text>
              </View>
            </TouchableOpacity>

            {isMapFrozen && (
              <View style={styles.mapFreezeOverlay}>
                <ShieldAlert size={20} color="#D4A017" />
                <Text style={styles.mapFreezeText}>Map Locked (Customs Overlay Active)</Text>
              </View>
            )}
          </View>
          <Text style={styles.mapHint}>Tap on any port anchor to simulate geofence trigger</Text>
        </View>

        {/* Locations Routing Component */}
        <LocationPicker
          startLocation={startLocation}
          endLocation={endLocation}
          onChangeStart={handleStartLocationChange}
          onChangeEnd={setEndLocation}
          onSwap={() => {
            const temp = startLocation;
            setStartLocation(endLocation);
            setEndLocation(temp);
          }}
          onAddStop={() => console.log("Add intermediate stop")}
        />

        {/* Load Types */}
        <LoadTypeSelector
          options={loadTypes}
          selectedId={selectedType}
          onSelect={setSelectedType}
        />

        {/* Your Own Package */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your own package</Text>
          <View style={styles.packagesList}>
            {packages.map((pkg, index) => (
              <PackageForm
                key={pkg.id}
                data={pkg}
                onChange={(updatedPkg) => {
                  const newPackages = [...packages];
                  newPackages[index] = updatedPkg;
                  setPackages(newPackages);
                }}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.addPackageButton}
            onPress={() => {
              setPackages([
                ...packages,
                {
                  id: Date.now().toString(),
                  code: "",
                  weight: "0",
                  length: "0",
                  width: "0",
                  height: "0",
                },
              ]);
            }}
          >
            <Plus size={18} color="#0F3D26" />
            <Text style={styles.addPackageText}>Add package</Text>
          </TouchableOpacity>
        </View>

        {/* Book a Load */}
        <DateTimePickerSection />

        {/* Recommended Offer */}
        <OfferSlider />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Request pickup"
          onPress={() => {
            console.log("Submitted Packages Data:", JSON.stringify(packages, null, 2));
            setIsReviewModalOpen(true);
          }}
        />
      </View>

      {/* Review Modal */}
      <BottomSheet
        isVisible={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Expected on: 19 Jun 2025"
      >
        <OrderSummary
          data={{
            id: Date.now().toString().slice(-9),
            title: packages.length > 0 && packages[0].code ? packages[0].code : "Mixed Cargo",
            status: "Awaiting Pickup",
            quantity: packages.length,
            size: packages[0] ? `${packages[0].length}x${packages[0].width}x${packages[0].height}cm` : "0x0x0cm",
            weight: packages.reduce((acc, p) => acc + (parseFloat(p.weight) || 0), 0) + "kg",
            type: loadTypes.find((t) => t.id === selectedType)?.label || "General cargo",
          }}
        />

        <View style={{ marginTop: 8 }}>
          <PrimaryButton
            title="Finalize order"
            onPress={() => {
              const totalWeight = packages.reduce((acc, p) => acc + (parseFloat(p.weight) || 0), 0).toString();
              const cargoTypeStr = loadTypes.find((t) => t.id === selectedType)?.label || "General cargo";
              
              addShipment({
                pickup: startLocation,
                delivery: endLocation,
                cargoType: cargoTypeStr,
                weight: totalWeight,
                offerPrice: "150000",
                status: "OPEN",
                deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString(),
                acceptedByDriver: false,
                is_import: isImportShipment,
              });

              console.log("Order finalized!");
              setIsReviewModalOpen(false);
              router.push("/create-load/status?state=confirmed");
            }}
          />
        </View>
      </BottomSheet>

      {/* Port Pickup Verification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={geoModalVisible}
        onRequestClose={() => {
          setIsMapFrozen(false);
          setGeoModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBackdropBlur} />
          
          <View style={styles.geoModalContainer}>
            {/* Header Section */}
            <View style={styles.geoModalHeader}>
              <View style={styles.anchorIconBg}>
                <Anchor size={28} color="#D4A017" />
              </View>
              <Text style={styles.geoModalTitle}>⚓ Port Pickup Verification</Text>
            </View>

            {/* Body Content */}
            <View style={styles.geoModalBody}>
              <Text style={styles.geoModalText}>
                This shipment originates from a customs-controlled zone. A2B requires pre-cleared customs documentation (Form C21/Bill of Lading) to ensure your driver passes port checkpoints without delays.
              </Text>
              
              <View style={styles.warningAlertBox}>
                <ShieldAlert size={18} color="#B45309" />
                <Text style={styles.warningAlertText}>
                  A2B requires pre-cleared customs documentation (Form C21/Bill of Lading) to bypass customs constraints.
                </Text>
              </View>
            </View>

            {/* Action CTAs */}
            <View style={styles.geoModalFooter}>
              <TouchableOpacity
                style={styles.geoModalPrimaryButton}
                activeOpacity={0.8}
                onPress={() => {
                  setIsImportShipment(true);
                  setGeoModalVisible(false);
                  
                  router.push({
                    pathname: "/create-load/document-vault",
                    params: {
                      pickup: startLocation,
                      delivery: endLocation,
                      cargoType: selectedType,
                      weight: packages.reduce((acc, p) => acc + (parseFloat(p.weight) || 0), 0).toString(),
                    }
                  });
                }}
              >
                <Text style={styles.geoModalPrimaryButtonText}>Continue to Document Vault</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.geoModalSecondaryButton}
                activeOpacity={0.7}
                onPress={() => {
                  setIsMapFrozen(false);
                  setIsImportShipment(false);
                  setStartLocation("Houston, TX"); // Reset to standard domestic location
                  setGeoModalVisible(false);
                }}
              >
                <Text style={styles.geoModalSecondaryButtonText}>Cancel & Route Domestic</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 100,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  packagesList: {
    gap: 16,
  },
  addPackageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  addPackageText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  cardSpace: {
    gap: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
    marginLeft: 4,
  },
  labelText: {
    fontSize: 12, // text-xs
    fontWeight: "600", // font-semibold
    color: "#6B7280", // text-gray-500
    textTransform: "uppercase",
    letterSpacing: 0.5, // tracking-wide
  },
  input: {
    width: "100%",
    paddingHorizontal: 16, // px-4
    paddingVertical: 14, // py-3.5
    backgroundColor: "#F9FAFB", // bg-gray-50
    borderWidth: 1,
    borderColor: "#E5E7EB", // border-gray-200
    borderRadius: 8, // rounded-lg
    fontSize: 14, // text-sm
    color: "#111827",
  },
  inputGroup: {
    position: "relative",
  },
  inputGroupRelative: {
    position: "relative",
    zIndex: 10,
  },
  connectorLine: {
    position: "absolute",
    left: 29,
    top: 60,
    height: 32, // h-8
    borderLeftWidth: 2,
    borderColor: "#D1D5DB", // border-gray-300
    borderStyle: "dashed",
    zIndex: 0,
  },
  chipContainer: {
    flexDirection: "row",
    gap: 8, // gap-2
    marginTop: 12, // mt-3
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 12, // px-3
    paddingVertical: 6, // py-1.5
    borderRadius: 9999, // rounded-full
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: "#0F3D26",
    borderColor: "#0F3D26",
  },
  chipUnselected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  chipText: {
    fontSize: 12, // text-xs
    fontWeight: "500", // font-medium
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  chipTextUnselected: {
    color: "#6B7280",
  },
  marginTop: {
    marginTop: 16,
  },
  priceInputContainer: {
    position: "relative",
  },
  priceInput: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 16, // py-4
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D97706", // border-amber
    borderRadius: 8,
    fontSize: 18, // text-lg
    fontWeight: "bold",
    color: "#111827",
  },
  currencyLabel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 16,
    justifyContent: "center",
  },
  currencyText: {
    color: "#9CA3AF", // text-gray-400
    fontWeight: "500",
    fontSize: 12,
    textTransform: "uppercase",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    marginLeft: 4,
  },
  infoText: {
    fontSize: 12, // text-xs
    color: "#6B7280", // text-gray-500
  },
  marginBottom: {
    marginBottom: 6,
    marginLeft: 4,
  },
  textArea: {
    textAlignVertical: "top",
    minHeight: 80,
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
    paddingBottom: 32,
  },
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F5F5F4",
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  mapCanvas: {
    height: 220,
    backgroundColor: "#E6F4EA",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  mapCanvasFrozen: {
    opacity: 0.9,
  },
  waterBody: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "40%",
    height: "100%",
    backgroundColor: "#BFDBFE", // light blue water
  },
  coastline: {
    position: "absolute",
    top: 0,
    left: "40%",
    width: 2,
    height: "100%",
    backgroundColor: "#93C5FD",
    borderStyle: "dashed",
  },
  highwayRoute1: {
    position: "absolute",
    top: 60,
    left: "30%",
    width: "70%",
    height: 6,
    backgroundColor: "#9CA3AF",
    borderRadius: 3,
  },
  highwayRoute2: {
    position: "absolute",
    top: 130,
    left: "20%",
    width: "80%",
    height: 6,
    backgroundColor: "#9CA3AF",
    borderRadius: 3,
  },
  mapPin: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 20,
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinLabel: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pinLabelText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1F2937",
  },
  mapFreezeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 50,
  },
  mapFreezeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
    backgroundColor: "rgba(15, 61, 38, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  mapHint: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdropBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  geoModalContainer: {
    width: Dimensions.get("window").width * 0.88,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  geoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
  },
  anchorIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  geoModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  geoModalBody: {
    gap: 12,
  },
  geoModalText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  warningAlertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  warningAlertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: "#92400E",
  },
  geoModalFooter: {
    gap: 8,
    marginTop: 8,
  },
  geoModalPrimaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#0F3D26",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  geoModalPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  geoModalSecondaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  geoModalSecondaryButtonText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },
});
