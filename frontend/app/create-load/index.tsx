import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  MapPin,
  Navigation,
  Package,
  ArrowRight,
  Lock,
  Image as ImageIcon,
  Plus,
} from "lucide-react-native";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LocationPicker } from "@/components/LocationPicker";
import { LoadTypeSelector } from "@/components/LoadTypeSelector";
import { PackageForm, PackageData } from "@/components/PackageForm";
import { DateTimePickerSection } from "@/components/DateTimePickerSection";
import { OfferSlider } from "@/components/OfferSlider";
import { BottomSheet } from "@/components/BottomSheet";
import { OrderSummary } from "@/components/OrderSummary";

export default function CreateLoadScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [selectedType, setSelectedType] = useState("general");
  const [startLocation, setStartLocation] = useState("Houston, TX");
  const [endLocation, setEndLocation] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [packages, setPackages] = useState<PackageData[]>([
    { id: "1", code: "", weight: "250", length: "12", width: "8", height: "10" }
  ]);

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
        {/* Locations Routing Component */}
        <LocationPicker
          startLocation={startLocation}
          endLocation={endLocation}
          onChangeStart={setStartLocation}
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
              console.log("Order finalized!");
              setIsReviewModalOpen(false);
              router.back();
            }}
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
});
