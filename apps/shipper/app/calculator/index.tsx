import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AlignLeft } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import {
  Button,
  IconButton,
  SegmentedControl,
  Text,
  TextField,
  colors,
  layout,
  spacing,
} from "@a2b/ui";
import { vehicleClasses, type VehicleClass } from "@a2b/core";

export default function CalculatorInputScreen() {
  const router = useRouter();

  const [distance, setDistance] = useState(150); // km
  const [weight, setWeight] = useState(10); // tons
  const [truckType, setTruckType] = useState<VehicleClass>("CANTER");
  const [urgency, setUrgency] = useState(0); // %

  const truckOptions = Object.keys(vehicleClasses) as VehicleClass[];

  const handleCalculate = () => {
    // Phase 4 will connect this logic, for now we navigate to results with params
    router.push({
      pathname: "/calculator/results",
      params: { distance, weight, truckType, urgency },
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} />

      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={AlignLeft}
          variant="plain"
          size={layout.touchMin}
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <Text variant="display">Calculate{"\n"}Fair Price</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Distance Field */}
        <View style={styles.fieldContainer}>
          <TextField
            label="Distance"
            leading={<Text tone="muted">km</Text>}
            keyboardType="numeric"
            value={distance.toString()}
            onChangeText={(text) => setDistance(Number(text) || 0)}
          />
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1000}
              step={1}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
              accessibilityLabel="Distance in kilometres"
            />
          </View>
        </View>

        {/* Cargo Weight Field */}
        <View style={styles.fieldContainer}>
          <TextField
            label="Cargo Weight"
            leading={<Text tone="muted">tons</Text>}
            keyboardType="numeric"
            value={weight.toString()}
            onChangeText={(text) => setWeight(Number(text) || 0)}
          />
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={40}
              step={0.5}
              value={weight}
              onValueChange={setWeight}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
              accessibilityLabel="Cargo weight in tons"
            />
          </View>
        </View>

        {/* Truck Type Field (Toggles) */}
        <View style={styles.fieldContainer}>
          <Text variant="label" tone="secondary" style={styles.fieldLabel}>
            Truck Type
          </Text>
          <SegmentedControl
            accessibilityLabel="Truck type"
            options={truckOptions.map((type) => ({ value: type, label: vehicleClasses[type].label }))}
            value={truckType}
            onChange={setTruckType}
          />
        </View>

        {/* Urgency / Demand Premium Field */}
        <View style={styles.fieldContainer}>
          <TextField
            label="Urgency Premium"
            trailing={<Text tone="muted">%</Text>}
            keyboardType="numeric"
            value={urgency.toString()}
            onChangeText={(text) => setUrgency(Number(text) || 0)}
          />
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={50}
              step={1}
              value={urgency}
              onValueChange={setUrgency}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
              accessibilityLabel="Urgency premium percent"
            />
          </View>
        </View>

        {/* Bottom Calculate Button */}
        <Button title="Calculate" onPress={handleCalculate} style={styles.calculateButton} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    // The 48pt icon button pads its 24pt icon by 12, so the icon lines up with the content gutter.
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["4xl"],
    gap: spacing["3xl"],
  },
  fieldContainer: {
    width: "100%",
  },
  fieldLabel: {
    marginBottom: spacing.sm,
  },
  sliderContainer: {
    marginTop: -spacing.md, // Pull slider up to overlap the input box bottom border
    marginHorizontal: spacing.sm,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  calculateButton: {
    marginTop: spacing.lg,
  },
});
