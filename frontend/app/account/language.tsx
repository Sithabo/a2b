import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function LanguageScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español (Coming Soon)", disabled: true },
    { code: "fr", name: "French", nativeName: "Français (Coming Soon)", disabled: true },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.whiteAsh || "#F9FAFB" }]}>
      <ScreenHeader
        title="Language"
        subtitle="Select your preferred language"
        onBackPress={() => router.replace("/(tabs)/account")}
        onCancelPress={() => router.replace("/(tabs)/account")}
      />

      <View style={styles.content}>
        <View style={styles.card}>
          {languages.map((lang, index) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <View key={lang.code}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={[styles.rowItem, lang.disabled && styles.rowItemDisabled]}
                  activeOpacity={lang.disabled ? 1 : 0.7}
                  onPress={() => !lang.disabled && setSelectedLanguage(lang.code)}
                  disabled={lang.disabled}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.langName}>{lang.name}</Text>
                    <Text style={styles.nativeName}>({lang.nativeName})</Text>
                  </View>
                  {isSelected && <Check size={20} color="#0F3D26" strokeWidth={3} />}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  rowItemDisabled: {
    opacity: 0.5,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  nativeName: {
    fontSize: 14,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
});
