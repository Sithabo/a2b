import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  MapPin,
  Navigation,
  Package,
  Scale,
  Banknote,
  Info,
  ArrowRight,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function CreateLoadScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [selectedType, setSelectedType] = useState("Sacks");

  const loadTypes = ["Sacks", "Boxes", "Machinery", "Furniture"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader
        title="Post a Load"
        subtitle="Tell us what you need to ship"
        showBackButton
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Locations Card */}
        <Card style={styles.cardSpace}>
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MapPin size={14} color="#0F3D26" />
              <Text style={styles.labelText}>Pickup Location</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., Kampala, Makindye District"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Connector Line */}
          <View style={styles.connectorLine} />

          <View style={styles.inputGroupRelative}>
            <View style={styles.labelContainer}>
              <Navigation size={14} color="#D97706" />
              <Text style={styles.labelText}>Delivery Location</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., Jinja, Industrial Area"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </Card>

        {/* Load Details Card */}
        <Card style={styles.cardSpace}>
          <View>
            <View style={styles.labelContainer}>
              <Package size={14} color="#6B7280" />
              <Text style={styles.labelText}>Load Details</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., Rice bags (50kg x 10)"
              placeholderTextColor="#9CA3AF"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              {loadTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={[
                    styles.chip,
                    selectedType === type
                      ? styles.chipSelected
                      : styles.chipUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedType === type
                        ? styles.chipTextSelected
                        : styles.chipTextUnselected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.marginTop}>
            <View style={styles.labelContainer}>
              <Scale size={14} color="#6B7280" />
              <Text style={styles.labelText}>Weight</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500 kg"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </Card>

        {/* Offer Price Card */}
        <Card>
          <View style={styles.labelContainer}>
            <Banknote size={14} color="#D97706" />
            <Text style={styles.labelText}>Your Offer Price (UGX)</Text>
          </View>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="150,000"
              keyboardType="numeric"
              placeholderTextColor="#D1D5DB"
            />
            <View style={styles.currencyLabel}>
              <Text style={styles.currencyText}>UGX</Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Info size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              This is what drivers will see and decide to accept.
            </Text>
          </View>
        </Card>

        {/* Notes Card */}
        <Card>
          <Text style={[styles.labelText, styles.marginBottom]}>
            Notes (Optional)
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., Handle with care, fragile items..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Next: Review Offer"
          onPress={() => router.push("/create-load/review")}
          icon={ArrowRight}
        />
      </View>
    </View>
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
