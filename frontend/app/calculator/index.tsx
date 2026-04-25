import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AlignLeft } from "lucide-react-native";
import Slider from "@react-native-community/slider";

export default function CalculatorInputScreen() {
  const router = useRouter();

  const [distance, setDistance] = useState(150); // km
  const [weight, setWeight] = useState(10); // tons
  const [truckType, setTruckType] = useState("Canter"); // Pickup, Canter, Fuso, Trailer
  const [urgency, setUrgency] = useState(0); // %

  const truckOptions = ["Pickup", "Canter", "Fuso", "Trailer"];

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <AlignLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculate{"\n"}Fair Price</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Distance Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Distance</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.prefix}>km</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={distance.toString()}
              onChangeText={(text) => setDistance(Number(text) || 0)}
            />
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1000}
              step={1}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor="#0F3D26"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#0F3D26"
            />
          </View>
        </View>

        {/* Cargo Weight Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Cargo Weight</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.prefix}>tons</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={weight.toString()}
              onChangeText={(text) => setWeight(Number(text) || 0)}
            />
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={40}
              step={0.5}
              value={weight}
              onValueChange={setWeight}
              minimumTrackTintColor="#0F3D26"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#0F3D26"
            />
          </View>
        </View>

        {/* Truck Type Field (Toggles) */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Truck Type</Text>
          </View>
          <View style={styles.pillsRow}>
            {truckOptions.map((type) => (
              <TouchableOpacity
                key={type}
                activeOpacity={0.8}
                onPress={() => setTruckType(type)}
                style={[
                  styles.pill,
                  truckType === type ? styles.pillActive : styles.pillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    truckType === type
                      ? styles.pillTextActive
                      : styles.pillTextInactive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Urgency / Demand Premium Field */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Urgency Premium</Text>
            <Text style={styles.fieldUnit}>%</Text>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={urgency.toString()}
              onChangeText={(text) => setUrgency(Number(text) || 0)}
            />
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={50}
              step={1}
              value={urgency}
              onValueChange={setUrgency}
              minimumTrackTintColor="#0F3D26"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#0F3D26"
            />
          </View>
        </View>

        {/* Bottom Calculate Button */}
        <TouchableOpacity
          style={styles.calculateButton}
          activeOpacity={0.8}
          onPress={handleCalculate}
        >
          <Text style={styles.calculateButtonText}>Calculate</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5E9", // brand off-white
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 32,
  },
  menuButton: {
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1F2937",
    lineHeight: 34,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 32,
  },
  fieldContainer: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 8,
  },
  fieldUnit: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  prefix: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500",
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  sliderContainer: {
    marginTop: -12, // Pull slider up to overlap the input box bottom border
    marginHorizontal: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  pillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: "#0F3D26",
  },
  pillInactive: {
    backgroundColor: "#F3F4F6", // light gray
  },
  pillText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  pillTextInactive: {
    color: "#6B7280",
  },
  calculateButton: {
    backgroundColor: "#1F2937", // Dark color from the mockup, though we can use 0F3D26
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  calculateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
