import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Package,
  Lock,
  Image as ImageIcon,
  Plus,
  ArrowLeft,
} from "lucide-react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadTypeSelector } from "@/components/LoadTypeSelector";
import { PackageForm, PackageData } from "@/components/PackageForm";
import { DateTimePickerSection } from "@/components/DateTimePickerSection";
import { OfferSlider } from "@/components/OfferSlider";
import { BottomSheet } from "@/components/BottomSheet";
import { OrderSummary } from "@/components/OrderSummary";
import { useShipmentStore } from "@/store/useShipmentStore";

export default function CargoDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const pickupLocation = useShipmentStore((state) => state.pickupLocation);
  const dropoffLocation = useShipmentStore((state) => state.dropoffLocation);
  const isImportFlow = useShipmentStore((state) => state.isImportFlow);
  const addShipment = useShipmentStore((state) => state.addShipment);
  const setCurrentStep = useShipmentStore((state) => state.setCurrentStep);
  const resetRouteState = useShipmentStore((state) => state.resetRouteState);

  const [selectedType, setSelectedType] = useState("general");
  const [packages, setPackages] = useState<PackageData[]>([
    { id: "1", code: "", weight: "250", length: "12", width: "8", height: "10" }
  ]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Sync wizard step
  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const loadTypes = [
    { id: "general", label: "General cargo", icon: Package },
    { id: "bulk", label: "Bulk cargo", icon: Lock },
    { id: "fragile", label: "Fragile cargo", icon: ImageIcon },
  ];

  const handleNextStep = () => {
    const totalWeight = packages.reduce((acc, p) => acc + (parseFloat(p.weight) || 0), 0).toString();
    const cargoTypeStr = loadTypes.find((t) => t.id === selectedType)?.label || "General cargo";

    if (isImportFlow) {
      // Proceed to Step 3: Document Vault
      setCurrentStep(3);
      router.push({
        pathname: "/create-load/document-vault",
        params: {
          pickup: pickupLocation?.name || "Georgetown Port",
          delivery: dropoffLocation?.name || "",
          cargoType: cargoTypeStr,
          weight: totalWeight,
        }
      });
    } else {
      // Show order summary sheet for domestic order finalization
      setIsReviewModalOpen(true);
    }
  };

  const handleFinalizeDomesticOrder = () => {
    const totalWeight = packages.reduce((acc, p) => acc + (parseFloat(p.weight) || 0), 0).toString();
    const cargoTypeStr = loadTypes.find((t) => t.id === selectedType)?.label || "General cargo";

    addShipment({
      pickup: pickupLocation?.name || "Houston, TX",
      delivery: dropoffLocation?.name || "",
      cargoType: cargoTypeStr,
      weight: totalWeight,
      offerPrice: "150000",
      status: "OPEN",
      deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      acceptedByDriver: false,
      is_import: false,
    });

    setIsReviewModalOpen(false);
    resetRouteState();
    // Replace stack view to avoid back navigation to finalized load
    router.replace("/create-load/status?state=confirmed");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Wizard Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#0F3D26" size={20} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Post a Load</Text>
          <Text style={styles.headerSubtitle}>
            {isImportFlow ? "Step 2 of 3: Cargo Details" : "Step 2 of 2: Cargo Details"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            resetRouteState();
            router.replace("/(tabs)");
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {/* Date Time Picker Section */}
        <DateTimePickerSection />

        {/* Recommended Offer */}
        <OfferSlider />
      </ScrollView>

      {/* Sticky Bottom Next/Finalize Button */}
      <View style={styles.footer}>
        <PrimaryButton
          title={isImportFlow ? "NEXT: DOCUMENT VAULT" : "REQUEST PICKUP"}
          onPress={handleNextStep}
        />
      </View>

      {/* Review Bottom Sheet (Domestic Flow Only) */}
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
            onPress={handleFinalizeDomesticOrder}
          />
        </View>
      </BottomSheet>
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
  cancelText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 110,
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
});
