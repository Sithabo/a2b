import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Package,
  Plus,
  Wrench,
  Apple,
  FlaskConical,
  CheckCircle,
} from "lucide-react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadTypeSelector } from "@/components/LoadTypeSelector";
import { PackageForm, PackageData } from "@/components/PackageForm";
import { DateTimePickerSection } from "@/components/DateTimePickerSection";
import { OfferSlider } from "@/components/OfferSlider";
import { BottomSheet } from "@/components/BottomSheet";
import { OrderSummary } from "@/components/OrderSummary";
import { useShipmentStore, CargoType, CargoDetails } from "@/store/useShipmentStore";
import { ScreenHeader } from "@/components/ScreenHeader";

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
  const draftShipment = useShipmentStore((state) => state.draftShipment);
  const setDraftShipment = useShipmentStore((state) => state.setDraftShipment);

  const [selectedType, setSelectedType] = useState<CargoType>("GENERAL_CARGO");
  const [packages, setPackages] = useState<PackageData[]>([
    { id: "1", code: "", weight: "250", length: "12", width: "8", height: "10" }
  ]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Heavy Machinery States
  const [machineryWeightTons, setMachineryWeightTons] = useState("20");
  const [machineryWidthMeters, setMachineryWidthMeters] = useState("");
  const [machineryHeightMeters, setMachineryHeightMeters] = useState("");
  const [requiresFlatbedLowboy, setRequiresFlatbedLowboy] = useState(false);
  const [requiresHydraulicTipper, setRequiresHydraulicTipper] = useState(false);

  // Chemicals & Pharma States
  const [chemicalsWeightTons, setChemicalsWeightTons] = useState("20");
  const [chemicalsVolume, setChemicalsVolume] = useState("15");
  const [chemicalContainer, setChemicalContainer] = useState<'TANKER' | 'IBC_TOTES' | 'DRUMS' | 'PALLETS' | null>(null);

  // Food & Beverages States
  const [foodWeightTons, setFoodWeightTons] = useState("20");
  const [foodVolume, setFoodVolume] = useState("15");
  const [storageEnvironment, setStorageEnvironment] = useState<'AMBIENT' | 'CHILLED' | 'FROZEN'>('AMBIENT');

  // Pricing State
  const [offerPrice, setOfferPrice] = useState(150000);

  const [subStep, setSubStep] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // Sync wizard step
  useEffect(() => {
    setCurrentStep(2);
    setSubStep(1);
  }, [setCurrentStep]);

  // Load from draft if exists
  useEffect(() => {
    if (draftShipment) {
      if (draftShipment.cargo?.type) {
        setSelectedType(draftShipment.cargo.type);
      }
      if (draftShipment.cargo?.type === 'HEAVY_MACHINERY') {
        if (draftShipment.cargo?.requiresFlatbedLowboy !== undefined) {
          setRequiresFlatbedLowboy(draftShipment.cargo.requiresFlatbedLowboy);
        }
        if (draftShipment.cargo?.requiresHydraulicTipper !== undefined) {
          setRequiresHydraulicTipper(draftShipment.cargo.requiresHydraulicTipper);
        }
        if (draftShipment.cargo?.dimensions?.widthMeters !== undefined) {
          setMachineryWidthMeters(draftShipment.cargo.dimensions.widthMeters.toString());
        }
        if (draftShipment.cargo?.dimensions?.heightMeters !== undefined) {
          setMachineryHeightMeters(draftShipment.cargo.dimensions.heightMeters.toString());
        }
        if (draftShipment.weight) {
          const matched = draftShipment.weight.match(/^(\d+(\.\d+)?)/);
          if (matched) setMachineryWeightTons(matched[1]);
        }
      }
      if (draftShipment.cargo?.type === 'CHEMICALS_PHARMA') {
        if (draftShipment.weight) {
          const matched = draftShipment.weight.match(/^(\d+(\.\d+)?)/);
          if (matched) setChemicalsWeightTons(matched[1]);
        }
        if (draftShipment.cargo?.volumeCubicMeters !== undefined) {
          setChemicalsVolume(draftShipment.cargo.volumeCubicMeters.toString());
        }
        if (draftShipment.cargo?.chemicalContainer) {
          setChemicalContainer(draftShipment.cargo.chemicalContainer);
        }
      }
      if (draftShipment.cargo?.type === 'FOOD_BEVERAGE') {
        if (draftShipment.weight) {
          const matched = draftShipment.weight.match(/^(\d+(\.\d+)?)/);
          if (matched) setFoodWeightTons(matched[1]);
        }
        if (draftShipment.cargo?.volumeCubicMeters !== undefined) {
          setFoodVolume(draftShipment.cargo.volumeCubicMeters.toString());
        }
        if (draftShipment.cargo?.storageEnvironment) {
          setStorageEnvironment(draftShipment.cargo.storageEnvironment);
        }
      }
      if (draftShipment.cargo?.type === 'GENERAL_CARGO' && draftShipment.cargo?.weightKg !== undefined) {
        setPackages([{
          id: "1",
          code: "",
          weight: draftShipment.cargo.weightKg.toString(),
          length: draftShipment.cargo.dimensions?.lengthMeters.toString() || "12",
          width: draftShipment.cargo.dimensions?.widthMeters.toString() || "8",
          height: draftShipment.cargo.dimensions?.heightMeters.toString() || "10",
        }]);
      }
      if (draftShipment.offerPrice) {
        setOfferPrice(parseFloat(draftShipment.offerPrice) || 150000);
      }
    }
  }, [draftShipment]);

  const loadTypes = [
    { id: "GENERAL_CARGO", label: "General Cargo", icon: Package },
    { id: "HEAVY_MACHINERY", label: "Heavy Machinery", icon: Wrench },
    { id: "CHEMICALS_PHARMA", label: "Chemicals & Pharma", icon: FlaskConical },
    { id: "FOOD_BEVERAGE", label: "Food & Beverages", icon: Apple },
  ];

  const isFormValid =
    selectedType === "GENERAL_CARGO"
      ? (packages.length > 0 && packages.every((p) => parseFloat(p.weight) > 0))
      : selectedType === "HEAVY_MACHINERY"
      ? (parseFloat(machineryWeightTons) > 0)
      : selectedType === "CHEMICALS_PHARMA"
      ? (parseFloat(chemicalsWeightTons) > 0 && parseFloat(chemicalsVolume) > 0)
      : selectedType === "FOOD_BEVERAGE"
      ? (parseFloat(foodWeightTons) > 0 && parseFloat(foodVolume) > 0)
      : false;

  const totalWeight = selectedType === 'HEAVY_MACHINERY'
    ? `${machineryWeightTons} Tons`
    : selectedType === 'CHEMICALS_PHARMA'
    ? `${chemicalsWeightTons} Tons`
    : selectedType === 'FOOD_BEVERAGE'
    ? `${foodWeightTons} Tons`
    : packages.reduce((acc, p) => acc + (parseFloat(p.weight) || 0), 0).toString();

  const cargoTypeStr = loadTypes.find((t) => t.id === selectedType)?.label || "General Cargo";

  const getSurchargeBreakdown = (): { label: string; amount: number }[] => {
    const list: { label: string; amount: number }[] = [];
    if (selectedType === "GENERAL_CARGO") {
      list.push({ label: "📄 Import License Surcharge", amount: 10000 });
    } else if (selectedType === "HEAVY_MACHINERY") {
      list.push({ label: "🏗️ Capital Equipment Concession", amount: 30000 });
      if (requiresFlatbedLowboy) {
        list.push({ label: "🚛 Route Clearance Surcharge", amount: 15000 });
      }
      if (requiresHydraulicTipper) {
        list.push({ label: "⚖️ Tipper Gate Fee", amount: 10000 });
      }
    } else if (selectedType === "CHEMICALS_PHARMA") {
      list.push({ label: "🧪 PTCCD Hazard Clearance", amount: 45000 });
    } else if (selectedType === "FOOD_BEVERAGE") {
      const storageLabel = storageEnvironment === "FROZEN" ? "Frozen" : (storageEnvironment === "CHILLED" ? "Chilled" : "Ambient");
      const icon = storageEnvironment === "FROZEN" ? "❄️" : (storageEnvironment === "CHILLED" ? "🌡️" : "📦");
      list.push({
        label: `${icon} GA-FDD Safe-Handling (${storageLabel})`,
        amount: storageEnvironment === "FROZEN" ? 35000 : (storageEnvironment === "CHILLED" ? 25000 : 15000)
      });
    }
    return list;
  };

  const handleNextStep = () => {
    if (!isFormValid) return;

    const cargoDetails: CargoDetails = {
      type: selectedType,
      weightKg: selectedType === 'GENERAL_CARGO' ? (parseFloat(totalWeight) || undefined) : undefined,
      dimensions: selectedType === 'GENERAL_CARGO' ? {
        lengthMeters: parseFloat(packages[0]?.length) || 0,
        widthMeters: parseFloat(packages[0]?.width) || 0,
        heightMeters: parseFloat(packages[0]?.height) || 0,
      } : selectedType === 'HEAVY_MACHINERY' ? {
        lengthMeters: 0,
        widthMeters: parseFloat(machineryWidthMeters) || 0,
        heightMeters: parseFloat(machineryHeightMeters) || 0,
      } : undefined,
      requiresGoInvestWaiver: selectedType === 'HEAVY_MACHINERY' ? true : undefined,
      requiresFlatbedLowboy: selectedType === 'HEAVY_MACHINERY' ? requiresFlatbedLowboy : undefined,
      requiresHydraulicTipper: selectedType === 'HEAVY_MACHINERY' ? requiresHydraulicTipper : undefined,
      volumeCubicMeters: selectedType === 'CHEMICALS_PHARMA'
        ? parseFloat(chemicalsVolume)
        : selectedType === 'FOOD_BEVERAGE'
        ? parseFloat(foodVolume)
        : undefined,
      storageEnvironment: selectedType === 'FOOD_BEVERAGE' ? storageEnvironment : undefined,
      chemicalContainer: selectedType === 'CHEMICALS_PHARMA' ? (chemicalContainer || undefined) : undefined,
    };

    if (isImportFlow) {
      setDraftShipment({
        pickup: pickupLocation?.name || "Georgetown Port",
        delivery: dropoffLocation?.name || "",
        cargoType: cargoTypeStr,
        weight: totalWeight + (selectedType === 'GENERAL_CARGO' ? " kg" : ""),
        offerPrice: offerPrice.toString(),
        is_import: true,
        pickupLocation,
        dropoffLocation,
        cargo: cargoDetails,
      });

      setCurrentStep(3);
      router.push({
        pathname: "/create-load/document-vault",
        params: {
          pickup: pickupLocation?.name || "Georgetown Port",
          delivery: dropoffLocation?.name || "",
          cargoType: cargoTypeStr,
          weight: totalWeight + (selectedType === 'GENERAL_CARGO' ? " kg" : ""),
        }
      });
    } else {
      setIsReviewModalOpen(true);
    }
  };

  const handleFinalizeDomesticOrder = () => {
    if (!isFormValid) return;

    const cargoDetails: CargoDetails = {
      type: selectedType,
      weightKg: selectedType === 'GENERAL_CARGO' ? (parseFloat(totalWeight) || undefined) : undefined,
      dimensions: selectedType === 'GENERAL_CARGO' ? {
        lengthMeters: parseFloat(packages[0]?.length) || 0,
        widthMeters: parseFloat(packages[0]?.width) || 0,
        heightMeters: parseFloat(packages[0]?.height) || 0,
      } : selectedType === 'HEAVY_MACHINERY' ? {
        lengthMeters: 0,
        widthMeters: parseFloat(machineryWidthMeters) || 0,
        heightMeters: parseFloat(machineryHeightMeters) || 0,
      } : undefined,
      requiresGoInvestWaiver: selectedType === 'HEAVY_MACHINERY' ? true : undefined,
      requiresFlatbedLowboy: selectedType === 'HEAVY_MACHINERY' ? requiresFlatbedLowboy : undefined,
      requiresHydraulicTipper: selectedType === 'HEAVY_MACHINERY' ? requiresHydraulicTipper : undefined,
      volumeCubicMeters: selectedType === 'CHEMICALS_PHARMA'
        ? parseFloat(chemicalsVolume)
        : selectedType === 'FOOD_BEVERAGE'
        ? parseFloat(foodVolume)
        : undefined,
      storageEnvironment: selectedType === 'FOOD_BEVERAGE' ? storageEnvironment : undefined,
      chemicalContainer: selectedType === 'CHEMICALS_PHARMA' ? (chemicalContainer || undefined) : undefined,
    };

    addShipment({
      pickup: pickupLocation?.name || "Houston, TX",
      delivery: dropoffLocation?.name || "",
      cargoType: cargoTypeStr,
      weight: totalWeight + (selectedType === 'GENERAL_CARGO' ? " kg" : ""),
      offerPrice: offerPrice.toString(),
      status: "OPEN",
      deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      acceptedByDriver: false,
      is_import: false,
      pickupLocation,
      dropoffLocation,
      cargo: cargoDetails,
    });

    setIsReviewModalOpen(false);
    resetRouteState();
    router.replace("/create-load/status?state=confirmed");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="Post a Load"
        subtitle={`Step 2: Cargo Details (Part ${subStep} of 3)`}
        onBackPress={() => {
          if (subStep > 1) {
            setSubStep(subStep - 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
          } else {
            router.back();
          }
        }}
        onCancelPress={() => {
          resetRouteState();
          router.replace("/(tabs)");
        }}
      />

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {subStep === 1 && (
          <>
            {/* Load Types */}
            <LoadTypeSelector
              options={loadTypes}
              selectedId={selectedType}
              onSelect={(id) => setSelectedType(id as CargoType)}
            />

            {/* Heavy Machinery details card (Conditional) */}
            {selectedType === "HEAVY_MACHINERY" && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Heavy Machinery Details</Text>
                
                {/* Weight Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Weight (Tons)</Text>
                  <View style={styles.inputWithSuffix}>
                    <TextInput
                      style={styles.textInput}
                      value={machineryWeightTons}
                      onChangeText={setMachineryWeightTons}
                      keyboardType="numeric"
                      placeholder="20"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.inputSuffix}>Tons</Text>
                  </View>
                </View>

                {/* Dimensions Safety Check (Optional Height & Width) */}
                <View style={styles.inputsRow}>
                  <View style={styles.halfInputContainer}>
                    <Text style={styles.inputLabel}>Max Width (m) (Optional)</Text>
                    <View style={styles.inputWithSuffix}>
                      <TextInput
                        style={styles.textInput}
                        value={machineryWidthMeters}
                        onChangeText={setMachineryWidthMeters}
                        keyboardType="numeric"
                        placeholder="e.g. 3.2"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text style={styles.inputSuffix}>m</Text>
                    </View>
                  </View>

                  <View style={styles.halfInputContainer}>
                    <Text style={styles.inputLabel}>Max Height (m) (Optional)</Text>
                    <View style={styles.inputWithSuffix}>
                      <TextInput
                        style={styles.textInput}
                        value={machineryHeightMeters}
                        onChangeText={setMachineryHeightMeters}
                        keyboardType="numeric"
                        placeholder="e.g. 4.1"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text style={styles.inputSuffix}>m</Text>
                    </View>
                  </View>
                </View>

                {/* Checkboxes Row */}
                <View style={styles.checkboxesRow}>
                  <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => setRequiresFlatbedLowboy(!requiresFlatbedLowboy)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.checkbox}>
                      {requiresFlatbedLowboy ? (
                        <CheckCircle size={20} color="#0F3D26" />
                      ) : (
                        <View style={styles.checkboxOutline} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Requires Flatbed/Lowboy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => setRequiresHydraulicTipper(!requiresHydraulicTipper)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.checkbox}>
                      {requiresHydraulicTipper ? (
                        <CheckCircle size={20} color="#0F3D26" />
                      ) : (
                        <View style={styles.checkboxOutline} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Requires Hydraulic Tipper (Mechanical Dump)</Text>
                  </TouchableOpacity>
                </View>

                {/* Soft Amber Notification Card */}
                <View style={styles.amberNotificationCard}>
                  <Text style={styles.amberNotificationText}>
                    ℹ️ <Text style={styles.amberNotificationBold}>Zero-Rated Status:</Text> This cargo qualifies for GRA Tax Concessions. A GO-Invest letter will be required in the Document Vault.
                  </Text>
                </View>
              </View>
            )}

            {/* Chemicals & Pharma details card (Conditional) */}
            {selectedType === "CHEMICALS_PHARMA" && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Chemicals & Pharma Details</Text>
                
                {/* Weight and Volume Inputs */}
                <View style={styles.inputsRow}>
                  <View style={styles.halfInputContainer}>
                    <Text style={styles.inputLabel}>Weight (Tons)</Text>
                    <View style={styles.inputWithSuffix}>
                      <TextInput
                        style={styles.textInput}
                        value={chemicalsWeightTons}
                        onChangeText={setChemicalsWeightTons}
                        keyboardType="numeric"
                        placeholder="20"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text style={styles.inputSuffix}>Tons</Text>
                    </View>
                  </View>

                  <View style={styles.halfInputContainer}>
                    <Text style={styles.inputLabel}>Volume (m³)</Text>
                    <View style={styles.inputWithSuffix}>
                      <TextInput
                        style={styles.textInput}
                        value={chemicalsVolume}
                        onChangeText={setChemicalsVolume}
                        keyboardType="numeric"
                        placeholder="15"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text style={styles.inputSuffix}>m³</Text>
                    </View>
                  </View>
                </View>

                {/* High Visibility Warning Banner */}
                <View style={styles.containerSelectionSection}>
                  <Text style={styles.inputLabel}>Containment Unit (Optional)</Text>
                  <View style={styles.containerGrid}>
                    {([
                      { id: "TANKER", label: "Tanker" },
                      { id: "IBC_TOTES", label: "IBC Totes" },
                      { id: "DRUMS", label: "Drums" },
                      { id: "PALLETS", label: "Pallets" },
                    ] as const).map((unit) => {
                      const isActive = chemicalContainer === unit.id;
                      return (
                        <TouchableOpacity
                          key={unit.id}
                          style={[
                            styles.containerButton,
                            isActive ? styles.containerActive : styles.containerInactive,
                          ]}
                          onPress={() => setChemicalContainer(isActive ? null : unit.id)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.containerText,
                              isActive ? styles.containerTextActive : styles.containerTextInactive,
                            ]}
                          >
                            {unit.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* High Visibility Warning Banner */}
                <View style={styles.redWarningBanner}>
                  <Text style={styles.redWarningText}>
                    ⚠️ <Text style={styles.redWarningBold}>Hazard Tracking:</Text> This load requires verified clearance from the Pesticide, Toxic Chemicals Control Department (PTCCD).
                  </Text>
                </View>
              </View>
            )}

            {/* Food & Beverages details card (Conditional) */}
            {selectedType === "FOOD_BEVERAGE" && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Food & Beverages Details</Text>
                
                {/* Weight and Volume Inputs */}
                <View style={styles.inputsRow}>
                  <View style={styles.halfInputContainer}>
                    <Text style={styles.inputLabel}>Weight (Tons)</Text>
                    <View style={styles.inputWithSuffix}>
                      <TextInput
                        style={styles.textInput}
                        value={foodWeightTons}
                        onChangeText={setFoodWeightTons}
                        keyboardType="numeric"
                        placeholder="20"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text style={styles.inputSuffix}>Tons</Text>
                    </View>
                  </View>

                  <View style={styles.halfInputContainer}>
                    <Text style={styles.inputLabel}>Volume (m³)</Text>
                    <View style={styles.inputWithSuffix}>
                      <TextInput
                        style={styles.textInput}
                        value={foodVolume}
                        onChangeText={setFoodVolume}
                        keyboardType="numeric"
                        placeholder="15"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text style={styles.inputSuffix}>m³</Text>
                    </View>
                  </View>
                </View>

                {/* Segmented Control Storage Environment */}
                <View style={styles.storageControlContainer}>
                  <Text style={styles.inputLabel}>Storage Environment</Text>
                  <View style={styles.segmentedControl}>
                    {(["AMBIENT", "CHILLED", "FROZEN"] as const).map((env) => {
                      const isActive = storageEnvironment === env;
                      return (
                        <TouchableOpacity
                          key={env}
                          style={[
                            styles.segmentButton,
                            isActive ? styles.segmentActive : styles.segmentInactive,
                          ]}
                          onPress={() => setStorageEnvironment(env)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              isActive ? styles.segmentTextActive : styles.segmentTextInactive,
                            ]}
                          >
                            {env.charAt(0) + env.slice(1).toLowerCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Informative Text Block */}
                <View style={styles.blueInfoBlock}>
                  <Text style={styles.blueInfoText}>
                    ℹ️ <Text style={styles.blueInfoBold}>GA-FDD Regulations:</Text> Requires certified safe-handling paperwork or US FDA state commerce certificates.
                  </Text>
                </View>
              </View>
            )}

            {/* Your Own Package (Only visible for General Cargo) */}
            {selectedType === "GENERAL_CARGO" && (
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
            )}
          </>
        )}

        {subStep === 2 && (
          <>
            {/* Date Time Picker Section */}
            <DateTimePickerSection />

            {/* Back action */}
            <TouchableOpacity
              style={styles.backLinkButton}
              onPress={() => {
                setSubStep(1);
                scrollViewRef.current?.scrollTo({ y: 0, animated: false });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.backLinkText}>← Back to Cargo Details</Text>
            </TouchableOpacity>
          </>
        )}

        {subStep === 3 && (
          <>
            {/* Recommended Offer */}
            <OfferSlider
              value={offerPrice}
              onChange={setOfferPrice}
              surcharges={getSurchargeBreakdown()}
              baseRate={150000}
            />

            {/* Back action */}
            <TouchableOpacity
              style={styles.backLinkButton}
              onPress={() => {
                setSubStep(2);
                scrollViewRef.current?.scrollTo({ y: 0, animated: false });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.backLinkText}>← Back to Booking Schedule</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom Next/Finalize Button */}
      <View style={styles.footer}>
        {subStep === 1 ? (
          <PrimaryButton
            title="NEXT: BOOKING SCHEDULE"
            onPress={() => {
              setSubStep(2);
              scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            }}
            disabled={!isFormValid}
          />
        ) : subStep === 2 ? (
          <PrimaryButton
            title="NEXT: SET OFFER"
            onPress={() => {
              setSubStep(3);
              scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            }}
            disabled={!isFormValid}
          />
        ) : (
          <PrimaryButton
            title={isImportFlow ? "NEXT: DOCUMENT VAULT" : "REQUEST PICKUP"}
            onPress={handleNextStep}
            disabled={!isFormValid}
          />
        )}
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
            title: selectedType === 'HEAVY_MACHINERY'
              ? `Heavy Machinery (${machineryWeightTons} Tons)`
              : selectedType === 'CHEMICALS_PHARMA'
              ? `Chemicals & Pharma (${chemicalsWeightTons} Tons${chemicalContainer ? `, ${chemicalContainer.replace('_', ' ')}` : ''})`
              : selectedType === 'FOOD_BEVERAGE'
              ? `Food & Beverages (${foodWeightTons} Tons)`
              : (packages.length > 0 && packages[0].code ? packages[0].code : "Mixed Cargo"),
            status: "Awaiting Pickup",
            quantity: selectedType === 'GENERAL_CARGO' ? packages.length : 1,
            size: selectedType === 'GENERAL_CARGO'
              ? (packages[0] ? `${packages[0].length}x${packages[0].width}x${packages[0].height}cm` : "0x0x0cm")
              : selectedType === 'HEAVY_MACHINERY'
              ? (machineryWidthMeters || machineryHeightMeters
                ? `${machineryWidthMeters || "-"}m (W) x ${machineryHeightMeters || "-"}m (H)`
                : "Standard Dimensions")
              : selectedType === 'CHEMICALS_PHARMA'
              ? `${chemicalsVolume} m³${chemicalContainer ? ` (${chemicalContainer.replace('_', ' ')})` : ''}`
              : selectedType === 'FOOD_BEVERAGE'
              ? `${foodVolume} m³ (${storageEnvironment})`
              : "N/A",
            weight: totalWeight + (selectedType === 'GENERAL_CARGO' ? " kg" : ""),
            type: cargoTypeStr,
          }}
        />

        <View style={{ marginTop: 8 }}>
          <PrimaryButton
            title="Finalize order"
            onPress={handleFinalizeDomesticOrder}
            disabled={!isFormValid}
          />
        </View>
      </BottomSheet>
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
  detailsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
    marginBottom: 4,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  inputWithSuffix: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    padding: 0,
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6B7280",
    marginLeft: 8,
  },
  checkboxesRow: {
    flexDirection: "column",
    gap: 12,
    marginVertical: 4,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxOutline: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#9CA3AF",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  amberNotificationCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    marginTop: 4,
  },
  amberNotificationText: {
    fontSize: 12,
    color: "#B45309",
    lineHeight: 18,
  },
  amberNotificationBold: {
    fontWeight: "bold",
  },
  redWarningBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginTop: 4,
  },
  redWarningText: {
    fontSize: 12,
    color: "#B91C1C",
    lineHeight: 18,
  },
  redWarningBold: {
    fontWeight: "bold",
  },
  blueInfoBlock: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    marginTop: 4,
  },
  blueInfoText: {
    fontSize: 12,
    color: "#1D4ED8",
    lineHeight: 18,
  },
  blueInfoBold: {
    fontWeight: "bold",
  },
  inputsRow: {
    flexDirection: "row",
    gap: 16,
  },
  halfInputContainer: {
    flex: 1,
    gap: 8,
  },
  storageControlContainer: {
    gap: 8,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
    width: "100%",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: "#0F3D26",
  },
  segmentInactive: {
    backgroundColor: "transparent",
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  segmentTextInactive: {
    color: "#4B5563",
  },
  containerSelectionSection: {
    gap: 8,
    marginTop: 4,
  },
  containerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  containerButton: {
    width: "48%", // 2 columns
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  containerActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#0F3D26",
  },
  containerInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  containerText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  containerTextActive: {
    color: "#0F3D26",
  },
  containerTextInactive: {
    color: "#4B5563",
  },
  backLinkButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 12,
  },
  backLinkText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "bold",
  },
});
