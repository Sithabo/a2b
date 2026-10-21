import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Package,
  Plus,
  Wrench,
  Apple,
  FlaskConical,
  CheckCircle,
} from "lucide-react-native";
import { LoadTypeSelector } from "@/components/LoadTypeSelector";
import { PackageForm, PackageData } from "@/components/PackageForm";
import { DateTimePickerSection } from "@/components/DateTimePickerSection";
import { OfferSlider } from "@/components/OfferSlider";
import { OrderSummary } from "@/components/OrderSummary";
import { useShipmentStore } from "@/store/useShipmentStore";
import {
  colors,
  fontFamily,
  layout,
  radius,
  spacing,
  ScreenHeader,
  BottomSheet,
  Button,
  ChipGroup,
  SegmentedControl,
  Text,
  TextField,
} from "@a2b/ui";
import {
  cargoLabel,
  marketDateTime,
  marketParts,
  recommendOffer,
  toPickerValue,
  type CargoDetails,
  type CargoType,
} from "@a2b/core";
import { apiErrorMessage } from "@a2b/api-client";
import { api } from "@/lib/session";
import { newLoadBody, useInvalidateLoads } from "@/lib/loads";
import { useMarket } from "@/store/useMarket";

export default function CargoDetailsScreen() {
  const router = useRouter();
  const market = useMarket();
  /** The picked day at a wall-clock time in the shipper's market (not the phone's timezone). */
  const atMarketTime = (day: Date, hour: number, minute = 0) =>
    marketDateTime(market, day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
  const insets = useSafeAreaInsets();

  const pickupLocation = useShipmentStore((state) => state.pickupLocation);
  const dropoffLocation = useShipmentStore((state) => state.dropoffLocation);
  const isImportFlow = useShipmentStore((state) => state.isImportFlow);
  const invalidateLoads = useInvalidateLoads();
  const [isPosting, setIsPosting] = useState(false);
  const setCurrentStep = useShipmentStore((state) => state.setCurrentStep);
  const resetRouteState = useShipmentStore((state) => state.resetRouteState);
  const draft = useShipmentStore((state) => state.draft);
  const setDraft = useShipmentStore((state) => state.setDraft);

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

  // Date/Time States
  // Picker values show the market's wall clock (see toPickerValue / atMarketTime)
  const [pickupDate, setPickupDate] = useState<Date | null>(() => {
    const today = marketParts(new Date(), market);
    return new Date(today.year, today.month, today.day + 1); // tomorrow in the market
  });
  const [pickupWindow, setPickupWindow] = useState<"EARLY_MORNING" | "MID_DAY" | "AFTERNOON" | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

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
    if (draft) {
      if (draft.cargo.type) {
        setSelectedType(draft.cargo.type);
      }
      if (draft.cargo.type === 'HEAVY_MACHINERY') {
        if (draft.cargo.requiresFlatbedLowboy !== undefined) {
          setRequiresFlatbedLowboy(draft.cargo.requiresFlatbedLowboy);
        }
        if (draft.cargo.requiresHydraulicTipper !== undefined) {
          setRequiresHydraulicTipper(draft.cargo.requiresHydraulicTipper);
        }
        if (draft.cargo.dimensions?.widthMeters !== undefined) {
          setMachineryWidthMeters(draft.cargo.dimensions.widthMeters.toString());
        }
        if (draft.cargo.dimensions?.heightMeters !== undefined) {
          setMachineryHeightMeters(draft.cargo.dimensions.heightMeters.toString());
        }
        if (draft.cargo.weightKg !== undefined) {
          setMachineryWeightTons(String(draft.cargo.weightKg / 1000));
        }
      }
      if (draft.cargo.type === 'CHEMICALS_PHARMA') {
        if (draft.cargo.weightKg !== undefined) {
          setChemicalsWeightTons(String(draft.cargo.weightKg / 1000));
        }
        if (draft.cargo.volumeCubicMeters !== undefined) {
          setChemicalsVolume(draft.cargo.volumeCubicMeters.toString());
        }
        if (draft.cargo.chemicalContainer) {
          setChemicalContainer(draft.cargo.chemicalContainer);
        }
      }
      if (draft.cargo.type === 'FOOD_BEVERAGE') {
        if (draft.cargo.weightKg !== undefined) {
          setFoodWeightTons(String(draft.cargo.weightKg / 1000));
        }
        if (draft.cargo.volumeCubicMeters !== undefined) {
          setFoodVolume(draft.cargo.volumeCubicMeters.toString());
        }
        if (draft.cargo.storageEnvironment) {
          setStorageEnvironment(draft.cargo.storageEnvironment);
        }
      }
      if (draft.cargo.type === 'GENERAL_CARGO' && draft.cargo.weightKg !== undefined) {
        setPackages([{
          id: "1",
          code: "",
          weight: draft.cargo.weightKg.toString(),
          length: draft.cargo.dimensions?.lengthMeters.toString() || "12",
          width: draft.cargo.dimensions?.widthMeters.toString() || "8",
          height: draft.cargo.dimensions?.heightMeters.toString() || "10",
        }]);
      }
      if (draft.offerPrice > 0) {
        setOfferPrice(draft.offerPrice);
      }
      if (draft.readyAt) {
        const rDate = toPickerValue(draft.readyAt, market);
        setPickupDate(rDate);
        if (!isImportFlow) {
          const hours = rDate.getHours();
          if (hours === 6) setPickupWindow("EARLY_MORNING");
          else if (hours === 10) setPickupWindow("MID_DAY");
          else if (hours === 14) setPickupWindow("AFTERNOON");
        }
      }
      if (draft.deadlineAt) {
        setDeliveryDate(toPickerValue(draft.deadlineAt, market));
        setTime(toPickerValue(draft.deadlineAt, market));
      }
    }
    // Hydrate from the draft only when the draft changes; re-running on an
    // isImportFlow change would overwrite what the shipper has typed since.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

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

  const cargoTypeStr = cargoLabel(selectedType);

  // Total weight in kg for every cargo type (sector forms collect tons).
  const totalWeightKg =
    selectedType === "GENERAL_CARGO"
      ? packages.reduce((acc, p) => acc + (parseFloat(p.weight) || 0), 0) || undefined
      : (parseFloat(totalWeight) || 0) * 1000 || undefined;

  const offer = recommendOffer(
    { type: selectedType, requiresFlatbedLowboy, requiresHydraulicTipper, storageEnvironment },
    market
  );

  const handleNextStep = () => {
    if (!isFormValid) return;

    const cargoDetails: CargoDetails = {
      type: selectedType,
      weightKg: totalWeightKg,
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
      const readyDate = atMarketTime(pickupDate!, 8);
      const deadlineDate = atMarketTime(deliveryDate!, time?.getHours() ?? 17, time?.getMinutes() ?? 0);

      setDraft({
        pickup: pickupLocation,
        dropoff: dropoffLocation,
        cargo: cargoDetails,
        offerPrice,
        isImport: true,
        readyAt: readyDate.toISOString(),
        deadlineAt: deadlineDate.toISOString(),
        // Keep what the shipper already entered in the document vault
        containerId: draft?.containerId,
        documents: draft?.documents ?? {},
      });

      setCurrentStep(3);
      router.push("/create-load/document-vault");
    } else {
      setIsReviewModalOpen(true);
    }
  };

  const handleFinalizeDomesticOrder = async () => {
    if (!isFormValid) return;

    const cargoDetails: CargoDetails = {
      type: selectedType,
      weightKg: totalWeightKg,
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

    const hour = pickupWindow === "EARLY_MORNING" ? 6 : pickupWindow === "MID_DAY" ? 10 : 14;
    const readyDate = atMarketTime(pickupDate!, hour);
    const deadlineDate = atMarketTime(deliveryDate!, time?.getHours() ?? 17, time?.getMinutes() ?? 0);

    setIsPosting(true);
    try {
      const { data } = await api.loads.store({
        body: newLoadBody({
          pickup: pickupLocation,
          dropoff: dropoffLocation,
          cargo: cargoDetails,
          offerPrice,
          isImport: false,
          readyAt: readyDate.toISOString(),
          deadlineAt: deadlineDate.toISOString(),
        }),
      });
      await api.loads.publish({ params: { id: data.id } });
      await invalidateLoads();

      setIsReviewModalOpen(false);
      resetRouteState();
      router.replace({ pathname: "/create-load/status", params: { state: "confirmed", trackingId: String(data.id) } });
    } catch (err) {
      Alert.alert("Couldn't post this load", apiErrorMessage(err));
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      <ScrollView ref={scrollViewRef} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 96 }]} showsVerticalScrollIndicator={false}>
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
                <Text variant="h3" tone="primary" style={styles.detailsTitle}>Heavy Machinery Details</Text>
                
                {/* Weight Input */}
                <TextField
                  label="Weight (Tons)"
                  value={machineryWeightTons}
                  onChangeText={setMachineryWeightTons}
                  keyboardType="numeric"
                  placeholder="20"
                  trailing={<Text variant="bodySm" tone="muted">Tons</Text>}
                />

                {/* Dimensions Safety Check (Optional Height & Width) */}
                <View style={styles.inputsRow}>
                  <View style={styles.halfInputContainer}>
                    <TextField
                      label="Max Width (m) (Optional)"
                      value={machineryWidthMeters}
                      onChangeText={setMachineryWidthMeters}
                      keyboardType="numeric"
                      placeholder="e.g. 3.2"
                      trailing={<Text variant="bodySm" tone="muted">m</Text>}
                    />
                  </View>

                  <View style={styles.halfInputContainer}>
                    <TextField
                      label="Max Height (m) (Optional)"
                      value={machineryHeightMeters}
                      onChangeText={setMachineryHeightMeters}
                      keyboardType="numeric"
                      placeholder="e.g. 4.1"
                      trailing={<Text variant="bodySm" tone="muted">m</Text>}
                    />
                  </View>
                </View>

                {/* Checkboxes Row */}
                <View style={styles.checkboxesRow}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityLabel="Requires Flatbed/Lowboy"
                    accessibilityState={{ checked: requiresFlatbedLowboy }}
                    style={({ pressed }) => [styles.checkboxItem, pressed && { opacity: 0.85 }]}
                    onPress={() => setRequiresFlatbedLowboy(!requiresFlatbedLowboy)}
                  >
                    <View style={styles.checkbox}>
                      {requiresFlatbedLowboy ? (
                        <CheckCircle size={20} color={colors.primary} />
                      ) : (
                        <View style={styles.checkboxOutline} />
                      )}
                    </View>
                    <Text variant="bodySm" tone="secondary" style={styles.checkboxLabel}>Requires Flatbed/Lowboy</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityLabel="Requires Hydraulic Tipper (Mechanical Dump)"
                    accessibilityState={{ checked: requiresHydraulicTipper }}
                    style={({ pressed }) => [styles.checkboxItem, pressed && { opacity: 0.85 }]}
                    onPress={() => setRequiresHydraulicTipper(!requiresHydraulicTipper)}
                  >
                    <View style={styles.checkbox}>
                      {requiresHydraulicTipper ? (
                        <CheckCircle size={20} color={colors.primary} />
                      ) : (
                        <View style={styles.checkboxOutline} />
                      )}
                    </View>
                    <Text variant="bodySm" tone="secondary" style={styles.checkboxLabel}>Requires Hydraulic Tipper (Mechanical Dump)</Text>
                  </Pressable>
                </View>

                {/* Soft Amber Notification Card */}
                <View style={styles.amberNotificationCard}>
                  <Text variant="caption" color={colors.warning}>
                    ℹ️ <Text variant="caption" color={colors.warning} style={styles.bold}>Zero-Rated Status:</Text> This cargo qualifies for GRA Tax Concessions. A GO-Invest letter will be required in the Document Vault.
                  </Text>
                </View>
              </View>
            )}

            {/* Chemicals & Pharma details card (Conditional) */}
            {selectedType === "CHEMICALS_PHARMA" && (
              <View style={styles.detailsCard}>
                <Text variant="h3" tone="primary" style={styles.detailsTitle}>Chemicals & Pharma Details</Text>
                
                {/* Weight and Volume Inputs */}
                <View style={styles.inputsRow}>
                  <View style={styles.halfInputContainer}>
                    <TextField
                      label="Weight (Tons)"
                      value={chemicalsWeightTons}
                      onChangeText={setChemicalsWeightTons}
                      keyboardType="numeric"
                      placeholder="20"
                      trailing={<Text variant="bodySm" tone="muted">Tons</Text>}
                    />
                  </View>

                  <View style={styles.halfInputContainer}>
                    <TextField
                      label="Volume (m³)"
                      value={chemicalsVolume}
                      onChangeText={setChemicalsVolume}
                      keyboardType="numeric"
                      placeholder="15"
                      trailing={<Text variant="bodySm" tone="muted">m³</Text>}
                    />
                  </View>
                </View>

                {/* High Visibility Warning Banner */}
                <View style={styles.containerSelectionSection}>
                  <Text variant="label" tone="secondary">Containment Unit (Optional)</Text>
                  <ChipGroup
                    options={[
                      { value: "TANKER", label: "Tanker" },
                      { value: "IBC_TOTES", label: "IBC Totes" },
                      { value: "DRUMS", label: "Drums" },
                      { value: "PALLETS", label: "Pallets" },
                    ]}
                    value={chemicalContainer}
                    onChange={(unit) => setChemicalContainer(chemicalContainer === unit ? null : unit)}
                  />
                </View>

                {/* High Visibility Warning Banner */}
                <View style={styles.redWarningBanner}>
                  <Text variant="caption" color={colors.danger}>
                    ⚠️ <Text variant="caption" color={colors.danger} style={styles.bold}>Hazard Tracking:</Text> This load requires verified clearance from the Pesticide, Toxic Chemicals Control Department (PTCCD).
                  </Text>
                </View>
              </View>
            )}

            {/* Food & Beverages details card (Conditional) */}
            {selectedType === "FOOD_BEVERAGE" && (
              <View style={styles.detailsCard}>
                <Text variant="h3" tone="primary" style={styles.detailsTitle}>Food & Beverages Details</Text>
                
                {/* Weight and Volume Inputs */}
                <View style={styles.inputsRow}>
                  <View style={styles.halfInputContainer}>
                    <TextField
                      label="Weight (Tons)"
                      value={foodWeightTons}
                      onChangeText={setFoodWeightTons}
                      keyboardType="numeric"
                      placeholder="20"
                      trailing={<Text variant="bodySm" tone="muted">Tons</Text>}
                    />
                  </View>

                  <View style={styles.halfInputContainer}>
                    <TextField
                      label="Volume (m³)"
                      value={foodVolume}
                      onChangeText={setFoodVolume}
                      keyboardType="numeric"
                      placeholder="15"
                      trailing={<Text variant="bodySm" tone="muted">m³</Text>}
                    />
                  </View>
                </View>

                {/* Segmented Control Storage Environment */}
                <View style={styles.storageControlContainer}>
                  <Text variant="label" tone="secondary">Storage Environment</Text>
                  <SegmentedControl
                    accessibilityLabel="Storage Environment"
                    options={(["AMBIENT", "CHILLED", "FROZEN"] as const).map((env) => ({
                      value: env,
                      label: env.charAt(0) + env.slice(1).toLowerCase(),
                    }))}
                    value={storageEnvironment}
                    onChange={setStorageEnvironment}
                  />
                </View>

                {/* Informative Text Block */}
                <View style={styles.blueInfoBlock}>
                  <Text variant="caption" color={colors.info}>
                    ℹ️ <Text variant="caption" color={colors.info} style={styles.bold}>GA-FDD Regulations:</Text> Requires certified safe-handling paperwork or US FDA state commerce certificates.
                  </Text>
                </View>
              </View>
            )}

            {/* Your Own Package (Only visible for General Cargo) */}
            {selectedType === "GENERAL_CARGO" && (
              <View style={styles.sectionContainer}>
                <Text variant="h3" tone="primary">Your own package</Text>
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
                <Button
                  title="Add package"
                  variant="secondary"
                  size="sm"
                  icon={Plus}
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
                />
              </View>
            )}
          </>
        )}

        {subStep === 2 && (
          <>
            {/* Date Time Picker Section */}
            <DateTimePickerSection
              pickupDate={pickupDate}
              setPickupDate={setPickupDate}
              pickupWindow={pickupWindow}
              setPickupWindow={setPickupWindow}
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              time={time}
              setTime={setTime}
              isImportFlow={isImportFlow}
            />

            {/* Back action */}
            <Button
              title="← Back to Cargo Details"
              variant="ghost"
              size="md"
              style={styles.backLinkButton}
              onPress={() => {
                setSubStep(1);
                scrollViewRef.current?.scrollTo({ y: 0, animated: false });
              }}
            />
          </>
        )}

        {subStep === 3 && (
          <>
            {/* Recommended Offer */}
            <OfferSlider
              value={offerPrice}
              onChange={setOfferPrice}
              offer={offer}
              market={market}
            />

            {/* Back action */}
            <Button
              title="← Back to Booking Schedule"
              variant="ghost"
              size="md"
              style={styles.backLinkButton}
              onPress={() => {
                setSubStep(2);
                scrollViewRef.current?.scrollTo({ y: 0, animated: false });
              }}
            />
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom Next/Finalize Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.lg }]}>
        {subStep === 1 ? (
          <Button
            title="Next: Booking schedule"
            onPress={() => {
              setSubStep(2);
              scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            }}
            disabled={!isFormValid}
          />
        ) : subStep === 2 ? (
          <Button
            title="Next: Set offer"
            onPress={() => {
              setSubStep(3);
              scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            }}
            disabled={!isFormValid || !pickupDate || !deliveryDate || !time || (!isImportFlow && !pickupWindow)}
          />
        ) : (
          <Button
            title={isImportFlow ? "Next: Document vault" : "Request pickup"}
            onPress={handleNextStep}
            disabled={!isFormValid || !pickupDate || !deliveryDate || !time || (!isImportFlow && !pickupWindow)}
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

        <View style={styles.finalizeWrap}>
          <Button
            title="Finalize order"
            onPress={handleFinalizeDomesticOrder}
            loading={isPosting}
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
  scrollContent: {
    padding: layout.gutter,
    gap: spacing["2xl"],
  },
  sectionContainer: {
    gap: spacing.md,
  },
  packagesList: {
    gap: spacing.lg,
  },
  addPackageButton: {
    alignSelf: "flex-start",
    marginTop: spacing.xs,
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
  finalizeWrap: {
    marginTop: spacing.sm,
  },
  detailsCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
  },
  detailsTitle: {
    marginBottom: spacing.xs,
  },
  bold: {
    fontFamily: fontFamily.bold,
  },
  checkboxesRow: {
    flexDirection: "column",
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: layout.touchMin,
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
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.textPlaceholder,
  },
  checkboxLabel: {
    flex: 1,
  },
  amberNotificationCard: {
    backgroundColor: colors.warningMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  redWarningBanner: {
    backgroundColor: colors.dangerMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  blueInfoBlock: {
    backgroundColor: colors.infoMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  inputsRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  halfInputContainer: {
    flex: 1,
  },
  storageControlContainer: {
    gap: spacing.sm,
  },
  containerSelectionSection: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  backLinkButton: {
    marginTop: spacing.sm,
  },
});
